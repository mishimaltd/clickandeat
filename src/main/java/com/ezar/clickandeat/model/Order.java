package com.ezar.clickandeat.model;

import com.ezar.clickandeat.config.MessageFactory;
import com.ezar.clickandeat.util.CommissionUtils;
import com.ezar.clickandeat.util.DateTimeUtil;
import com.ezar.clickandeat.util.LocationUtils;
import com.ezar.clickandeat.util.NumberUtil;
import com.ezar.clickandeat.workflow.OrderWorkflowEngine;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.*;

@Document(collection = "orders")
public class Order extends PersistentObject {

    public static final String DELIVERY = "DELIVERY";
    public static final String COLLECTION = "COLLECTION";

    public static final String PAYMENT_ERROR = "ERROR";
    public static final String PAYMENT_PRE_AUTHORISED = "PREAUTHORISED";
    public static final String PAYMENT_CAPTURED = "CAPTURED";
    public static final String PAYMENT_REFUNDED = "REFUNDED";
    
    @Indexed(unique=true)
    private String orderId;

    private String userId;

    private String locale;
    
    // Restaurant details
    private String restaurantId;
    private String restaurantName;
    private Boolean phoneOrdersOnly;
    private List<Discount> restaurantDiscounts;

    @Transient
    private Restaurant restaurant;

    // Order components
    private List<OrderItem> orderItems;
    private List<OrderDiscount> orderDiscounts;

    // Customer/delivery/billing details
    private Person customer;
    private String deliveryType;
    private String paymentType;
    private Address deliveryAddress;
    private Address billingAddress;
    private String additionalInstructions;
    private boolean termsAndConditionsAccepted;
    private boolean restaurantWillDeliver;

    // Order timing details
    private DateTime orderCreatedTime;
    private DateTime orderPlacedTime;
    private DateTime expectedDeliveryTime;
    private DateTime expectedCollectionTime;
    private DateTime restaurantActionedTime; // Time the restaurant accepted or declined the order
    private DateTime restaurantConfirmedTime;
    private boolean deliveryTimeNonStandard = false;

    // Order cost details
    private Double orderItemCost;
    private Double deliveryCost;
    private Double extraSpendNeededForDelivery;
    private Double cardTransactionCost;
    private Double totalDiscount;
    private Double voucherDiscount;
    private Double totalCost;
    private Double restaurantCost; // Cost to restaurant (without any vouchers applied)
    private Double commission; // Commission to be retained by LlamaryComer

    // Order next discount details
    private String nextDiscountTitle;
    
    // Order payment details
    private String transactionId;
    private String transactionStatus;
    private String authorisationCode;
    private String signature;
    private Double cardPaymentAmount;

    // Order tracking details
    private boolean canCheckout;
    private boolean canSubmitPayment;
    private boolean restaurantIsOpen;
    private boolean hasDeliveryWarning;
    private boolean callInProgress;
    private String orderStatus;
    private String orderNotificationStatus;
    private String additionalRequestDetails;
    private DateTime lastCallPlacedTime;
    private Integer orderNotificationCallCount;
    private Boolean cancellationOfferEmailSent;
    private String restaurantDeclinedReason;
    private List<OrderUpdate> orderUpdates;
    private Boolean testOrder;

    // Indicates if the restaurant phone number was viewed
    private boolean phoneNumberViewed;

    // Indicates the order is deleted
    private boolean deleted;

    // Order amendments
    private List<OrderAmendment> orderAmendments;

    // Order voucher details
    private String voucherId;
    
    @Transient
    private Voucher voucher;

