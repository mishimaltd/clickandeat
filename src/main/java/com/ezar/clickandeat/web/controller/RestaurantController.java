package com.ezar.clickandeat.web.controller;

import com.ezar.clickandeat.config.MessageFactory;
import com.ezar.clickandeat.maps.GeoLocationService;
import com.ezar.clickandeat.model.*;
import com.ezar.clickandeat.notification.IEmailService;
import com.ezar.clickandeat.repository.OrderRepository;
import com.ezar.clickandeat.repository.RestaurantRepository;
import com.ezar.clickandeat.util.CuisineProvider;
import com.ezar.clickandeat.util.JSONUtils;
import com.ezar.clickandeat.util.ResponseEntityUtils;
import com.ezar.clickandeat.validator.RestaurantValidator;
import com.ezar.clickandeat.validator.ValidationErrors;
import com.ezar.clickandeat.web.controller.helper.Filter;
import com.ezar.clickandeat.web.controller.helper.FilterUtils;
import com.ezar.clickandeat.web.controller.helper.FilterValueDecorator;
import com.opensymphony.module.sitemesh.RequestConstants;
import org.apache.log4j.Logger;
import org.joda.time.DateTime;
import org.joda.time.LocalTime;
import org.joda.time.MutableDateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.lang.reflect.Field;
import java.util.*;

import static org.springframework.data.domain.Sort.Direction.ASC;
import static org.springframework.data.domain.Sort.Direction.DESC;

@Controller
public class RestaurantController {

    private static final Logger LOGGER = Logger.getLogger(RestaurantController.class);

    private static final DateTimeFormatter formatter = DateTimeFormat.forPattern("HH:mm");
    
    @Autowired
    private RestaurantRepository repository;

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private JSONUtils jsonUtils;

    @Autowired
    private ResponseEntityUtils responseEntityUtils;

    @Autowired
    private RestaurantValidator restaurantValidator;

    @Autowired
    private GeoLocationService geoLocationService;

    @Autowired
    private IEmailService emailService;

    @Autowired
    private CuisineProvider cuisineProvider;

    private final Map<String,FilterValueDecorator> filterDecoratorMap = new HashMap<String, FilterValueDecorator>();

    @RequestMapping(value="/**/restaurant/{restaurantId}", method = RequestMethod.GET)
    public ModelAndView get(@PathVariable("restaurantId") String restaurantId, HttpServletRequest request) {

        if( LOGGER.isDebugEnabled()) {
            LOGGER.debug("Retrieving restaurant with id [" + restaurantId + "]");
        }

        Map<String,Object> model = getModel();
        HttpSession session = request.getSession(true);
        Restaurant restaurant = repository.findByRestaurantId(restaurantId);
        if(!restaurant.getListOnSite()) {
            return new ModelAndView("redirect:/home.html",null);
        }
        model.put("restaurant",restaurant);

        String restaurantSessionId = (String)session.getAttribute("restaurantid");
        
        // If no order associated with the session, create now
        String orderId = (String)session.getAttribute("orderid");
        if( orderId == null ) {
            Order order = buildAndRegister(session, restaurant);
            session.setAttribute("orderid",order.getOrderId());
        }
        else {
            // If the restaurant session id is different from the restaurant id, update the order
            if( !restaurantId.equals(restaurantSessionId)) {
                // If there is no order restaurant session id present then the order is empty and we can update it
                if( session.getAttribute("orderrestaurantid") == null ) {
                    Order order = orderRepository.findByOrderId(orderId);
                    if( order == null ) {
                        order = buildAndRegister(session, restaurant);
                        session.setAttribute("orderid",order.getOrderId());
                    }
                    order.setRestaurant(restaurant);
                    orderRepository.save(order);
                }
            }
        }

        // Update the restaurant session id
        if( restaurantSessionId == null || !(restaurantSessionId.equals(restaurantId))) {
            session.setAttribute("restaurantid", restaurantId);
            session.setAttribute("restauranturl", restaurant.getUrl());
        }

        return new ModelAndView("restaurant",model);
    }


