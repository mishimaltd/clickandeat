package com.ezar.clickandeat.workflow.handler;

import com.ezar.clickandeat.model.Order;
import com.ezar.clickandeat.workflow.WorkflowException;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

import static com.ezar.clickandeat.workflow.OrderWorkflowEngine.ACTION_NOTIFICATION_CALL_NOT_ANSWERED;
import static com.ezar.clickandeat.workflow.OrderWorkflowEngine.NOTIFICATION_STATUS_RESTAURANT_FAILED_TO_RESPOND;
import static com.ezar.clickandeat.workflow.OrderWorkflowEngine.NOTIFICATION_STATUS_RESTAURANT_NO_ANSWER;

@Component
public class OrderNotificationCallNoAnswerHandler implements IWorkflowHandler {
    
    private int maximumCallAttempts;
    
    @Override
    public String getWorkflowAction() {
        return ACTION_NOTIFICATION_CALL_NOT_ANSWERED;
    }

    @Override
    public Order handle(Order order, Map<String, Object> context) throws WorkflowException {
        order.addOrderUpdate("No answer for order notification call to restaurant");
        if( order.getOrderNotificationCallCount() >= maximumCallAttempts ) {
            order.addOrderUpdate("Unable to contact restaurant after " + order.getOrderNotificationCallCount() + " attempts");
            order.setOrderNotificationStatus(NOTIFICATION_STATUS_RESTAURANT_FAILED_TO_RESPOND);
        }
        else {
            order.setOrderNotificationStatus(NOTIFICATION_STATUS_RESTAURANT_NO_ANSWER);
        }
        return order;
    }


    @Required
    @Value(value="${twilio.maximumCallAttempts}")
    public void setMaximumCallAttempts(int maximumCallAttempts) {
        this.maximumCallAttempts = maximumCallAttempts;
    }
}
