package com.ezar.clickandeat.workflow.handler;

import com.ezar.clickandeat.model.Order;
import com.ezar.clickandeat.notification.NotificationService;
import com.ezar.clickandeat.workflow.WorkflowException;
import com.ezar.clickandeat.workflow.WorkflowStatusException;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

import static com.ezar.clickandeat.workflow.OrderWorkflowEngine.*;

@Component
public class RestaurantCancelsHandler implements IWorkflowHandler {
    
    private static final Logger LOGGER = Logger.getLogger(RestaurantCancelsHandler.class);

    @Autowired
    private NotificationService notificationService;

    @Override
    public String getWorkflowAction() {
        return ACTION_RESTAURANT_CANCELS;
    }

    @Override
    public Order handle(Order order, Map<String, Object> context) throws WorkflowException {

        if( !ORDER_STATUS_RESTAURANT_ACCEPTED.equals(order.getOrderStatus())) {
            throw new WorkflowStatusException(order,"Order should be in accepted by restaurant state");
        }

        order.addOrderUpdate("Customer cancelled order");

        try {
            notificationService.sendRestaurantCancelledConfirmationToCustomer(order);
            order.addOrderUpdate("Sent confirmation of restaurant cancelling order to customer");
        }
        catch (Exception ex ) {
            LOGGER.error("Error sending confirmation of restaurant cancelling order to customer",ex);
            throw new WorkflowException(ex);
        }

        order.setOrderStatus(ORDER_STATUS_RESTAURANT_CANCELLED);
        return order;
    }

}