    @SuppressWarnings("unchecked")
    @ResponseBody
    @RequestMapping(value="/restaurant/getOpeningTimes.ajax", method = RequestMethod.POST )
    public ResponseEntity<byte[]> getOpeningTimes(@RequestParam(value = "restaurantId") String restaurantId ) throws Exception {
        
        Map<String,Object> model = new HashMap<String,Object>();
        
        try {
            Restaurant restaurant = repository.findByRestaurantId(restaurantId);
            OpeningTimes openingTimes = restaurant.getOpeningTimes();
            Map<String,String> dailyOpeningTimes = new LinkedHashMap<String, String>();
            MutableDateTime dateTime = new MutableDateTime();
            for( OpeningTime openingTime: openingTimes.getOpeningTimes() ) {
                
                int dayOfWeek = openingTime.getDayOfWeek();
                boolean open = openingTime.isOpen();
                dateTime.setDayOfWeek(dayOfWeek);

                LocalTime earlyOpeningTime = openingTime.getEarlyOpeningTime();
                LocalTime earlyClosingTime = openingTime.getEarlyClosingTime();
                LocalTime lateOpeningTime = openingTime.getLateOpeningTime();
                LocalTime lateClosingTime = openingTime.getLateClosingTime();

                boolean hasEarlyTimes = (earlyOpeningTime != null && earlyClosingTime != null);
                boolean hasLateTimes = (lateOpeningTime != null && lateClosingTime != null);

                String openingTimeSummary;
                
                if( !open || (!hasEarlyTimes && !hasLateTimes) ) {
                    openingTimeSummary = MessageFactory.getMessage("restaurant.closed",false);
                }
                else if( hasEarlyTimes && !hasLateTimes ) {
                    openingTimeSummary = earlyOpeningTime.toString(formatter) + "-" + earlyClosingTime.toString(formatter);
                }
                else if( !hasEarlyTimes ) {
                    openingTimeSummary = lateOpeningTime.toString(formatter) + "-" + lateClosingTime.toString(formatter);
                }
                else {
                    openingTimeSummary = earlyOpeningTime.toString(formatter) + "-" + earlyClosingTime.toString(formatter) + " | " + lateOpeningTime.toString(formatter) + "-" + lateClosingTime.toString(formatter);
                }

                String weekDay = dateTime.dayOfWeek().getAsText(MessageFactory.getLocale());
                dailyOpeningTimes.put(weekDay, openingTimeSummary);
            }
            
            OpeningTime bankHolidayOpeningTime = openingTimes.getBankHolidayOpeningTimes();

            boolean open = bankHolidayOpeningTime.isOpen();
            LocalTime earlyOpeningTime = bankHolidayOpeningTime.getEarlyOpeningTime();
            LocalTime earlyClosingTime = bankHolidayOpeningTime.getEarlyClosingTime();
            LocalTime lateOpeningTime = bankHolidayOpeningTime.getLateOpeningTime();
            LocalTime lateClosingTime = bankHolidayOpeningTime.getLateClosingTime();

            boolean hasEarlyTimes = (earlyOpeningTime != null && earlyClosingTime != null);
            boolean hasLateTimes = (lateOpeningTime != null && lateClosingTime != null);

            String openingTimeSummary;

            if( !open || (!hasEarlyTimes && !hasLateTimes) ) {
                openingTimeSummary = MessageFactory.getMessage("restaurant.closed",false);
            }
            else if( hasEarlyTimes && !hasLateTimes ) {
                openingTimeSummary = earlyOpeningTime.toString(formatter) + "-" + earlyClosingTime.toString(formatter);
            }
            else if( !hasEarlyTimes ) {
                openingTimeSummary = lateOpeningTime.toString(formatter) + "-" + lateClosingTime.toString(formatter);
            }
            else {
                openingTimeSummary = earlyOpeningTime.toString(formatter) + "-" + earlyClosingTime.toString(formatter) + " | " + lateOpeningTime.toString(formatter) + "-" + lateClosingTime.toString(formatter);
            }
            String bankHolidays = MessageFactory.getMessage("weekday.bankHoliday",false);
            dailyOpeningTimes.put(bankHolidays, openingTimeSummary);

            model.put("success",true);
            model.put("openingTimes",dailyOpeningTimes);
        }
        catch( Exception ex ) {
            model.put("success",false);
            model.put("message",ex.getMessage());
        }
        return responseEntityUtils.buildResponse(model);
    }