    public Order() {

        this.orderStatus = OrderWorkflowEngine.ORDER_STATUS_BASKET;
        this.orderNotificationStatus = OrderWorkflowEngine.NOTIFICATION_STATUS_NO_CALL_MADE;

        this.orderCreatedTime = new DateTime();
        
        this.customer = new Person();
        this.deliveryType = DELIVERY;
        this.deliveryAddress = new Address();
        this.billingAddress = new Address();

        this.cancellationOfferEmailSent = false;
        this.orderNotificationCallCount = 0;
        
        this.orderItems = new ArrayList<OrderItem>();
        this.orderDiscounts = new ArrayList<OrderDiscount>();
        this.restaurantDiscounts = new ArrayList<Discount>();

        this.orderUpdates = new ArrayList<OrderUpdate>();
        this.orderAmendments = new ArrayList<OrderAmendment>();

        this.testOrder = false;
    }


    /**
     * Updates order item costs
     */

    public void updateCosts() {

        // Check that any special offers are still valid (i.e. if the delivery date changes)
        List<OrderItem> toRemove = new ArrayList<OrderItem>();
        for( OrderItem orderItem: orderItems ) {
            String specialOfferId = orderItem.getMenuItemId();
            SpecialOffer specialOffer = restaurant.getSpecialOffer(specialOfferId);
            if( specialOffer != null ) {
                if( !specialOffer.isApplicableTo(this)) {
                    toRemove.add(orderItem);
                }
            }
        }
        orderItems.removeAll(toRemove);

        // Update order item costs
        orderItemCost = 0d;
        for( OrderItem item: orderItems ) {
            orderItemCost += item.getCost() * item.getQuantity();
        }

        // Update all discount costs
        updateOrderDiscounts();

        totalDiscount = 0d;
        for( OrderDiscount discount: orderDiscounts ) {
            totalDiscount += discount.getDiscountAmount();
        }

        // Reset and update delivery costs
        deliveryCost = 0d;
        extraSpendNeededForDelivery = 0d;
        restaurantWillDeliver = true;
        hasDeliveryWarning = false;

        DeliveryOptions deliveryOptions = restaurant.getDeliveryOptions();

        // Update whether or not the restaurant will deliver to this order
        if( DELIVERY.equals(getDeliveryType())) {
            restaurantWillDeliver = restaurant.willDeliverToLocation(this);
            
            // Update delivery warning
            if(deliveryAddress != null && restaurantWillDeliver && deliveryAddress.isRadiusWarning()) {

                // Check if there is a match on postcode
                boolean foundPostcodeMatch = false;
                for(String postcodeDeliveredTo: deliveryOptions.getAreasDeliveredTo()) {
                    if(postcodeDeliveredTo.equalsIgnoreCase(deliveryAddress.getPostCode())) {
                        foundPostcodeMatch = true;
                    }
                }

                // Check the exact distance between the restaurant and delivery address
                if( !foundPostcodeMatch ) {
                    double distance = LocationUtils.getDistance(deliveryAddress.getLocation(), restaurant.getAddress().getLocation());
                    double maxPossibleDistance = distance + deliveryAddress.getRadius() + restaurant.getAddress().getRadius(); 
                    double deliveryDistance = deliveryOptions.getDeliveryRadiusInKilometres() == null? 0d: deliveryOptions.getDeliveryRadiusInKilometres();
                    if(maxPossibleDistance > deliveryDistance ) {
                        hasDeliveryWarning = true;
                    }
                }
            }
        }

        if( DELIVERY.equals(getDeliveryType()) && orderItems.size() > 0 ) {

            Double minimumOrderForDelivery = deliveryOptions.getMinimumOrderForDelivery(deliveryAddress);
            Double minimumOrderForFreeDelivery = deliveryOptions.getMinimumOrderForFreeDelivery();
            Double deliveryCharge = deliveryOptions.getDeliveryCharge(deliveryAddress, orderItemCost);
            boolean allowFreeDelivery = deliveryOptions.isAllowFreeDelivery();
            boolean allowDeliveryBelowMinimumForFreeDelivery = deliveryOptions.isAllowDeliveryBelowMinimumForFreeDelivery();

            if( !restaurantWillDeliver ) {
                deliveryCost = 0d;
                extraSpendNeededForDelivery = 0d;
            }
            else if( !allowFreeDelivery ) {
                if( deliveryCharge != null ) {
                    deliveryCost = deliveryCharge;
                }
                if(minimumOrderForDelivery != null && orderItemCost  < minimumOrderForDelivery ) {
                    extraSpendNeededForDelivery = minimumOrderForDelivery - orderItemCost;
                }
            }
            else {
                if(minimumOrderForDelivery != null && orderItemCost  < minimumOrderForDelivery ) {
                    extraSpendNeededForDelivery = minimumOrderForDelivery - orderItemCost;
                }
                if( minimumOrderForFreeDelivery != null && orderItemCost < minimumOrderForFreeDelivery ) {
                    if( allowDeliveryBelowMinimumForFreeDelivery && deliveryCharge != null ) {
                        deliveryCost = deliveryCharge;
                    }
                    else {
                        if( extraSpendNeededForDelivery == 0 ) {
                            extraSpendNeededForDelivery = minimumOrderForFreeDelivery - orderItemCost;
                        }
                    }
                }
            }
        }
        
        // Set the restaurant cost
        restaurantCost = orderItemCost + deliveryCost - totalDiscount;
        
        // Set the commission on this order
        commission = CommissionUtils.calculateCommission(this);
        
        // Apply any vouchers to the overall cost
        voucherDiscount = 0d;
        if( voucher != null ) {
            voucherDiscount = restaurantCost * voucher.getDiscount() / 100d;
        }           

        // Set the total cost
        totalCost = orderItemCost + deliveryCost - totalDiscount - voucherDiscount;
        
        // Update whether or not the restaurant is currently open
        updateRestaurantIsOpen();
        
        // Update whether or not the order is ready for checkout
        updateCanCheckout();
        
        // Update whether or not the order is ready for payment
        updateCanSubmitPayment();
    }


