package com.ezar.clickandeat.workflow.handler;

import com.ezar.clickandeat.model.Order;
import com.ezar.clickandeat.model.Restaurant;
import com.ezar.clickandeat.notification.NotificationService;
import com.ezar.clickandeat.payment.PaymentService;
import com.ezar.clickandeat.repository.RestaurantRepository;
import com.ezar.clickandeat.workflow.WorkflowException;
import org.apache.log4j.Logger;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

import static com.ezar.clickandeat.workflow.OrderWorkflowEngine.*;

@Component
public class RestaurantAcceptsHandler implements IWorkflowHandler {
    
    private static final Logger LOGGER = Logger.getLogger(RestaurantAcceptsHandler.class);

    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private PaymentService paymentService;
    
    @Override
    public String getWorkflowAction() {
        return ACTION_RESTAURANT_ACCEPTS;
    }

    @Override
    public boolean isActionValidForOrder(Order order) {
        return ORDER_STATUS_AWAITING_RESTAURANT.equals(order.getOrderStatus());
    }


    @Override
    public Order handle(Order order, Map<String, Object> context) throws WorkflowException {

        order.addOrderUpdate("Restaurant accepted order");
        order.setRestaurantActionedTime(new DateTime());
        Restaurant restaurant = order.getRestaurant();

        // Update the last time the restaurant responded to the system
        restaurant.setLastOrderReponseTime(new DateTime());
        restaurantRepository.saveRestaurant(restaurant);

        // Update expected delivery time for the restaurant (if the user has not requested a specific time and date)
        if( Order.DELIVERY.equals(order.getDeliveryType()) && order.getExpectedDeliveryTime() == null ) {
            order.setRestaurantConfirmedTime(new DateTime().plusMinutes(restaurant.getDeliveryTimeMinutes()));
        }

        // Update expected collection time for the restaurant (if the user has not requested a specific time and date)
        if( Order.COLLECTION.equals(order.getDeliveryType()) && order.getExpectedCollectionTime() == null ) {
            order.setRestaurantConfirmedTime(new DateTime().plusMinutes(restaurant.getCollectionTimeMinutes()));
        }

        try {
            //If the order is a test order we don't call the payment gateway
            if(order.getTestOrder()){
                // If it is a test order only enter an Order update
                order.addOrderUpdate("Test order. No real capture of credit card payment");
            }
            else {
                paymentService.processTransactionRequest(order, PaymentService.CAPTURE);
                order.addOrderUpdate("Captured credit card payment");
            }
            order.setTransactionStatus(Order.PAYMENT_CAPTURED);
        }
        catch( Exception ex ) {
            LOGGER.error("Error capturing paymayment of order",ex);
            order.addOrderUpdate("Error capturing paymayment of order: " + ex.getMessage());
        }

        try {
            notificationService.sendRestaurantAcceptedConfirmationToCustomer(order);
            order.addOrderUpdate("Sent confirmation of restaurant acceptance to customer");
        }
        catch (Exception ex ) {
            LOGGER.error("Error sending confirmation of restaurant acceptance to customer",ex);
            order.addOrderUpdate("Error sending confirmation of restaurant acceptance to customer: " + ex.getMessage());
        }

        order.setOrderStatus(ORDER_STATUS_RESTAURANT_ACCEPTED);
        return order;
    }

}