    @SuppressWarnings("unchecked")
    @ResponseBody
    @RequestMapping(value="/restaurant/getDeliveryCharges.ajax", method = RequestMethod.POST )
    public ResponseEntity<byte[]> getDeliveryCharges(@RequestParam(value = "restaurantId") String restaurantId ) throws Exception {

        Map<String,Object> model = new HashMap<String,Object>();

        try {
            Restaurant restaurant = repository.findByRestaurantId(restaurantId);
            DeliveryOptions deliveryOptions = restaurant.getDeliveryOptions();
            model.put("deliveryCharge",deliveryOptions.getDeliveryCharge());
            model.put("minimumOrderForDelivery",deliveryOptions.getMinimumOrderForDelivery());
            model.put("minimumOrderForFreeDelivery", deliveryOptions.getMinimumOrderForFreeDelivery());
            model.put("allowFreeDelivery", deliveryOptions.isAllowFreeDelivery());
            model.put("variableDeliveryCharges", deliveryOptions.getVariableDeliveryCharges());
            SortedMap<String,Double[]> areaCharges = new TreeMap<String, Double[]>();
            
            for( AreaDeliveryCharge deliveryCharge: deliveryOptions.getAreaDeliveryCharges()) {
                for( String area: deliveryCharge.getAreas()) {
                    Double[] charges = areaCharges.get(area);
                    if( charges == null ) {
                        charges = new Double[2];
                        areaCharges.put(area,charges);
                    }
                    charges[0] = deliveryCharge.getDeliveryCharge();
                }
            }

            for( AreaDeliveryCharge deliveryCharge: deliveryOptions.getAreaMinimumOrderCharges()) {
                for( String area: deliveryCharge.getAreas()) {
                    Double[] charges = areaCharges.get(area);
                    if( charges == null ) {
                        charges = new Double[2];
                        areaCharges.put(area,charges);
                    }
                    charges[1] = deliveryCharge.getDeliveryCharge();
                }
            }

            model.put("areaDeliveryCharges",areaCharges);
            model.put("success",true);
        }
        catch( Exception ex ) {
            model.put("success",false);
            model.put("message",ex.getMessage());
        }
        return responseEntityUtils.buildResponse(model);

    }


    @RequestMapping(value="/**/contact/{restaurantId}/**", method = RequestMethod.GET )
    public ModelAndView getContactTelephone(@PathVariable("restaurantId") String restaurantId, HttpServletRequest request ) throws Exception {
        Map<String,Object> model = new HashMap<String, Object>();
        Restaurant restaurant = repository.findByRestaurantId(restaurantId);
        model.put("telephone",restaurant.getContactTelephone());
        request.setAttribute(RequestConstants.DECORATOR, "blank");
        
        // Update the order to indicate that the phone number was viewed
        HttpSession session = request.getSession(true);
        String orderId = (String)session.getAttribute("orderid");
        if( orderId != null ) {
            Order order = orderRepository.findByOrderId(orderId);
            order.setPhoneNumberViewed(true);
            orderRepository.saveOrder(order);
            LOGGER.info("Marked phone number viewed in order id: " + orderId);
        }

        return new ModelAndView(MessageFactory.getLocaleString() + "/contactTelephone",model);
    }


    @SuppressWarnings("unchecked")
    @ResponseBody
    @RequestMapping(value="/admin/restaurants/list.ajax", method = RequestMethod.GET )
    public ResponseEntity<byte[]> list(@RequestParam(value = "page") int page, @RequestParam(value = "start") int start,
                                       @RequestParam(value = "limit") int limit, @RequestParam(value="sort", required = false) String sort,
                                       @RequestParam(value = "query", required = false) String query, HttpServletRequest req) throws Exception {

        PageRequest request;

        if( StringUtils.hasText(sort)) {
            List<Map<String,String>> sortParams = (List<Map<String,String>>)jsonUtils.deserialize(sort);
            Map<String,String> sortProperties = sortParams.get(0);
            String direction = sortProperties.get("direction");
            String property = sortProperties.get("property");
            request = new PageRequest(page - 1, limit, ( "ASC".equals(direction)? ASC : DESC ), property );
        }
        else {
            request = new PageRequest(page - 1, limit );
        }

        List<Filter> filters = FilterUtils.extractFilters(req, filterDecoratorMap);
        List<Restaurant> restaurants = repository.pageByRestaurantName(request,query,filters);
        Map<String,Object> model = new HashMap<String,Object>();
        model.put("restaurants",restaurants);
        model.put("count",repository.count(query, filters));
        String[] excludes = new String[]{"restaurants.menu","restaurants.specialOffers","restaurants.discounts",
                "restaurants.firstDiscount","restaurants.openingTimes"};
        return responseEntityUtils.buildResponse(model,excludes);
    }