    /**
     * Updates all discounts applicable to this order
     */
    
    private void updateOrderDiscounts() {

        // Reset next discount details
        double extraSpendForNextDiscount = 0d;
        nextDiscountTitle = null;

        // Get all discounts applicable to this order
        Map<String,Discount> applicableDiscounts = new HashMap<String,Discount>();
        Discount nonCombinableDiscount = null; // Only include at most one discount which cannot be combined with others
        for( Discount discount: this.getRestaurant().getDiscounts()) {
            if(discount.couldApplyTo(this)) {

                // Work out the next discount and how much needed to spend to get it
                if( orderItemCost > 0 ) {
                    Double extraSpendNeeded = discount.getMinimumOrderValue() - orderItemCost;
                    if( extraSpendNeeded > 0 ) {
                        if( extraSpendForNextDiscount == 0 || extraSpendNeeded < extraSpendForNextDiscount ) {
                            extraSpendForNextDiscount = extraSpendNeeded;
                            nextDiscountTitle = discount.getExtraSpendTitle(extraSpendNeeded);
                        }
                    }
                }

                // Work out what discounts are already applicable to order
                if( discount.meetsMinimumValue(this)) {
                    if( discount.isCanCombineWithOtherDiscounts()) {
                        applicableDiscounts.put(discount.getDiscountId(), discount);
                    }
                    else {
                        if( nonCombinableDiscount == null ) {
                            nonCombinableDiscount = discount;
                        }
                        else if( discount.getMinimumOrderValue() > nonCombinableDiscount.getMinimumOrderValue()) {
                            nonCombinableDiscount = discount; // Keep the discount with the maximum minimum order value
                        }
                    }
                }
            }
        }
        if( nonCombinableDiscount != null ) {
            applicableDiscounts.put(nonCombinableDiscount.getDiscountId(),nonCombinableDiscount);
        }

        // Remove any existing discounts which are no longer applicable to this order
        List<OrderDiscount> discountsToRemove = new ArrayList<OrderDiscount>();
        for( OrderDiscount orderDiscount: orderDiscounts ) {
            if( !applicableDiscounts.containsKey(orderDiscount.getDiscountId())) {
                discountsToRemove.add(orderDiscount);
            }
        }
        if( discountsToRemove.size() > 0 ) {
            orderDiscounts.removeAll(discountsToRemove);
        }

        // Now either add or update the discounts
        for( Discount applicableDiscount: applicableDiscounts.values()) {
            OrderDiscount existingDiscount = getOrderDiscount(applicableDiscount.getDiscountId());
            if( existingDiscount == null ) {
                OrderDiscount newDiscount = applicableDiscount.createOrderDiscount(this);
                orderDiscounts.add(newDiscount);
            }
            else {
                applicableDiscount.updateOrderDiscount(this,existingDiscount);
            }
        }
    }
    
    
    /**
     * @param orderItem
     */
    
