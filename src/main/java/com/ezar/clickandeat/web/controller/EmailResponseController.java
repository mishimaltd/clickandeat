package com.ezar.clickandeat.web.controller;

import com.ezar.clickandeat.config.MessageFactory;
import com.ezar.clickandeat.model.Order;
import com.ezar.clickandeat.model.Restaurant;
import com.ezar.clickandeat.repository.OrderRepository;
import com.ezar.clickandeat.repository.RestaurantRepository;
import com.ezar.clickandeat.util.SecurityUtils;
import com.ezar.clickandeat.workflow.OrderWorkflowEngine;
import com.ezar.clickandeat.workflow.WorkflowStatusException;
import com.ezar.clickandeat.workflow.WorkflowStatusExceptionMessageResolver;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;

@Controller 
public class EmailResponseController {
    
    private static final Logger LOGGER = Logger.getLogger(EmailResponseController.class);
    
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;
    
    @Autowired
    private OrderWorkflowEngine orderWorkflowEngine;

    @Autowired
    private SecurityUtils securityUtils;

    @Autowired
    private WorkflowStatusExceptionMessageResolver workflowStatusExceptionMessageResolver;

    private String locale;



    @RequestMapping(value="/secure/workflow/confirmOrder.html", method= RequestMethod.GET)
    public ModelAndView acceptOrDeclineOrder(@RequestParam(value = "curl", required = true) String curl, @RequestParam(value = "minutes", required = false) Integer minutes ) throws Exception {
        
        Map<String,Object> model = new HashMap<String, Object>();
        String orderId = null;
        String action;

        try {
            String unencoded = URLDecoder.decode(curl,"utf-8");
            String decrypted = securityUtils.decrypt(unencoded);
            String[] params = decrypted.split("#");
            orderId = params[0].split("=")[1];
            action = params[1].split("=")[1];
            
            Order order = orderRepository.findByOrderId(orderId);
            if( order == null ) {
                throw new IllegalArgumentException("Could not find order by orderId: " + orderId );
            }

            model.put("order",order);

            // Process the action
            try {
                Map<String,Object> context = new HashMap<String, Object>();
                if( minutes != null ) {
                    context.put("DeliveryMinutes",minutes);
                }
                order = orderWorkflowEngine.processAction(order,action, context);
                model.put("success",true);
                String orderStatusDescription = MessageFactory.formatMessage("order-status-description." + order.getOrderStatus(), true,order.getRestaurant().getName());
                String message = MessageFactory.formatMessage("workflow.update.message", true, order.getOrderId(), orderStatusDescription);
                model.put("message",message);
            }
            catch( WorkflowStatusException ex ) {
                LOGGER.error("Workflow exception: " + ex.getMessage());
                model.put("success",false);
                String message = workflowStatusExceptionMessageResolver.getWorkflowStatusExceptionMessage(ex);
                model.put("message",message);
            }

        }
        catch( Exception ex ) {
            LOGGER.error("Execption for orderId: " + orderId,ex);
            model.put("success",false);
            String message = MessageFactory.formatMessage("workflow.exception.message", true, ex.getMessage());
            model.put("message",message);
        }
        return new ModelAndView("workflow/confirmOrder",model);
    }


    @RequestMapping(value="/secure/workflow/customerCancelOrder.html", method= RequestMethod.GET)
    public ModelAndView customerCancelsOrder(@RequestParam(value = "curl", required = true) String curl ) throws Exception {

        Map<String,Object> model = new HashMap<String, Object>();
        String orderId = null;
        String action;

        try {
            String unencoded = URLDecoder.decode(curl,"utf-8");
            String decrypted = securityUtils.decrypt(unencoded);
            String[] params = decrypted.split("#");
            orderId = params[0].split("=")[1];
            action = params[1].split("=")[1];

            Order order = orderRepository.findByOrderId(orderId);
            if( order == null ) {
                throw new IllegalArgumentException("Could not find order by orderId: " + orderId );
            }

            model.put("order",order);

            // Process the action
            try {
                order = orderWorkflowEngine.processAction(order,action);
                model.put("success",true);
                String orderStatusDescription = MessageFactory.formatMessage("order-status-description." + order.getOrderStatus(), true,order.getRestaurant().getName());
                String message = MessageFactory.formatMessage("workflow.update.message", true, order.getOrderId(), orderStatusDescription);
                model.put("message",message);
            }
            catch( WorkflowStatusException ex ) {
                LOGGER.error("Workflow exception: " + ex.getMessage());
                model.put("success",false);
                String message = workflowStatusExceptionMessageResolver.getWorkflowStatusExceptionMessage(ex);
                model.put("message",message);
            }

        }
        catch( Exception ex ) {
            LOGGER.error("Execption for orderId: " + orderId,ex);
            model.put("success",false);
            String message = MessageFactory.formatMessage("workflow.exception.message", true, ex.getMessage());
            model.put("message",message);
        }
        return new ModelAndView("workflow/confirmOrder",model);
    }


    @RequestMapping(value="/secure/workflow/relistRestaurant.html", method= RequestMethod.GET)
    public ModelAndView restaurantRelists(@RequestParam(value = "curl", required = true) String curl ) throws Exception {

        Map<String,Object> model = new HashMap<String, Object>();
        String restaurantId = null;

        try {
            String unencoded = URLDecoder.decode(curl,"utf-8");
            String decrypted = securityUtils.decrypt(unencoded);
            restaurantId = decrypted.split("=")[1];
            Restaurant restaurant = restaurantRepository.findByRestaurantId(restaurantId);
            if( !restaurant.getListOnSite()) {
                restaurant.setListOnSite(true);
                restaurantRepository.saveRestaurant(restaurant);
                model.put("message",MessageFactory.getMessage("workflow.restaurant-relisted-confirmation",true));
            }
            else {
                model.put("message",MessageFactory.getMessage("workflow.restaurant-already-listed",true));
            }
            model.put("success",true);
        }
        catch( Exception ex ) {
            LOGGER.error("Execption occurred relisting restaurantId : " + restaurantId,ex);
            model.put("success",false);
            model.put("message",ex.getMessage());
        }
        return new ModelAndView("workflow/confirmRelistRestaurant",model);
    }

}