    @SuppressWarnings("unchecked")
    @ResponseBody
    @RequestMapping(value="/admin/restaurants/quickLaunch.ajax", method = RequestMethod.GET )
    public ResponseEntity<byte[]> quickLaunch() throws Exception {
        List<Restaurant> restaurants = repository.quickLaunch();
        Map<String,Object> model = new HashMap<String,Object>();
        model.put("restaurants",restaurants);
        model.put("count",restaurants.size());
        String[] excludes = new String[]{"restaurants.menu","restaurants.specialOffers","restaurants.discounts",
                "restaurants.firstDiscount","restaurants.openingTimes","restaurants.deliveryOptions",
                "restaurants.notificationOptions","restaurants.address"};
        return responseEntityUtils.buildResponse(model,excludes);
    }

    
    @RequestMapping(value="/admin/restaurants/edit.html", method = RequestMethod.GET )
    public ModelAndView edit(@RequestParam(value = "restaurantId", required = false) String restaurantId) {

        if( LOGGER.isDebugEnabled()) {
            LOGGER.debug("Editing restaurant with id [" + restaurantId + "]");
        }

        Map<String,Object> model = getModel();
        model.put("restaurantId",restaurantId);
        return new ModelAndView("admin/editRestaurant",model);
    }


    @ResponseBody
    @RequestMapping(value="/admin/restaurants/create.ajax", method = RequestMethod.POST )
    public ResponseEntity<byte[]> create() throws Exception {
        Map<String,Object> model = getModel();
        Restaurant restaurant = repository.create();
        model.put("success",true);
        model.put("restaurant", jsonUtils.serializeAndEscape(restaurant));
        return responseEntityUtils.buildResponse(model);
    }


    @ResponseBody
    @RequestMapping(value="/admin/restaurants/setLocalOrigin.ajax", method = RequestMethod.POST )
    public ResponseEntity<byte[]> setLocalOrigin(@RequestParam(value = "restaurantId") String restaurantId) throws Exception {
        Map<String,Object> model = new HashMap<String, Object>();

        try {
            Restaurant restaurant = repository.findByRestaurantId(restaurantId);
            restaurant.setExternalId(null);
            repository.saveRestaurant(restaurant);
            model.put("success",true);
        }
        catch( Exception ex ) {
            LOGGER.error("",ex);
            model.put("success",false);
            model.put("message",ex.getMessage());
        }
        return responseEntityUtils.buildResponse(model);
    }


    @ResponseBody
    @RequestMapping(value="/admin/restaurants/load.ajax", method = RequestMethod.POST )
    public ResponseEntity<byte[]> load(@RequestParam(value = "restaurantId") String restaurantId) throws Exception {

        Map<String,Object> model = new HashMap<String, Object>();

        try {
            Restaurant restaurant = repository.findByRestaurantId(restaurantId);
            model.put("success",true);
            model.put("id",restaurant.getId());
            model.put("restaurant",jsonUtils.serializeAndEscape(restaurant));
        }
        catch( Exception ex ) {
            LOGGER.error("",ex);
            model.put("success",false);
            model.put("message",ex.getMessage());
        }
        return responseEntityUtils.buildResponse(model);
    }


