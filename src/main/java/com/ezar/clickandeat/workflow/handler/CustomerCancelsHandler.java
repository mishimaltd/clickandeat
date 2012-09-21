package com.ezar.clickandeat.workflow.handler;

import com.ezar.clickandeat.model.Order;
import com.ezar.clickandeat.notification.NotificationService;
import com.ezar.clickandeat.workflow.WorkflowException;
import com.ezar.clickandeat.workflow.WorkflowStatusException;
import org.apache.log4j.Logger;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

import static com.ezar.clickandeat.workflow.OrderWorkflowEngine.*;

@Component
public class CustomerCancelsHandler implements IWorkflowHandler {
    
    private static final Logger LOGGER = Logger.getLogger(CustomerCancelsHandler.class);

    @Autowired
    private NotificationService notificationService;

    private int cancelCutoffMinutes;

    @Override
    public String getWorkflowAction() {
        return ACTION_CUSTOMER_CANCELS;
    }

    @Override
    public boolean isActionValidForOrder(Order order) {
        if( ORDER_STATUS_AWAITING_RESTAURANT.equals(order.getOrderStatus())) {
            return true;
        }
        else if (order.getDeliveryTimeNonStandard()) {
            DateTime restaurantAcceptedTime = order.getRestaurantActionedTime();
            if( restaurantAcceptedTime.plusMinutes(cancelCutoffMinutes).isBefore(new DateTime())) {
                order.setOrderStatus(ORDER_STATUS_CANCEL_CUTOFF_EXPIRED);
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    }


    @Override
    public Order handle(Order order, Map<String, Object> context) throws WorkflowException {

        order.addOrderUpdate("Customer cancelled order");

        try {
            notificationService.sendCustomerCancelledConfirmationToRestaurant(order);
            order.addOrderUpdate("Sent confirmation of customer cancelling order to restaurant");
        }
        catch (Exception ex ) {
            LOGGER.error("Error sending confirmation of customer cancelling order to restaurant",ex);
            order.addOrderUpdate("Error sending confirmation of customer cancelling order to restaurant: " + ex.getMessage());
        }

        try {
            notificationService.sendCustomerCancelledConfirmationToCustomer(order);
            order.addOrderUpdate("Sent confirmation of customer cancelling order to customer");
        }
        catch (Exception ex ) {
            LOGGER.error("Error sending confirmation of customer cancelling order to customer",ex);
            order.addOrderUpdate("Error sending confirmation of customer cancelling order to customer: " + ex.getMessage());
        }

        order.setOrderStatus(ORDER_STATUS_CUSTOMER_CANCELLED);
        return order;
    }


    @Required
    @Value(value="${order.cancelCutoffMinutes}")
    public void setCancelCutoffMinutes(int cancelCutoffMinutes) {
        this.cancelCutoffMinutes = cancelCutoffMinutes;
    }

}
