package com.ezar.clickandeat.web.controller;

import com.ezar.clickandeat.model.Order;
import com.ezar.clickandeat.model.OrderItem;
import com.ezar.clickandeat.model.Restaurant;
import com.ezar.clickandeat.model.Search;
import com.ezar.clickandeat.repository.OrderRepository;
import com.ezar.clickandeat.repository.RestaurantRepository;
import com.ezar.clickandeat.util.JSONUtils;
import com.ezar.clickandeat.util.SequenceGenerator;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@Controller
public class OrderController {
    
    private static final Logger LOGGER = Logger.getLogger(OrderController.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private SequenceGenerator sequenceGenerator;


    @RequestMapping(value="/buildOrder.html", method = RequestMethod.GET )
    public ModelAndView get(HttpServletRequest request) {

        if( LOGGER.isDebugEnabled()) {
            LOGGER.debug("Redirecting to current order details page");
        }

        HttpSession session = request.getSession(true);
        String orderid = (String)session.getAttribute("orderid");
        String restaurantid = (String)session.getAttribute("restaurantid");
        Search search = (Search)session.getAttribute("search");
        
        if( orderid != null ) {
            Order order = orderRepository.findByOrderId(orderid);
            if( order != null ) {
                restaurantid = order.getRestaurantId();
            }
        }
        
        if( restaurantid == null ) {
            if( search == null ) {
                return new ModelAndView("redirect:/home.html",null);
            }
            else {
                return new ModelAndView("redirect:/search.html" + search.getQueryString());
            }
        }
        else {
            return new ModelAndView("redirect:/restaurant.html?restaurantId=" + restaurantid);
        }
    }


    @SuppressWarnings("unchecked")
    @ResponseBody
    @RequestMapping(value="/order/getOrder.ajax", method = RequestMethod.POST )
    public ResponseEntity<byte[]> getOrder(HttpServletRequest request) throws Exception {

        if( LOGGER.isDebugEnabled()) {
            LOGGER.debug("Retrieving order from session");
        }

        Map<String,Object> model = new HashMap<String, Object>();

        try {
            HttpSession session = request.getSession(true);
            String orderId = (String)session.getAttribute("orderid");
            Order order = null;
            if( orderId != null ) {
                order = orderRepository.findByOrderId(orderId);
            }
            model.put("success",true);
            model.put("order",order);
        }
        catch(Exception ex ) {
            LOGGER.error("",ex);
            model.put("success",false);
            model.put("message",ex.getMessage());
        }
        return buildResponse(model);
    }


    @SuppressWarnings("unchecked")
    @ResponseBody
    @RequestMapping(value="/order/addItem.ajax", method = RequestMethod.POST )
    public ResponseEntity<byte[]> addToOrder(HttpServletRequest request, @RequestParam(value = "body") String body ) throws Exception {

        if( LOGGER.isDebugEnabled()) {
            LOGGER.debug("Adding to order: " + body);
        }
        
        Map<String,Object> model = new HashMap<String, Object>();

        try {
            // Extract request parameters
            Map<String,Object> params = (Map<String,Object>)JSONUtils.deserialize(body);
            String restaurantId = (String)params.get("restaurantId");
            String itemId = (String)params.get("itemId");
            String itemName = (String)params.get("itemName");
            Double itemCost = Double.valueOf(params.get("itemCost").toString());
            Integer quantity = (Integer)params.get("quantity");
            
            // Build new order item
            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItemId(itemId);
            orderItem.setMenuItemTitle(itemName);
            orderItem.setCost(itemCost);
            orderItem.setQuantity(quantity);
            
            // Get the order out of the session            
            HttpSession session = request.getSession(true);
            String orderId = (String)session.getAttribute("orderid");
            Order order;
            if( orderId == null ) {
                order = buildAndRegister(session,restaurantId);
            }
            else {
                order = orderRepository.findByOrderId(orderId);
                if( order == null ) {
                    order = buildAndRegister(session,restaurantId);
                }
                else if( !restaurantId.equals(order.getRestaurantId())) {
                    Restaurant restaurant = restaurantRepository.findByRestaurantId(restaurantId);
                    order.setRestaurantId(restaurantId);
                    order.setRestaurant(restaurant);
                    order.getOrderItems().clear();
                }
            }
            
            // Add new order item to order and update
            order.addOrderItem(orderItem);
            order = orderRepository.saveOrder(order);

            // Return success
            model.put("success",true);
            model.put("order",order);
        }
        catch(Exception ex ) {
            LOGGER.error("",ex);
            model.put("success",false);
            model.put("message",ex.getMessage());
        }
        return buildResponse(model);
    }


    @SuppressWarnings("unchecked")
    @ResponseBody
    @RequestMapping(value="/order/removeItem.ajax", method = RequestMethod.POST )
    public ResponseEntity<byte[]> removeFromOrder(HttpServletRequest request, @RequestParam(value = "body") String body ) throws Exception {

        if( LOGGER.isDebugEnabled()) {
            LOGGER.debug("Removing from order: " + body);
        }

        Map<String,Object> model = new HashMap<String, Object>();

        try {
            // Extract request parameters
            Map<String,Object> params = (Map<String,Object>)JSONUtils.deserialize(body);
            String itemId = (String)params.get("itemId");
            Integer quantity = (Integer)params.get("quantity");

            HttpSession session = request.getSession(true);
            String orderId = (String)session.getAttribute("orderid");
            Order order = null;
            if( orderId != null ) {
                order = orderRepository.findByOrderId(orderId);
                if( order != null ) {
                    order.removeOrderItem(itemId,quantity);
                    order = orderRepository.saveOrder(order);
                }
            }
            model.put("success",true);
            model.put("order",order);
        }
        catch(Exception ex ) {
            LOGGER.error("",ex);
            model.put("success",false);
            model.put("message",ex.getMessage());
        }
        return buildResponse(model);
    }


    @SuppressWarnings("unchecked")
    @ResponseBody
    @RequestMapping(value="/order/updateDeliveryType.ajax", method = RequestMethod.POST )
    public ResponseEntity<byte[]> updateOrderDeliveryType(HttpServletRequest request, @RequestParam(value = "deliveryType") String deliveryType ) throws Exception {

        if( LOGGER.isDebugEnabled()) {
            LOGGER.debug("Updating order delivery type to: " + deliveryType);
        }
        
        Map<String,Object> model = new HashMap<String, Object>();

        try {
            // Extract request parameters
            HttpSession session = request.getSession(true);
            String orderId = (String)session.getAttribute("orderid");
            Order order = null;
            if( orderId != null ) {
                order = orderRepository.findByOrderId(orderId);
                if( order != null ) {
                    order.setDeliveryType(deliveryType);
                    order = orderRepository.saveOrder(order);
                }
            }
            model.put("success",true);
            model.put("order",order);
        }
        catch(Exception ex ) {
            LOGGER.error("",ex);
            model.put("success",false);
            model.put("message",ex.getMessage());
        }
        return buildResponse(model);
    }


    /**
     * @param session
     * @param restaurantId
     * @return
     */
    
    private Order buildAndRegister(HttpSession session, String restaurantId) {
        Order order = orderRepository.create();
        Restaurant restaurant = restaurantRepository.findByRestaurantId(restaurantId);
        order.setRestaurantId(restaurantId);
        order.setRestaurant(restaurant);
        order = orderRepository.save(order);
        session.setAttribute("orderid",order.getOrderId());
        return order;
    }


    /**
     * @param model
     * @return
     * @throws Exception
     */

    private ResponseEntity<byte[]> buildResponse(Map<String,Object> model ) throws Exception {
        String json = JSONUtils.serialize(model);
        final HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new ResponseEntity<byte[]>(json.getBytes("utf-8"), headers, HttpStatus.OK);
    }
    
}