    @ResponseBody
    @RequestMapping(value="/admin/restaurants/save.ajax", method = RequestMethod.POST )
    public ResponseEntity<byte[]> save(@RequestParam(value = "body") String body) throws Exception {

        Map<String,Object> model = new HashMap<String, Object>();

        try {
            Restaurant restaurant = jsonUtils.deserialize(Restaurant.class,body);
            
            // Validate restaurant
            ValidationErrors errors = restaurantValidator.validate(restaurant);
            if( errors.hasErrors()) {
                model.put("success",false);
                model.put("message",errors.getErrorSummary());
            }
            else {
                restaurant = repository.saveRestaurant(restaurant);
                model.put("success",true);
                model.put("id",restaurant.getId());
                model.put("restaurant",restaurant);
            }
        }
        catch( Exception ex ) {
            LOGGER.error("Error occurred saving restaurant:\n" + body,ex);
            model.put("success",false);
            model.put("message",ex.getMessage());
        }
        return responseEntityUtils.buildResponse(model);
    }


    @ResponseBody
    @RequestMapping(value="/admin/restaurants/updateAttribute.ajax", method = RequestMethod.POST )
    public ResponseEntity<byte[]> updateAttribute(@RequestParam(value = "restaurantId") String restaurantId,
                                                  @RequestParam(value = "attribute") String attribute,
                                                  @RequestParam(value = "value") Boolean value) throws Exception {

        Map<String,Object> model = new HashMap<String, Object>();

        try {
            Restaurant restaurant = repository.findByRestaurantId(restaurantId);
            Field field = Restaurant.class.getDeclaredField(attribute);
            field.setAccessible(true);
            field.set(restaurant,value);
            repository.saveRestaurant(restaurant);
            model.put("success",true);
        }
        catch( Exception ex ) {
            LOGGER.error("",ex);
            model.put("success",false);
            model.put("message",ex.getMessage());
        }
        return responseEntityUtils.buildResponse(model);
    }

    @ResponseBody
    @RequestMapping(value="/admin/restaurants/showLocation.ajax", method = RequestMethod.POST )
    public ResponseEntity<byte[]> showLocation(@RequestParam(value = "address") String address) throws Exception {
        
        Map<String,Object> model = new HashMap<String, Object>();
        try {
            GeoLocation geoLocation = geoLocationService.getLocation(address);
            if( geoLocation == null ) {
                throw new IllegalArgumentException("Could not get location from google for address");
            }
            else if( !address.toUpperCase().contains(geoLocation.getLocationComponents().get("postal_code"))) {
                throw new IllegalArgumentException("Google lookup returned address with postal code: " + geoLocation.getLocationComponents().get("postal_code"));
            }
            else {
                model.put("success",true);
                model.put("lat",geoLocation.getLocation()[0]);
                model.put("lng",geoLocation.getLocation()[1]);
            }
        }
        catch( Exception ex ) {
            LOGGER.error("",ex);
            model.put("success",false);
            model.put("message",ex.getMessage());
        }
        return responseEntityUtils.buildResponse(model);
    }

    @ResponseBody
    @RequestMapping(value="/admin/restaurants/copyMenu.ajax", method = RequestMethod.POST )
    public ResponseEntity<byte[]> updateAttribute(@RequestParam(value = "sourceRestaurantId") String sourceRestaurantId,
                                                  @RequestParam(value = "targetRestaurantId") String targetRestaurantId) throws Exception {

        Map<String,Object> model = new HashMap<String, Object>();

        try {
            Restaurant sourceRestaurant = repository.findByRestaurantId(sourceRestaurantId);
            Restaurant targetRestaurant = repository.findByRestaurantId(targetRestaurantId);
            //Abort if we cannot find the restaurant whose menu we want to copy
            if(sourceRestaurant == null){
                model.put("success",false);
                model.put("message",MessageFactory.getMessage("restaurant.admin.copy-menu.source-restaurant-missing",true));
                //Abort if we cannot find the restaurant that will receive the menu
            }else if(targetRestaurant == null){
                model.put("success",false);
                model.put("message",MessageFactory.getMessage("restaurant.admin.copy-menu.target-restaurant-missing",true));
            }else{
                targetRestaurant.setMenu(sourceRestaurant.getMenu());
                targetRestaurant.addRestaurantUpdate("Copied menu from restaurant:["+sourceRestaurant.getName()+"].");
                repository.saveRestaurant(targetRestaurant);
                if( LOGGER.isDebugEnabled()) {
                    LOGGER.debug("Menu from restaurant ["+sourceRestaurant.getName()+"] copied to restaurant ["+targetRestaurant.getName()+"]");
                    // Add an update to the restaurant

                }

                model.put("success",true);
            }


        }
        catch( Exception ex ) {
            LOGGER.error("",ex);
            model.put("success",false);
            model.put("message",ex.getMessage());
        }
        return responseEntityUtils.buildResponse(model);
    }