    public void addOrderItem(OrderItem orderItem) {
        OrderItem existingOrderItem = findExistingOrderItem(orderItem);
        if( existingOrderItem == null ) {
            orderItems.add(orderItem);
        }
        else {
            existingOrderItem.setQuantity(existingOrderItem.getQuantity() + orderItem.getQuantity());
        }
    }

        
    public void updateRestaurantIsOpen() {
        if( Order.DELIVERY.equals(deliveryType)) {
            restaurantIsOpen = !restaurant.getCollectionOnly() && restaurant.isOpen(expectedDeliveryTime == null ? new DateTime() : expectedDeliveryTime);
        }
        else {
            restaurantIsOpen = restaurant.isOpen(expectedCollectionTime == null ? new DateTime() : expectedCollectionTime);
        }
    }
    
    public void updateCanCheckout() {
        canCheckout = true;
        if( orderItems.size() == 0 ) {
            canCheckout = false;
        }
        if( extraSpendNeededForDelivery > 0 ) {
            canCheckout = false;
        }
        if( !restaurantIsOpen) {
            canCheckout = false;
        }
    }

    public void updateCanSubmitPayment() {
        
        canSubmitPayment = true;

        if(DELIVERY.equals(deliveryType)) {
            if( deliveryAddress == null || !deliveryAddress.isValid() || !deliveryAddress.isValidForCheckout() || !restaurantWillDeliver ) {
                canSubmitPayment = false;
            }
        }

        // If cannot checkout, cannot submit payment either
        if( !canCheckout ) {
            canSubmitPayment = false;
        }

    }


    /**
     * @param orderItemId
     */

    public void removeOrderItem(String orderItemId) {
        OrderItem orderItem = findByOrderItemId(orderItemId);
        if( orderItem != null ) {
            getOrderItems().remove(orderItem);
        }
    }


    /**
     * @param orderItemId
     * @param quantity
     */

    public void updateItemQuantity(String orderItemId, int quantity) {
        OrderItem orderItem = findByOrderItemId(orderItemId);
        if( orderItem != null ) {
            int newQuantity = orderItem.getQuantity() + quantity;
            if( newQuantity < 1 ) {
                getOrderItems().remove(orderItem);
            }
            else {
                orderItem.setQuantity(newQuantity);
            }
        }
    }
    
    
    /**
     * @param orderItem
     * @return
     */
    
    private OrderItem findExistingOrderItem(OrderItem orderItem) {
        for( OrderItem existingOrderItem: orderItems) {
            if( existingOrderItem.equals(orderItem)) {
                return existingOrderItem;
            }
        }
        return null;
    }


    /**
     * @param orderItemId
     * @return
     */

    private OrderItem findByOrderItemId(String orderItemId) {
        for( OrderItem orderItem: orderItems) {
            if( orderItemId.equals(orderItem.getOrderItemId())) {
                return orderItem;
            }
        }
        return null;
    }

    
    /**
     * @param dateTime
     * @return
     */

    public boolean isForCurrentDate(DateTime dateTime) {
        LocalDate today = new LocalDate(dateTime.getZone());
        LocalDate day = dateTime.toLocalDate();
        return today.equals(day);
    }


    /**
     * @param text
     */

