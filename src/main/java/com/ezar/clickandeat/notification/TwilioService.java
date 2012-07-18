package com.ezar.clickandeat.notification;

import com.ezar.clickandeat.model.Order;
import com.ezar.clickandeat.model.Restaurant;
import com.twilio.sdk.TwilioRestClient;
import com.twilio.sdk.resource.factory.CallFactory;
import com.twilio.sdk.resource.instance.Account;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component(value="twilioService")
public class TwilioService {

    private static final Logger LOGGER = Logger.getLogger(TwilioService.class);

    public static final String ORDER_NOTIFICATION_SMS_URL = "/twilio/orderNotificationSMS.html";
    public static final String ORDER_NOTIFICATION_SMS_FALLBACK_URL = "/twilio/orderNotificationSMSFallback.html";
    public static final String ORDER_NOTIFICATION_SMS_STATUS_CALLBACK_URL = "/twilio/orderNotificationSMSStatusCallback.html";

    public static final String ORDER_NOTIFICATION_CALL_URL = "/twilio/orderNotificationCall.html";
    public static final String ORDER_NOTIFICATION_CALL_FALLBACK_URL = "/twilio/orderNotificationCallFallback.html";
    public static final String ORDER_NOTIFICATION_CALL_STATUS_CALLBACK_URL = "/twilio/orderNotificationCallStatusCallback.html";

    public static final String FULL_ORDER_CALL_URL = "/twilio/fullOrderCall.html";
    public static final String FULL_ORDER_CALL_FALLBACK_URL = "/twilio/fullOrderCallFallbackv";
    public static final String FULL_ORDER_CALL_STATUS_CALLBACK_URL = "/twilio/fullOrderCallStatusCallback.html";

    private String accountSid;
    
    private String authToken;

    private String callerId;
    
    private String baseUrl;
    
    private String authKey;


    /**
     * @param order
     * @throws Exception
     */

    public void sendOrderNotificationSMS(Order order) throws Exception {

    }


    /**
     * @param order
     * @return
     * @throws Exception
     */

    public void makeFullOrderCall(Order order) throws Exception {

        String phoneNumber = order.getRestaurant().getNotificationOptions().getNotificationPhoneNumber();
        String orderId = order.getOrderId();

        if( LOGGER.isDebugEnabled()) {
            LOGGER.debug("Calling " + phoneNumber + " to read details of order " + orderId);
        }

        placeOrderCall(orderId, phoneNumber, FULL_ORDER_CALL_URL, FULL_ORDER_CALL_FALLBACK_URL, FULL_ORDER_CALL_STATUS_CALLBACK_URL);
    }


    /**
     * @param order
     * @return
     * @throws Exception
     */
    
    public void makeOrderNotificationCall(Order order) throws Exception {

        String phoneNumber = order.getRestaurant().getNotificationOptions().getNotificationPhoneNumber();
        String orderId = order.getOrderId();
        
        if( LOGGER.isDebugEnabled()) {
            LOGGER.debug("Calling " + phoneNumber + " to notify about order " + orderId);
        }
        
        placeOrderCall(orderId, phoneNumber, ORDER_NOTIFICATION_CALL_URL, ORDER_NOTIFICATION_CALL_FALLBACK_URL, ORDER_NOTIFICATION_CALL_STATUS_CALLBACK_URL);
    }






    /**
     * @param phoneNumber
     * @param url
     * @param fallbackUrl
     * @param statusCallbackUrl
     * @throws Exception
     */
    
    private void placeOrderCall(String orderId, String phoneNumber, String url, String fallbackUrl, String statusCallbackUrl ) throws Exception {

        // Create a rest client
        TwilioRestClient client = new TwilioRestClient(accountSid, authToken);

        // Get the main account (The one we used to authenticate the client
        Account mainAccount = client.getAccount();

        // Build the call
        CallFactory callFactory = mainAccount.getCallFactory();
        Map<String, String> callParams = new HashMap<String, String>();
        callParams.put("To", phoneNumber);
        callParams.put("From", callerId);
        callParams.put("Url", buildTwilioUrl(url,orderId));
        callParams.put("Method", "POST");

        // Add the callback urls
        callParams.put("FallbackUrl", buildTwilioUrl(fallbackUrl,orderId));
        callParams.put("StatusCallback", buildTwilioUrl(statusCallbackUrl,orderId));

        // Place the call
        callFactory.create(callParams);
    }


    /**
     * @param requestUrl
     * @param orderId
     * @return
     */

    private String buildTwilioUrl(String requestUrl,String orderId) {
        StringBuilder sb = new StringBuilder(baseUrl);
        sb.append(requestUrl);
        sb.append("?authKey=").append(authKey);
        sb.append("&orderId=").append(orderId);
        return sb.toString();
    }
    
    
    @Required
    @Value(value="${twilio.sid}")
    public void setAccountSid(String accountSid) {
        this.accountSid = accountSid;
    }

    @Required
    @Value(value="${twilio.authToken}")
    public void setAuthToken(String authToken) {
        this.authToken = authToken;
    }

    @Required
    @Value(value="${twilio.callerId}")
    public void setCallerId(String callerId) {
        this.callerId = callerId;
    }

    @Required
    @Value(value="${twilio.baseUrl}")
    public void setBaseUrl(String baseUrl) {
        if(baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(baseUrl.length());
        }
        this.baseUrl = baseUrl;
    }

    @Required
    @Value(value="${twilio.authKey}")
    public void setAuthKey(String authKey) {
        this.authKey = authKey;
    }

}