    @ResponseBody
    @RequestMapping(value="/admin/restaurants/sendForApproval.ajax", method = RequestMethod.POST )
    public ResponseEntity<byte[]> sendForOwnerApproval(@RequestParam(value = "body") String body) throws Exception {

        Map<String,Object> model = new HashMap<String, Object>();

        try {
            Restaurant restaurant = jsonUtils.deserialize(Restaurant.class, body);
            // Get the restaurant email address
            String restaurantEmail = restaurant.getNotificationOptions().getNotificationEmailAddress();
            if( null == restaurantEmail || restaurantEmail.equals("")) {
                model.put("success",false);
                model.put("message","The restaurant is missing the Notification Email");
            }
            else {
                // Here we send the email to the restaurant
                emailService.sendForOwnerApproval(restaurant);
                // Change the contentApproved field
                restaurant.setContentApproved(false);
                // Change the contentStatus field
                restaurant.setContentStatus(Restaurant.CONTENT_STATUS_SENT_FOR_APPROVAL);
                LOGGER.info("Content Status: "+restaurant.getContentStatus());
                // Update the LastContentApprovalStatusUpdated field
                restaurant.setLastContentApprovalStatusUpdated(new DateTime().getMillis());
                // Add an update to the restaurant
                restaurant.addRestaurantUpdate("Send to restaurant for content approval.");

                //Save the changes
                repository.saveRestaurant(restaurant);

                model.put("success",true);
                model.put("id",restaurant.getId());
                model.put("restaurant",restaurant);
            }
        }
        catch( Exception ex ) {
            LOGGER.error("",ex);
            model.put("success",false);
            model.put("message",ex.getMessage());
        }
        return responseEntityUtils.buildResponse(model);
    }

    @RequestMapping(value="/approval/restaurant/approveContent.html", method = RequestMethod.GET )
    public ModelAndView getForContentApproval(@RequestParam(value = "restaurantId") String restaurantId, HttpServletRequest request) {

        Map<String,Object> model = getModel();
        HttpSession session = request.getSession(true);
        Restaurant restaurant = repository.findByRestaurantId(restaurantId);

        model.put("restaurant",restaurant);
        return new ModelAndView("restaurantContent",model);

    }


    @RequestMapping(value="/approval/restaurant/contentApproved.html", method= RequestMethod.GET)
    public ModelAndView approveContent(@RequestParam(value = "restaurantId", required = true) String restaurantId) throws Exception {

        Map<String,Object> model = new HashMap<String, Object>();
        try {
            Restaurant restaurant = repository.findByRestaurantId(restaurantId);
            if( restaurant == null ) {
                throw new IllegalArgumentException("Could not find restaurant by restaurantId: " + restaurantId );
            }
            model.put("restaurant",restaurant);
            model.put("message",MessageFactory.getMessage("workflow.restaurant-content-approved",true));
            //Email the admin people to let them know the content has been approved
            emailService.sendContentApproved(restaurant);

            // Approve the content
            restaurant.setContentApproved(true);
            restaurant.setContentStatus(Restaurant.CONTENT_STATUS_APPROVED);
            LOGGER.info("Content Status: "+restaurant.getContentStatus());
            // Remove any reasons why the content may have been rejected
            restaurant.setRejectionReasons("");
            // Update the LastContentApprovalStatusUpdated field
            restaurant.setLastContentApprovalStatusUpdated(new DateTime().getMillis());
            // Add a restaurant update entry
            restaurant.addRestaurantUpdate("Restaurant content approved by owner.");
            //Save the changes
            repository.saveRestaurant(restaurant);
        }
        catch( Exception ex ) {
            LOGGER.error("Exception: " + ex.getMessage());
            String message = ex.getMessage();
            model.put("message",message);
        }

        return new ModelAndView("workflow/approveContent",model);
    }