    public void addOrderUpdate(String text) {
        OrderUpdate orderUpdate = new OrderUpdate();
        orderUpdate.setText(text);
        orderUpdate.setUpdateTime(new DateTime());
        orderUpdates.add(orderUpdate);
    }

        
    public boolean hasCashDiscount() {
        for( OrderDiscount discount: orderDiscounts ) {
            if( !Discount.DISCOUNT_FREE_ITEM.equals(discount.getDiscountType())) {
                return true;
            }
        }
        return false;
    }
    
    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public List<OrderItem> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(String restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public Boolean getPhoneOrdersOnly() {
        return phoneOrdersOnly;
    }

    public void setPhoneOrdersOnly(Boolean phoneOrdersOnly) {
        this.phoneOrdersOnly = phoneOrdersOnly;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(Restaurant restaurant) {
        this.restaurant = restaurant;
        this.restaurantId = restaurant.getRestaurantId();
        this.restaurantName = restaurant.getName();
        this.phoneOrdersOnly = restaurant.getPhoneOrdersOnly();
        this.restaurantDiscounts = restaurant.getDiscounts();
    }

    public Person getCustomer() {
        return customer;
    }

    public void setCustomer(Person customer) {
        this.customer = customer;
    }

    public String getDeliveryType() {
        return deliveryType;
    }

    public void setDeliveryType(String deliveryType) {
        this.deliveryType = deliveryType;
    }

    public String getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(String paymentType) {
        this.paymentType = paymentType;
    }

    public Address getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(Address deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }
    
    public Address getBillingAddress() {
        return billingAddress;
    }

    public void setBillingAddress(Address billingAddress) {
        this.billingAddress = billingAddress;
    }

    public String getAdditionalInstructions() {
        return additionalInstructions;
    }

    public void setAdditionalInstructions(String additionalInstructions) {
        this.additionalInstructions = additionalInstructions;
    }

    public boolean getTermsAndConditionsAccepted() {
        return termsAndConditionsAccepted;
    }

    public void setTermsAndConditionsAccepted(boolean termsAndConditionsAccepted) {
        this.termsAndConditionsAccepted = termsAndConditionsAccepted;
    }

    public boolean getCanCheckout() {
        return canCheckout;
    }

    public void setCanCheckout(boolean canCheckout) {
        this.canCheckout = canCheckout;
    }

    public boolean getHasDeliveryWarning() {
        return hasDeliveryWarning;
    }

    public void setHasDeliveryWarning(boolean hasDeliveryWarning) {
        this.hasDeliveryWarning = hasDeliveryWarning;
    }

    public boolean getCanSubmitPayment() {
        return canSubmitPayment;
    }

    public void setCanSubmitPayment(boolean canSubmitPayment) {
        this.canSubmitPayment = canSubmitPayment;
    }

    public String getAuthorisationCode() {
        return authorisationCode;
    }

    public void setAuthorisationCode(String authorisationCode) {
        this.authorisationCode = authorisationCode;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }

    public Double getCardPaymentAmount() {
        return cardPaymentAmount;
    }

    public void setCardPaymentAmount(Double cardPaymentAmount) {
        this.cardPaymentAmount = cardPaymentAmount;
    }

    public boolean getRestaurantIsOpen() {
        return restaurantIsOpen;
    }

    public void setRestaurantIsOpen(boolean restaurantIsOpen) {
        this.restaurantIsOpen = restaurantIsOpen;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public String getOrderNotificationStatus() {
        return orderNotificationStatus;
    }

    public void setOrderNotificationStatus(String orderNotificationStatus) {
        this.orderNotificationStatus = orderNotificationStatus;
    }

    public DateTime getOrderCreatedTime() {
        return orderCreatedTime;
    }

    public void setOrderCreatedTime(DateTime orderCreatedTime) {
        this.orderCreatedTime = orderCreatedTime;
    }

    public DateTime getLastCallPlacedTime() {
        return lastCallPlacedTime;
    }

    public void setLastCallPlacedTime(DateTime lastCallPlacedTime) {
        this.lastCallPlacedTime = lastCallPlacedTime;
    }

    public Integer getOrderNotificationCallCount() {
        return orderNotificationCallCount;
    }

    public void setOrderNotificationCallCount(Integer orderNotificationCallCount) {
        this.orderNotificationCallCount = orderNotificationCallCount;
    }

    public boolean isCallInProgress() {
        return callInProgress;
    }

    public void setCallInProgress(boolean callInProgress) {
        this.callInProgress = callInProgress;
    }

    public DateTime getOrderPlacedTime() {
        return orderPlacedTime;
    }

    public void setOrderPlacedTime(DateTime orderPlacedTime) {
        this.orderPlacedTime = orderPlacedTime;
    }

    public DateTime getExpectedDeliveryTime() {
        return expectedDeliveryTime;
    }

    public void setExpectedDeliveryTime(DateTime expectedDeliveryTime) {
        this.expectedDeliveryTime = expectedDeliveryTime;
    }
    
    public String getExpectedDeliveryTimeString() {
        return DateTimeUtil.formatOrderDate(expectedDeliveryTime);
    }

    public String getExpectedCollectionTimeString() {
        return DateTimeUtil.formatOrderDate(expectedCollectionTime);
    }

    public boolean getDeliveryTimeNonStandard() {
        return deliveryTimeNonStandard;
    }

    public void setDeliveryTimeNonStandard(boolean deliveryTimeNonStandard) {
        this.deliveryTimeNonStandard = deliveryTimeNonStandard;
    }

    public DateTime getExpectedCollectionTime() {
        return expectedCollectionTime;
    }

    public void setExpectedCollectionTime(DateTime expectedCollectionTime) {
        this.expectedCollectionTime = expectedCollectionTime;
    }

    public Double getOrderItemCost() {
        return orderItemCost;
    }

    public String getFormattedOrderItemCost() {
        return NumberUtil.format(orderItemCost == null? 0d: orderItemCost);
    }

    public void setOrderItemCost(Double orderItemCost) {
        this.orderItemCost = orderItemCost;
    }

    public Double getDeliveryCost() {
        return deliveryCost;
    }

    public void setDeliveryCost(Double deliveryCost) {
        this.deliveryCost = deliveryCost;
    }

    public String getFormattedDeliveryCost() {
        return NumberUtil.format(deliveryCost == null? 0d: deliveryCost);
    }

    public Double getExtraSpendNeededForDelivery() {
        return extraSpendNeededForDelivery;
    }

    public String getFormattedExtraSpendNeededForDelivery() {
        return NumberUtil.format(extraSpendNeededForDelivery == null? 0d: extraSpendNeededForDelivery);
    }

    public void setExtraSpendNeededForDelivery(Double extraSpendNeededForDelivery) {
        this.extraSpendNeededForDelivery = extraSpendNeededForDelivery;
    }

    public Double getCardTransactionCost() {
        return cardTransactionCost;
    }

    public void setCardTransactionCost(Double cardTransactionCost) {
        this.cardTransactionCost = cardTransactionCost;
    }

    public String getAdditionalRequestDetails() {
        return additionalRequestDetails;
    }

    public void setAdditionalRequestDetails(String additionalRequestDetails) {
        this.additionalRequestDetails = additionalRequestDetails;
    }

    public Boolean getCancellationOfferEmailSent() {
        return cancellationOfferEmailSent;
    }

    public void setCancellationOfferEmailSent(Boolean cancellationOfferEmailSent) {
        this.cancellationOfferEmailSent = cancellationOfferEmailSent;
    }

    public String getRestaurantDeclinedReason() {
        return restaurantDeclinedReason;
    }

    public void setRestaurantDeclinedReason(String restaurantDeclinedReason) {
        this.restaurantDeclinedReason = restaurantDeclinedReason;
    }

    public DateTime getRestaurantActionedTime() {
        return restaurantActionedTime;
    }

    public void setRestaurantActionedTime(DateTime restaurantActionedTime) {
        this.restaurantActionedTime = restaurantActionedTime;
    }

    public DateTime getRestaurantConfirmedTime() {
        return restaurantConfirmedTime;
    }

    public void setRestaurantConfirmedTime(DateTime restaurantConfirmedTime) {
        this.restaurantConfirmedTime = restaurantConfirmedTime;
    }

    public Double getTotalCost() {
        return totalCost;
    }

    public String getFormattedTotalCost() {
        return NumberUtil.format(totalCost == null? 0d: totalCost);
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getTransactionStatus() {
        return transactionStatus;
    }

    public void setTransactionStatus(String transactionStatus) {
        this.transactionStatus = transactionStatus;
    }

    public void setTotalCost(Double totalCost) {
        this.totalCost = totalCost;
    }

    public Double getRestaurantCost() {
        return restaurantCost;
    }

    public void setRestaurantCost(Double restaurantCost) {
        this.restaurantCost = restaurantCost;
    }

    public List<Discount> getRestaurantDiscounts() {
        return restaurantDiscounts;
    }

    public void setRestaurantDiscounts(List<Discount> restaurantDiscounts) {
        this.restaurantDiscounts = restaurantDiscounts;
    }

    public Double getTotalDiscount() {
        return totalDiscount;
    }

    public void setTotalDiscount(Double totalDiscount) {
        this.totalDiscount = totalDiscount;
    }

    public Double getVoucherDiscount() {
        return voucherDiscount;
    }

    public void setVoucherDiscount(Double voucherDiscount) {
        this.voucherDiscount = voucherDiscount;
    }

    public Double getCommission() {
        return commission;
    }

    public void setCommission(Double commission) {
        this.commission = commission;
    }

    public String getNextDiscountTitle() {
        return nextDiscountTitle;
    }

    public void setNextDiscountTitle(String nextDiscountTitle) {
        this.nextDiscountTitle = nextDiscountTitle;
    }

    public List<OrderUpdate> getOrderUpdates() {
        return orderUpdates;
    }

    public void setOrderUpdates(List<OrderUpdate> orderUpdates) {
        this.orderUpdates = orderUpdates;
    }

    public List<OrderAmendment> getOrderAmendments() {
        return orderAmendments;
    }

    public void setOrderAmendments(List<OrderAmendment> orderAmendments) {
        this.orderAmendments = orderAmendments;
    }

    public List<OrderDiscount> getOrderDiscounts() {
        return orderDiscounts;
    }

    public void setOrderDiscounts(List<OrderDiscount> orderDiscounts) {
        this.orderDiscounts = orderDiscounts;
    }
    
    public OrderDiscount getOrderDiscount(String discountId) {
        for( OrderDiscount orderDiscount: orderDiscounts ) {
            if( discountId.equals(orderDiscount.getDiscountId())) {
                return orderDiscount;
            }
        }
        return null;
    }

    public String getLocale() {
        return locale == null? MessageFactory.getLocaleString(): locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public Boolean getTestOrder() {
        return testOrder;
    }

    public void setTestOrder(Boolean testOrder) {
        this.testOrder = testOrder;
    }

    public String getVoucherId() {
        return voucherId;
    }

    public void setVoucherId(String voucherId) {
        this.voucherId = voucherId;
    }

    public Voucher getVoucher() {
        return voucher;
    }

    public void setVoucher(Voucher voucher) {
        if( voucher != null ) {
            this.voucherId = voucher.getVoucherId();
            this.voucher = voucher;
        }
    }

    public boolean getRestaurantWillDeliver() {
        return restaurantWillDeliver;
    }

    public void setRestaurantWillDeliver(boolean restaurantWillDeliver) {
        this.restaurantWillDeliver = restaurantWillDeliver;
    }
    
    public boolean getPhoneNumberViewed() {
        return phoneNumberViewed;
    }

    public void setPhoneNumberViewed(boolean phoneNumberViewed) {
        this.phoneNumberViewed = phoneNumberViewed;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }
}