    @RequestMapping(value="/approval/restaurant/contentRejected.html", method= RequestMethod.GET)
    public ModelAndView rejectContent(@RequestParam(value = "restaurantId", required = true) String restaurantId) throws Exception {

        Map<String,Object> model = new HashMap<String, Object>();
        try {
            Restaurant restaurant = repository.findByRestaurantId(restaurantId);
            if( restaurant == null ) {
                throw new IllegalArgumentException("Could not find restaurant by restaurantId: " + restaurantId );
            }
            model.put("restaurant",restaurant);
            model.put("message",MessageFactory.getMessage("workflow.restaurant-content-rejected",true));
        }
        catch( Exception ex ) {
            LOGGER.error("Exception: " + ex.getMessage());
            String message = ex.getMessage();
            model.put("message",message);
        }

        return new ModelAndView("workflow/approveContent",model);
    }


    @ResponseBody
    @RequestMapping(value="/approval/restaurant/contentRejected.ajax", method = RequestMethod.POST )
    public ResponseEntity<byte[]> contentRejectedSendEmail(@RequestParam(value = "restaurantId") String restaurantId,
                                                           @RequestParam(value = "rejectionReasons") String rejectionReasons) throws Exception {

        Map<String,Object> model = new HashMap<String, Object>();

        try {
            Restaurant restaurant = repository.findByRestaurantId(restaurantId);
            if( restaurant == null ) {
                throw new IllegalArgumentException("Could not find restaurant by restaurantId: " + restaurantId );
            }
            restaurant.setRejectionReasons(rejectionReasons);
            restaurant.setContentApproved(false);
            restaurant.setContentStatus(Restaurant.CONTENT_STATUS_REJECTED);
            LOGGER.info("Content Status: "+restaurant.getContentStatus());
            // Update the LastContentApprovalStatusUpdated field
            restaurant.setLastContentApprovalStatusUpdated(new DateTime().getMillis());
            // Add a restaurant update entry
            restaurant.addRestaurantUpdate("Restaurant content rejected by owner. Reasons[" + rejectionReasons +"]");
            //Save the changes
            repository.saveRestaurant(restaurant);

            model.put("restaurant",restaurant);

            //Email the admin people to let them know the content has been rejected
            emailService.sendContentRejected(restaurant);
            model.put("success",true);
        }
        catch( Exception ex ) {
            LOGGER.error("Exception: " + ex.getMessage());
            String message = ex.getMessage();
            model.put("success",false);
            model.put("message",message);

        }
        return responseEntityUtils.buildResponse(model);

    }


    @ResponseBody
    @RequestMapping(value="/admin/restaurants/clearImage.ajax", method= RequestMethod.POST)
    public ResponseEntity<byte[]> clearUploadedImage(@RequestParam(value = "restaurantId", required = true) String restaurantId) throws Exception {

        Map<String,Object> model = new HashMap<String, Object>();
        try {
            Restaurant restaurant = repository.findByRestaurantId(restaurantId);
            restaurant.setHasUploadedImage(false);
            repository.saveRestaurant(restaurant);
            model.put("success",true);
        }
        catch( Exception ex ) {
            LOGGER.error("",ex);
            model.put("success",false);
            model.put("message",ex.getMessage());
        }
        return responseEntityUtils.buildResponse(model);
    }


    /**
     * Returns standard model
     * @return
     */

    private Map<String,Object> getModel() {
        Map<String,Object> model = new HashMap<String, Object>();
        Set<String> cuisines = cuisineProvider.getCuisineList();
        String cuisineArrayList = StringUtils.collectionToDelimitedString(cuisines,"','");
        model.put("cuisinesArray","'" + cuisineArrayList + "'");
        return model;
    }


    /**
     * @param session
     * @param restaurant
     * @return
     */

    private Order buildAndRegister(HttpSession session, Restaurant restaurant) {
        
        Order order = orderRepository.create();
        if( restaurant.getCollectionOnly()) {
            order.setDeliveryType(Order.COLLECTION); // Default to collection for collection-only restaurants
        }
        order.setRestaurant(restaurant);

        // If a search term is in the session, update delivery location
        Search search = (Search)session.getAttribute("search");
        if( search != null && search.getLocation() != null ) {
            order.setDeliveryAddress(geoLocationService.buildAddress(search.getLocation()));
        }

        order = orderRepository.save(order);
        session.setAttribute("orderid",order.getOrderId());
        session.removeAttribute("completedorderid");
        return order;
    }

}
