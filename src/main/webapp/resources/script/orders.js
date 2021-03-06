// Order position
var ordertop;
var orderbottom;

// Global order variables
var currentOrder;
var minimumOrderForFreeDelivery;
var allowDeliveryOrdersBelowMinimum;
var deliveryCharge;

// Global delivery variables
var deliveryType;
var days;
var deliveryTimes;
var collectionTimes;
var deliveryDayOfWeek;
var deliveryTimeOfDay;
var collectionOnly;
var open;

// Indicates if the current restaurant only supports phone orders
var isPhoneOrdersOnly;

// Runs when the page is loaded
$(document).ready(function(){
    getOrder();
});

function getOrder() {
    if( orderid && orderid != '') {
        $.fancybox.showLoading();
        $.post( ctx+'/order/getOrder.ajax?mgn=' + (Math.random() * 99999999),
            function( data ) {
                $.fancybox.hideLoading();
                if( data.success ) {
                    buildOrder(data.order);
                }
            }
        );
    }
}

// Returns the config for the order, can be overridden
function getOrderPanelConfig() {
    var config = {
        showDeliveryOptions: true,
        showBuildOrderLink: false,
        allowChangeLocation: true,
        allowRemoveItems: true,
        allowUpdateFreeItem: true,
        enableCheckoutButton: true,
        enablePaymentButton: false,
        showDiscountInformation: true,
        showAdditionalInformation: true,
        displayAdditionalInformation:false
    };
    return config;
}

// Event handler for before order is built, intended to be overriden
function onBeforeBuildOrder(order,config) {
}

// Event handler for after order is built, intended to be overriden
function onAfterBuildOrder(order,config) {
}

// Order build function
function buildOrder(order) {
    var config = getOrderPanelConfig();
    onBeforeBuildOrder(order,config);
    doBuildOrder(order,config);
    onAfterBuildOrder(order,config);
}

// Build the order display component
function doBuildOrder(order,config) {

    // Update current order object
    currentOrder = order;

    // If no location set, switch off some functionality
    if( !order.deliveryAddress.displaySummary ) {
        config.showDeliveryOptions = false;
    }

    // Indicate if we should enable additional order panel functionality and display
    var advancedDisplay = typeof(restaurantId) != 'undefined' || order.orderItems.length > 0;

    // Indicate if we are looking at a restaurant page other than the restaurant for the order
    var orderIsForAnotherRestaurant = typeof(restaurantId) != 'undefined' && order.restaurantId != restaurantId && order.orderItems.length > 0 ;

    // If this order is for another restaurant switch off some functionality
    if( orderIsForAnotherRestaurant ) {
        config.showDeliveryOptions = false;
        config.showDiscountInformation = false;
    }

    // Reset all previous order details
    $('.orderheadertext').remove();
    $('.ordertitle').remove();
    $('.restaurant-warning').remove();
    $('.order-location-wrapper').remove();
    $('.delivery-wrapper').remove();
    $('.order-item-wrapper').remove();
    $('.order-total-wrapper').remove();
    $('.discountrow').remove();
    $('.deliverychargerow').remove();
    $('.order-totalcost').remove();
    $('.order-free-item-wrapper').remove();
    $('.order-discount-wrapper').remove();
    $('.additional-information').remove();
    $('.checkout-container').remove();
    $('.delivery-warning-wrapper').remove();

    // Display order header
    if(orderIsForAnotherRestaurant) {
        $('.orderheader').append(('<div class=\'orderheadertext\'>{0}</div>').format(getLabel('order.your-order-with') + ' ' + unescapeQuotes(order.restaurantName) + ':'));
    } else {
        $('.orderheader').append(('<div class=\'orderheadertext\'>{0}</div>').format(getLabel('order.your-order')+':'));
    }

    // Show current location details
    if( order ) {

        var currentLocation = order.deliveryAddress.displaySummary? order.deliveryAddress.displaySummary: getLabel('location.not-set');
        var locationLink = config.allowChangeLocation? ('<a id=\'changelocation\' class=\'delivery-button unselectable\'>{0}</a>').format(getLabel('button.change')): '';
        var locationContainer = ('<div class=\'order-location-wrapper\' id=\'deliverylocation\'><div class=\'order-location-header\'><span class=\'order-location-title\'>{0}</span><span class=\'order-location-link\'>{1}</span><div class=\'order-location-summary\'>{2}</div></div>')
            .format(getLabel('location.your-location'), locationLink, currentLocation );
        $('#location-wrapper').append(locationContainer);
        if( config.allowChangeLocation ) {
            $('#changelocation').click(function(){
                locationEdit();
            });

            // Show radius warning if applicable
            if( order.hasDeliveryWarning && order.restaurantWillDeliver ) {
                var warning = ('<div class=\'location-warning-wrapper\'><div class=\'delivery-warning\'>{0}</div></div>').format(getLabel('order.delivery-radius-warning'));
                $('#deliverylocation').append(warning);
            }
        }
    }

    // Add the delivery options to the order if at least one item is added and it is enabled
    if( order && advancedDisplay ) {
        var deliveryDay, deliveryTime, orderType;
        var expectedTime = (order.deliveryType == 'DELIVERY'? order.expectedDeliveryTime: order.expectedCollectionTime);
        var orderType = (order.deliveryType == 'DELIVERY'? getLabel('order.delivery'): getLabel('order.collection'));
        if( !expectedTime ) {
            deliveryDayOfWeek = null;
            deliveryTimeOfDay = null;
            deliveryDay = getLabel('weekday.today');
            deliveryTime = getLabel('time.asap');
        } else {
            var time = new Date(expectedTime);
            deliveryDayOfWeek = (time.getDay() == 0? 7: time.getDay());
            deliveryTimeOfDay = (time.getHours() < 10? '0' + time.getHours(): time.getHours()) + ':' + (time.getMinutes() < 10? '0' + time.getMinutes(): time.getMinutes());
            deliveryDay = (deliveryDayOfWeek == new Date().getDay()? getLabel('weekday.today'): getLabel('weekday.day-of-week-'+deliveryDayOfWeek));
            deliveryTime = deliveryTimeOfDay;
        }

        var deliveryDetails = orderType + ': ' + deliveryDay + ' - ' + deliveryTime;
        var deliveryLink = config.showDeliveryOptions? ('<a id=\'deliveryedit\' class=\'delivery-button unselectable\'>{0}</a>').format(getLabel('button.change')): '';
        var deliveryContainer = ('<div class=\'order-location-wrapper\' id=\'deliverydetails\'><div class=\'order-location-header\'><span class=\'order-location-title\'>{0}</span><span class=\'order-location-link\'>{1}</span><div class=\'order-location-summary\'>{2}</div></div>')
            .format(getLabel('order.delivery-details'), deliveryLink, deliveryDetails );
        $('.order-delivery-wrapper').append(deliveryContainer);
        if( config.allowChangeLocation ) {
            $('#deliveryedit').click(function(){
                deliveryEdit();
            });
        }
    }

    // Build order details if an order exists
    if( order ) {

        // Generate order items
        for (var i = order.orderItems.length - 1; i >= 0; i--) {
            var orderItem = order.orderItems[i];
            if(config.allowRemoveItems) {
                var row = ('<div class=\'order-item-wrapper\'><table width=\'214\'><tr valign=\'top\'><td width=\'36\'><div class=\'order-item-edit\'><a onclick=\"updateQuantity(\'{0}\',1)\"><span class=\'order-add-item\'></span></a>{1}<a onclick=\"updateQuantity(\'{0}\',-1)\"><span class=\'order-remove-item\'></span></a></div></td><td width=\'128\'>{2}</td><td width=\'50\' align=\'right\'>{4} {3}</td></tr></table></div>')
                    .format(orderItem.orderItemId,orderItem.quantity,buildDisplay(orderItem),ccy,orderItem.formattedCost);
            } else {
                var row = '<div class=\'order-item-wrapper\'><table width=\'214\'><tr valign=\'top\'><td width=\'164\'>{0}</td><td width=\'50\' align=\'right\'>{1} {2}</td></tr>'
                    .format(buildStaticDisplay(orderItem),ccy,orderItem.formattedCost);
            }
            $('#order-item-contents').prepend(row);
        };

        // Add details of any free item discounts (display only)
        order.orderDiscounts.forEach(function(orderDiscount) {
            if( orderDiscount.discountType == 'DISCOUNT_FREE_ITEM' ) {
                if( config.allowUpdateFreeItem ) {
                    var selectBox = ('<select class=\'freeitemselect\' id=\'{0}\'>').format(orderDiscount.discountId);
                    selectBox += ('<option class=\'freeitemselect\' value = \'\'>{0}</option>').format(getLabel('order.no-thanks'));
                    orderDiscount.freeItems.forEach(function(freeItem) {
                        if( orderDiscount.selectedFreeItem == freeItem ) {
                            selectBox += ('<option class=\'freeitemselect\' value=\'{0}\' selected>{0}</option>').format(freeItem);
                        } else {
                            selectBox += ('<option class=\'freeitemselect\' value=\'{0}\'>{0}</option>').format(freeItem);
                        }
                    });
                    selectBox += '</select>';
                    var row = ('<div class=\'order-item-wrapper\'><table width=\'214\'><tr valign=\'top\'><td width=\'164\'><span class=\'semi-bold\'>{0}:</span><br/>{1}</td><td width=\'50\' align=\'right\'>{3} {2}</td></tr></table></div>').format(orderDiscount.title,selectBox,ccy,'0.00');
                    $('#order-item-contents').append(row);
                    $('#' + orderDiscount.discountId).change(function(){
                        var discountId = $(this).attr('id');
                        var freeItem = $(this).val();
                        updateFreeItem(discountId,freeItem);
                    });
                } else {
                    if( orderDiscount.selectedFreeItem && orderDiscount.selectedFreeItem != '') {
                        var row = ('<div class=\'order-item-wrapper\'><table width=\'214\'><tr valign=\'top\'><td width=\'164\'><span class=\'semi-bold\'>{0} ({1})</span></td><td width=\'50\' align=\'right\'>{3} {2}</td></tr></table></div>').format(orderDiscount.selectedFreeItem,getLabel('order.free'),ccy,'0.00');
                        $('#order-item-contents').append(row);
                    }
                }
            }
        });

        // If there are any items in the order, show the total order amount
        if( order.orderItemCost && order.orderItemCost > 0 ) {
            var row = ('<div class=\'order-item-wrapper\'><table width=\'214\'><tr valign=\'top\'><td width=\'164\'>{0}</td><td width=\'50\' align=\'right\'>{2} {1}</td></tr></table></div>').format(getLabel('order.order-item-cost'),ccy,order.formattedOrderItemCost);
            $('#order-item-contents').append(row);
        };

        // Add details of any cash discounts
        order.orderDiscounts.forEach(function(orderDiscount) {
            if( orderDiscount.discountType != 'DISCOUNT_FREE_ITEM' ) {
                var row = ('<div class=\'order-item-wrapper\'><table width=\'214\'><tr valign=\'top\'><td width=\'164\'>{0}</td><td width=\'50\' align=\'right\'>-{2} {1}</td></tr></table></div>').format(orderDiscount.title,ccy,orderDiscount.formattedAmount);
                $('#order-item-contents').append(row);
            }
        });

        // Add delivery charge if applicable
        if( order.deliveryCost && order.deliveryCost > 0 ) {
            var row = ('<div class=\'order-item-wrapper\'><table class=\'order-cash-discount\' width=\'214\'><tr valign=\'top\'><td width=\'164\'>' + getLabel('order.delivery-charge') + '</td><td width=\'50\' align=\'right\'>{1} {0}</td></tr>').format(ccy,order.formattedDeliveryCost);
            $('#order-item-contents').append(row);
        }

        // Add voucher if applicable
        if( order.voucher != null ) {
            var voucher = order.voucher;
            var row = '<div class=\'order-item-wrapper\'><table width=\'214\'><tr valign=\'top\'><td width=\'164\'>{0} (-{1}%)</td><td width=\'50\' align=\'right\'>-{3} {2}</td></tr>'
                .format(voucher.voucherId,voucher.discount.toFixed(0),ccy,order.voucherDiscount.toFixed(2));
            $('#order-item-contents').append(row);
        }

        // Build total order item
        var row = ('<div class=\'order-total-wrapper\'><span class=\'order-total-left\'>{0}</span><span class=\'order-total-right\'>{1} {2}</span></div>').format(getLabel('order.total'),order.formattedTotalCost,ccy);
        $('#order-item-contents').append(row);

        // Show details of discounts if available and if we are either on a menu page or there are items
        if( advancedDisplay && config.showDiscountInformation && order.restaurantDiscounts.length > 0 ) {
            var discountItems = '';
            var discountIndex = 0;
            order.restaurantDiscounts.forEach(function(discount){
                var cls = discountIndex == 0? 'order-discount-item': 'order-discount-item order-discount-separator';
                var description = discount.description && discount.description != ''? '<br>' + unescape(discount.description): '';
                discountItems += ('<div class=\'{0}\'>{1}{2}</div>').format(cls, unescape(discount.title), description);
                discountIndex++;
            });
            var discountItemHeader = ('<h2>{0}:</h2>').format(getLabel('order.discounts-available'));
            var discountContainer = ('<div class=\'order-discount-wrapper\'>{0}{1}</div>').format(discountItemHeader,discountItems);
            $('#discounts').append(discountContainer);
        }

        // Show link for adding additional information if this exists
        if( config.showAdditionalInformation ) {
            var additionalInformationLink = ('<div class=\'additional-information\'><a id=\'additionalinformation\' class=\'delivery-button unselectable\'>{0}</a> {1}</div>')
                .format(getLabel('button.click-here'), getLabel('order.to-add-additional-instructions'));
            $('#additionalinstructions').append(additionalInformationLink);
            $('#additionalinstructions').click(function(){
                editAdditionalInstructions();
            });
        } else if( config.displayAdditionalInformation && order.additionalInstructions != '' && order.additionalInstructions != null ) {
            // Display actual additional information in the order panel
            var additionalInformationDisplay = ('<div class=\'additional-information\'><h2>{0}</h2><div>{1}</div></div>')
                .format(getLabel('order.additional-instructions'),unescapeQuotesAndBreaks(order.additionalInstructions));
            $('#additionalinstructions').append(additionalInformationDisplay);
        }

        // If the restaurant does not deliver to this location, show a warning
        if( order.deliveryType == 'DELIVERY' && order.deliveryAddress.displaySummary && !order.restaurantWillDeliver ) {
            var warningMessage = getLabel('order.restaurant-wont-deliver-warning');
            var warning = ('<div class=\'delivery-warning-wrapper\'><div class=\'delivery-warning\'>{0}</div></div>').format(warningMessage.format(unescapeQuotes(order.restaurantName)));
            $('#deliverycheck').append(warning);
            if (config.enablePaymentButton) {
                $('#checkoutcontainer').append(('<div class="checkout-container"><div class="checkout-button-container"><div class="button-green" id="checkoutbutton"><div class="button-text">{0}</div></div></div></div>').format(getLabel('button.payment')));
                $('#checkoutbutton').click(function(){
                    payment();
                });
            }
        } else if( advancedDisplay && !order.restaurantIsOpen && config.showDeliveryOptions ) {
            var warningMessage = (order.deliveryType == 'DELIVERY'? getLabel('order.restaurant-delivery-closed-warning'): getLabel('order.restaurant-collection-closed-warning'));
            var warning = ('<div class=\'delivery-warning-wrapper\'><div class=\'delivery-warning\'>{0}</div></div>').format(warningMessage.format(order.restaurantName));
            $('#deliverycheck').append(warning);
        } else if( order.extraSpendNeededForDelivery && order.extraSpendNeededForDelivery > 0 ) {
            var warning = ('<div class=\'delivery-warning-wrapper\'><div class=\'delivery-warning\'>' + getLabel('order.delivery-warning') + '</div></div>' ).format(order.formattedExtraSpendNeededForDelivery,ccy);
            $('#deliverycheck').append(warning);
        } else {

            // Show checkout button if enabled
            if(order.canCheckout ) {
                if( config.enableCheckoutButton ) {
                    // For phone orders only restaurant we use a different button
                    if( order.phoneOrdersOnly ) {
                        $('#checkoutcontainer').append(('<div class="checkout-container"><div class="checkout-button-container"><div class="button-green" id="callnowbutton"><div class="button-text">{0}</div></div></div></div>').format(getLabel('button.call-now')));
                        $('#callnowbutton').click(function(){
                            checkout();
                        });
                    }else{
                        $('#checkoutcontainer').append(('<div class="checkout-container"><div class="checkout-button-container"><div class="button-green" id="checkoutbutton"><div class="button-text">{0}</div></div></div></div>').format(getLabel('button.checkout')));
                        $('#checkoutbutton').click(function(){
                            checkout();
                        });
                    }
                } else if (config.enablePaymentButton) {
                    $('#checkoutcontainer').append(('<div class="checkout-container"><div class="checkout-button-container"><div class="button-green" id="checkoutbutton"><div class="button-text">{0}</div></div></div></div>').format(getLabel('button.payment')));
                    $('#checkoutbutton').click(function(){
                        payment();
                    });
                }
            }
        }
    } else {
        $('#ordertotal').append('<span class=\'order-totalcost\'>0.00 ' + ccy + '</span>');
    }
}

// Empty payment function (should override)
function payment() {
}

// Displays location entry warning
function showLocationWarning() {

    var header = ('<div class=\'dialog-header\'><h2>{0}</h2></div>').format(getLabel('location.location-not-set'));
    var content = ('<div class=\'dialog-warning-wrapper\'>{0}</div>').format(getLabel('order.no-location-warning'));
    var container = ('<div class=\'dialog-wrapper\'>{0}{1}</div>').format(header,content);

    $.fancybox.open({
        type: 'html',
        content: container,
        autoSize:false,
        width:400,
        autoHeight:true,
        modal:false,
        openEffect:'none',
        closeEffect:'none'
    });
}

// Displays an order item for use when items can be incremented
function buildDisplay(orderItem) {
    var display = unescapeQuotes(orderItem.menuItemTitle);
    if( orderItem.menuItemTypeName ) {
        display += ' (' + unescapeQuotes(orderItem.menuItemTypeName) + ')';
    }
    if( orderItem.menuItemSubTypeName ) {
        display += ' (' + unescapeQuotes(orderItem.menuItemSubTypeName) + ')';
    }
    orderItem.additionalItems.forEach(function(additionalItem){
        display += ('<div class=\'additionalitem\'>- {0}</div>').format(unescapeQuotes(additionalItem));
    });
    return ('<div class=\'order-item-display\'>{0}</div>').format(display);
}

// Displays a static order item
function buildStaticDisplay(orderItem) {
    var display = orderItem.quantity + ' x ' + unescapeQuotes(orderItem.menuItemTitle);
    if( orderItem.menuItemTypeName ) {
        display += ' (' + unescapeQuotes(orderItem.menuItemTypeName) + ')';
    }
    if( orderItem.menuItemSubTypeName ) {
        display += ' (' + unescapeQuotes(orderItem.menuItemSubTypeName) + ')';
    }
    orderItem.additionalItems.forEach(function(additionalItem){
        display += ('<div class=\'additionalitem\'>- {0}</div>').format(unescapeQuotes(additionalItem));
    });
    return ('<div>{0}</div>').format(display);
}

// Add multiple items based on the select value
function addMultipleToOrder(restaurantId, itemId, itemType, itemSubType, additionalItemArray, additionalItemLimit, forceAdditionalItemLimit, additionalItemCost, itemCost ) {

    // If no location set, break
    if( !currentOrder.deliveryAddress.displaySummary ) {
        showLocationWarning();
        return;
    }

    // Check restaurant with callback on restaurant id
    restaurantCheck(restaurantId, function(){
        doAddToOrderCheck(restaurantId, itemId, itemType, itemSubType, additionalItemArray, additionalItemLimit, forceAdditionalItemLimit, additionalItemCost, itemCost, 1);
    });
}

// Edit delivery options
function deliveryEdit() {
    $.fancybox.showLoading();
    $.post( ctx+'/order/deliveryEdit.ajax', { orderId: currentOrder.orderId },
        function( data ) {
            $.fancybox.hideLoading();
            if( data.success ) {
                buildDeliveryEdit(data.days, data.deliveryTimes, data.collectionTimes, data.open, data.collectionOnly);
            } else {
                alert(data.success);
            }
        }
    );
}

// Build delivery edit form
function buildDeliveryEdit(daysArray, deliveryTimesArray, collectionTimesArray, isOpen, isCollectionOnly) {

    // Update global delivery variables
    days = daysArray;
    deliveryTimes = deliveryTimesArray;
    collectionTimes = collectionTimesArray;
    deliveryType = currentOrder.deliveryType;
    open = isOpen;
    collectionOnly = isCollectionOnly;

    // Indicates if the current option is for delivery
    var isdelivery = deliveryType == 'DELIVERY';

    // If deliverytimes and collection times are both empty, alert an error
    var hasDeliveryTime = false;
    deliveryTimes.forEach(function(deliveryTime){
        if(deliveryTime.length > 0 ) {
            hasDeliveryTime = true;
        }
    });

    var hasCollectionTime = false;
    collectionTimes.forEach(function(collectionTime){
        if(collectionTime.length > 0 ) {
            hasCollectionTime = true;
        }
    });

    // Restaurant not open for delivery or collection in the near future
    if( !hasDeliveryTime && !hasCollectionTime ) {

        var header = ('<div class=\'dialog-header\'><h2>{0}</h2></div>').format(getLabel('order.restaurant-closed'));
        var subheader = ('<div class=\'dialog-subheader\'><div class=\'dialog-warning-wrapper\'>{0}</div></div>').format(getLabel('order.restaurant-closed-warning'));
        var container = ('<div class=\'dialog-wrapper\'>{0}{1}<div class=\'dialog-footer\'></div>').format(header,subheader);

        $.fancybox.open({
            type: 'html',
            content: container,
            autoSize:false,
            width:400,
            autoHeight:true,
            modal:false,
            openEffect:'none',
            closeEffect:'none'
        });

        return;
    }

    // Initialize wrapper for delivery options
    var deliveryContainer;

    // Build delivery edit options if there are options for both delivery and collection
    var deliveryRadio = ('<span class=\'deliveryradio\'><input type=\'radio\' id=\'radioDelivery\' name=\'deliveryType\' value=\'DELIVERY\'{0} {1}</span>').format((isdelivery?' CHECKED>':'>'),getLabel('order.delivery'));
    var collectionRadio = ('<span class=\'deliveryradio\'><input type=\'radio\' id=\'radioCollection\' name=\'deliveryType\' value=\'COLLECTION\'{0} {1}</span>').format((isdelivery?'>':' CHECKED>'),getLabel('order.collection'));
    var deliveryContainer;
    if( collectionOnly ) {
        deliveryContainer = ('<div class=\'delivery-options-wrapper\'>{0}</div>').format(collectionRadio);
    } else {
        deliveryContainer = ('<div class=\'delivery-options-wrapper\'>{0}{1}</div>').format(deliveryRadio,collectionRadio);
    }

    // Build selection fields for day and time based on current delivery type
    var times = (deliveryType == 'DELIVERY'? deliveryTimes: collectionTimes);
    var deliverySelectContainer = buildDeliverySelection(days,times);

    // Build save and cancel buttons
    var saveButton = '<a id=\'deliverysave\' class=\'delivery-button unselectable\'>' + getLabel('button.update') + '</a>';
    var cancelButton = '<a id=\'deliverycancel\' class=\'delivery-button unselectable\'>' + getLabel('button.cancel') + '</a>';
    var buttonContainer = ('<div class=\'delivery-buttons\'>{0} {1}</div>').format(saveButton,cancelButton);

    // Remove the existing delivery wrapper
    $('.delivery-wrapper').remove();

    // Add the new options in the same area
    $('#deliverydetails').append(('<div class=\'delivery-wrapper\'><div class=\'delivery-form\'>{0}{1}</div>{2}</div>').format(deliveryContainer,deliverySelectContainer,buttonContainer));

    // Add onchange events to the delivery radio buttons if they are present
    if( hasDeliveryTime && hasCollectionTime ) {
        $('#radioDelivery').change(function(){
            updateDeliveryType('DELIVERY',days,deliveryTimes);
        });
        $('#radioCollection').change(function(){
            updateDeliveryType('COLLECTION',days,collectionTimes);
        });
    }

    // Default to collection only for collection only restaurants
    if( collectionOnly ) {
        $('#radioCollection').prop('checked',true);
        updateDeliveryType('COLLECTION',days,collectionTimes);
    }

    // Add onchange event to the day select field to repopulate available times
    $('#dayselect').change(function(){
        var selectedDay = $('#dayselect').val();
        var times = (deliveryType == 'DELIVERY'? deliveryTimes: collectionTimes);
        var timeSelect = buildDeliveryTimeSelect(selectedDay,times);
        $('#timeselect').remove();
        $('.delivery-header').append(timeSelect);
    });

    // Add onclick event to the save button
    $('#deliverysave').click(function(){
        var update = {
            orderId: currentOrder.orderId,
            deliveryType: deliveryType,
            dayIndex: $('#dayselect').val(),
            time: $('#timeselect').val()
        };
        $.fancybox.showLoading(getLabel('ajax.updating-order'));
        $.post( ctx+'/order/updateOrderDelivery.ajax', { body: JSON.stringify(update) },
            function( data ) {
                $.fancybox.hideLoading();
                if( data.success ) {
                    buildOrder(data.order);
                } else {
                    alert(data.success);
                }
                onAfterUpdateDelivery();
            }
        );
    });

    // Add onclick event to the cancel button
    $('#deliverycancel').click(function(){
        buildOrder(currentOrder);
    });

    // If a date and time are selected, apply selection now
    if( deliveryDayOfWeek && deliveryTimeOfDay ) {
        for( var i = 0; i < days.length; i++ ) {
            if( days[i] == deliveryDayOfWeek ) {
                $('#dayselect').val(i);
                var times = (deliveryType == 'DELIVERY'? deliveryTimes: collectionTimes);
                var timeSelect = buildDeliveryTimeSelect(i,times);
                $('#timeselect').remove();
                $('.delivery-header').append(timeSelect);
                $('#timeselect').val(deliveryTimeOfDay);
            }
        }
    }

    // Run onBuildDeliveryEdit callback
    onBuildDeliveryEdit();

}

// Empty build delivery edit function, can override
function onBuildDeliveryEdit() {
}

// Empty update delivery function, can override
function onAfterUpdateDelivery() {
}

// Updates the selected delivery type
function updateDeliveryType(updatedDeliveryType,days,times) {

    // Update global variable
    deliveryType = updatedDeliveryType;

    // Rebuild select day and times
    var deliverySelection = buildDeliverySelection(days,times);

    // Replace select fields
    $('.delivery-header').remove();
    $('.delivery-form').append(deliverySelection);

    // Update onchange event for dayselect
    $('#dayselect').change(function(){
        var selectedDay = $('#dayselect').val();
        var timeSelect = buildDeliveryTimeSelect(selectedDay,times);
        $('#timeselect').remove();
        $('.delivery-header').append(timeSelect);
    });
}

// Builds select fields for day and time based on delivery type
function buildDeliverySelection(days,times) {
    var deliveryTimeContainer = '<div class=\'delivery-header\'>{0} - {1}</div>';
    var deliveryDaySelect = buildDeliveryDaySelect(days,times);
    var firstAvailableDay = 0;
    for( var i = 0; i < days.length; i++ ) {
        if( i == 0 ) {
            if( open ) {
                firstAvailableDay = 0;
                break;
            }
        }
        if(times[i].length > 0) {
            firstAvailableDay = i;
            break;
        }
    }
    var deliveryTimeSelect = buildDeliveryTimeSelect(firstAvailableDay,times);
    return deliveryTimeContainer.format(deliveryDaySelect,deliveryTimeSelect);
}

// Builds an array of available days that can be selected
function buildDeliveryDaySelect(days,times) {
    var select = '<select id=\'dayselect\' class=\'deliveryselect\'>';
    for( var i = 0; i < days.length; i++ ) {
        var timeArray = times[i];

        // Special case for empty time array but restaurant is currently open
        if( i == 0 && open ) {
            var optionLabel = getLabel('weekday.today');
            select += ('<option value=\'{0}\'>{1}</option>').format(i,optionLabel);
            continue;
        }

        if( timeArray.length > 0 || ( i == 0 && open )) {
            var optionLabel = (i == 0? getLabel('weekday.today'): getLabel('weekday.day-of-week-' + days[i]));
            select += ('<option value=\'{0}\'>{1}</option>').format(i,optionLabel);
        }
    }
    select += '</select>';
    return select;
}

// Builds an array of times that can be selected
function buildDeliveryTimeSelect(selectedDay,times) {
    var select = '<select id=\'timeselect\' class=\'deliveryselect\'>';
    var timeArray = times[selectedDay];
    if( selectedDay == 0 && open ) {
        select += ('<option value=\'{0}\'>{1}</option>').format('ASAP',getLabel('time.asap'));
    }
    timeArray.forEach(function(time){
        select += ('<option value=\'{0}\'>{0}</option>').format(time);
    });
    select += '</select>';
    return select;
}

// Edits additional instructions for an order
function editAdditionalInstructions() {

    var additionalInstructions = currentOrder.additionalInstructions || '';

    var header = getLabel('order.additional-instructions');
    var subheader = getLabel('order.additional-instructions.help');
    var content = ('<textarea id=\'instructions\'>{0}</textarea>').format(unescapeQuotes(additionalInstructions).replace('<br>','\n'));
    var buttons = ('<a id=\'updatebutton\' class=\'order-button order-button-large unselectable\'>{0}</a>').format(getLabel('button.save-changes'));

    var container = ('<div class=\'dialog-container\'><div class=\'dialog-header\'><h2>{0}</h2></div><div class=\'dialog-subheader\'>{1}</div><div class=\'dialog-content\'>{2}</div><div class=\'dialog-footer\'><div class=\'dialog-buttons\'>{3}</div></div></div>')
        .format(header,subheader,content,buttons);

    $.fancybox.open({
        type: 'html',
        content: container,
        modal:false,
        autoSize:false,
        autoHeight: true,
        width: 500,
        openEffect:'none',
        closeEffect:'none'
    });

    $('#updatebutton').click(function(){
        var additionalInstructions = $('#instructions').val();
        $.fancybox.showLoading();
        $.post( ctx+'/order/updateAdditionalInstructions.ajax', {
            orderId: currentOrder.orderId,
            additionalInstructions: $('#instructions').val()
        },function( data ) {
                $.fancybox.hideLoading();
                $.fancybox.close(true);
                if( data.success ) {
                    buildOrder(data.order);
                } else {
                    alert('success:' + data.success);
                }
            }
        );
    });
}

// Confirm if order should proceed
function restaurantCheck(restaurantId, callback ) {
    if( currentOrder && currentOrder.orderItems.length > 0 && currentOrder.restaurantId != restaurantId ) {

        var header = getLabel('order.are-you-sure');
        var content1 = ('<div class=\'dialog-content-text\'>' + getLabel('order.restaurant-warning-1') + '</div>').format(unescapeQuotes(currentOrder.restaurantName));
        var content2 = ('<div class=\'dialog-content-text\'>' + getLabel('order.restaurant-warning-2') + '</div>').format(unescapeQuotes(currentOrder.restaurantName));
        var content3 = ('<div class=\'dialog-content-text\'>{0}</div>').format(getLabel('order.restaurant-warning-3'));
        var subheader = ('<div class=\'dialog-warning-wrapper\'>{0}{1}{2}</div>').format(content1,content2,content3);
        var addItemButton = ('<a id=\'additembutton\' class=\'order-button unselectable\'>{0}</a>').format(getLabel('button.add-item-anyway'));
        var cancelButton = ('<a id=\'cancelbutton\' class=\'order-button unselectable\'>{0}</a>').format(getLabel('button.dont-add-item'));
        var buttons = addItemButton + ' ' + cancelButton;

        var container = ('<div class=\'dialog-container\'><div class=\'dialog-header\'><h2>{0}</h2></div><div class=\'dialog-subheader\'>{1}</div><div class=\'dialog-content\'></div><div class=\'dialog-footer\'><div class=\'dialog-buttons\'>{2}</div></div></div>')
            .format(header,subheader,buttons);

        // Show the dialog
        $.fancybox.open({
            type: 'html',
            content: container,
            modal:false,
            autoSize:false,
            autoHeight: true,
            width: 500,
            openEffect:'none',
            closeEffect:'none'
        });

        // Add click event handlers
        $('#cancelbutton').click(function(){
            $.fancybox.close(true);
        });

        $('#additembutton').click(function(){
            $.fancybox.close(true);
            callback();
        });
    } else {
        callback();
    }
}

// Update current location
function locationEdit() {

    var locationField = ('<input class=\'input-location\' id=\'locedit\' placeholder=\'\'/>').format(getLabel('search.watermark'));
    var searchButton = ('<div class=\'search-small\'><div class=\'search-button-text-small\'>{0}</div></div>').format(getLabel('button.search'));
    var locationTable = ("<table width=\'390\'><tr valign=\'middle\'><td width=\'290\'>{0}</td><td width=\'100\'>{1}</td></tr></table").format(locationField,searchButton);
    var locationEdit = ('<div class=\'search-location-edit\'>{0}</div>').format(locationTable);

    var header = ('<div class=\'dialog-header\'><h2>{0}</h2></div>').format(getLabel('location.enter-your-location'));
    var content = ('<div class=\'dialog-content\'>{0}</div>').format(locationTable);
    var container = ('<div class=\'dialog-container\'>{0}{1}</div>').format(header,content);

    $.fancybox.open({
        type: 'html',
        content: container,
        modal:false,
        autoSize:false,
        autoWidth:true,
        height:145,
        openEffect:'none',
        closeEffect:'none'
    });

    $('#locedit').attr('placeholder','');
    $('#locedit').watermark(watermark);
    $('#locedit').focus();

    // Add event handlers
    $('#locedit').keydown(function(event){
        if( event.keyCode == 13 ) {
            locationSearch();
        }
    });

    $('.search-small').click(function(){
        locationSearch();
    });

    // Enable Google autocomplete
    var input = document.getElementById('locedit');
    var options = {
      types: ['geocode'],
      componentRestrictions: {country: country}
    };
    autocomplete = new google.maps.places.Autocomplete(input, options);
}

// Update order location
function locationSearch() {
    var location = $('#locedit').val();
    if( location != '' ) {
        $.fancybox.showLoading(getLabel('ajax.checking-your-location'));
        $.post( ctx+'/validateLocation.ajax', { loc: location },
            function( data ) {
                $.fancybox.hideLoading();
                if( data.success ) {
                    $.fancybox.close(true);
                    onAfterLocationUpdate();
                }
            }
        );
    }
}

// Runs after location is updated (can be overridden)
function onAfterLocationUpdate() {
    $.fancybox.showLoading();
    location.reload();
}

// Add item to order, check if need to display additional item dialog
function doAddToOrderCheck(restaurantId, itemId, itemType, itemSubType, additionalItemArray, additionalItemLimit, forceAdditionalItemLimit, additionalItemCost, itemCost, quantity ) {
    if( additionalItemArray.length > 0 ) {
        buildAdditionalItemDialog(restaurantId, itemId, itemType, itemSubType, additionalItemArray, additionalItemLimit, forceAdditionalItemLimit, additionalItemCost, itemCost, quantity );
    } else {
        doAddToOrder(restaurantId, itemId, itemType, itemSubType, [], quantity )
    }
}

// Build dialog to show additional choices for a menu item
function buildAdditionalItemDialog(restaurantId, itemId, itemType, itemSubType, additionalItemArray, additionalItemLimit, forceAdditionalItemLimit, additionalItemCost, itemCost, quantity ) {

    var selectedItems = new HashTable();
    var itemCosts = new HashTable();

    var html = '';
    var itemLimit = additionalItemLimit? additionalItemLimit: 0;
    var forceItemLimit = forceAdditionalItemLimit;
    var defaultItemCost = additionalItemCost? additionalItemCost: 0;
    var canAddToOrder = true;

    if( itemLimit > 0 && forceItemLimit ) {
        canAddToOrder = false;
    }

    var currentQuantity = quantity;
    var currentCost = itemCost;

    // Work out how to split rows across tables
    var itemCount = additionalItemArray.length;
    var defaultBreak = 6;
    var rowBreak = Math.ceil(Math.max(itemCount / 2, defaultBreak ));
    var tableWidth = (itemCount <= defaultBreak)? 300:200;

    // Build the total cost item and quantity
    var descriptionLabel = forceItemLimit? 'order.additional-item-exact-description': 'order.additional-item-limit-description';
    var itemLimitDescription = (itemLimit > 0? ('<div class=\'additional-item-description\'>{0}</div>').format(getLabel(descriptionLabel).format(itemLimit)): '');
    var itemDefaultCostDescription = (defaultItemCost > 0? ('<div class=\'additional-item-description\'>{0} <b>{1}</b></div>').format(getLabel('order.additional-item-cost-description'), defaultItemCost.toFixed(2) + ' ' + ccy): '');
    var itemDescriptionContainer = '';
    if( itemLimitDescription != '' || itemDefaultCostDescription != '' ) {
        itemDescriptionContainer = ('<div class=\'additional-item-description-wrapper\'>{0}{1}</div>').format(itemLimitDescription,itemDefaultCostDescription);
    }

    // Build the container for showing the quantity and total cost
    var itemQuantityField = ('<div class=\'additional-item-quantity\'>{0}: <input id=\'quantity\' value=\'{1}\'/></div>').format(getLabel('order.quantity'),quantity);
    var itemTotalField = ('<div class=\'additional-item-total-cost\'><span id=\'itemcost\'></span> {0}</div>').format(ccy);
    var itemCostContainer = ('<div class=\'additional-item-cost-wrapper\'>{0}{1}</div>').format(itemQuantityField,itemTotalField);

    // Build warning div for additional item limit
    var itemWarningContainer = '<div id=\'itemcountwarning\'></div>';

    var additionalItemChoiceContainer = '<div class=\'additional-item-grid\'>';

    // Build container for additional item choices
    for( var i = 0; i < itemCount; i++ ) {
        if( i % rowBreak == 0 ) {
            if( i > 0 ) {
                additionalItemChoiceContainer += '</table></div>';
            }
            additionalItemChoiceContainer += ('<div class=\'additional-item-table\'><table width=\'{0}\'>').format(tableWidth);
        }

        var additionalItemElements = additionalItemArray[i].split('%%%');
        var additionalItemName = additionalItemElements[0];
        var additionalItemCost = additionalItemElements[1];

        if( defaultItemCost > 0 ) {
            itemCosts.setItem(additionalItemName, defaultItemCost);
        } else {
            itemCosts.setItem(additionalItemName, (additionalItemCost == 'null'? 0: additionalItemCost));
        }

        var additionalItemTitleDiv = ('<div class=\'additional-item-title\'><input type=\'checkbox\' class=\'itemcheckbox\' id=\'{0}\'/>&nbsp;&nbsp;<span id=\'{1}_span\'>{2}</span></div>')
            .format(additionalItemName,additionalItemName.replace(/\s/g,'_').replace(/###/g,'_').replace(/\(/g,'_').replace(/\)/g,'_'), unescapeQuotes(additionalItemName));
        var additionalItemCostDiv = ('<div class = \'additional-item-cost\'>{0}</div').format((additionalItemCost == 'null'? '': additionalItemElements[1] + ccy));
        additionalItemChoiceContainer += ('<tr valign=\'top\'><td width=\'150\'>{0}</td><td width=\'50\' align=\'right\'>{1}</td></tr>').format(additionalItemTitleDiv,additionalItemCostDiv);

    }
    additionalItemChoiceContainer += '</table></div></div>';

    // Build buttons for save and cancel
    var addItemButton = ('<a id=\'additembutton\' class=\'order-button order-button-large unselectable\'>{0}</a>').format(getLabel('button.done'));
    var cancelButton = ('<a id=\'cancelbutton\' class=\'order-button order-button-large unselectable\'>{0}</a>').format(getLabel('button.cancel'));
    var buttonContainer = ('<div class=\'dialog-buttons\'>{0} {1}</div>').format(addItemButton,cancelButton);

    // Build main container for additional items
    var header = ('<div class=\'dialog-header\'><h2>{0}</h2></div>').format(getLabel('order.choose-additional'));
    var subheader = (itemDescriptionContainer == ''? '': ('<div class=\'dialog-subheader\'>{0}</div>').format(itemDescriptionContainer));
    var content = ('<div class=\'dialog-content\'>{0}{1}{2}</div>').format(itemWarningContainer,additionalItemChoiceContainer,itemCostContainer);
    var footer = ('<div class=\'dialog-footer\'>{0}</div>').format(buttonContainer);

    var container = ('<div class=\'dialog-container\'><div class=\'additional-items-wrapper\'>{0}{1}{2}{3}</div></div>').format(header,subheader,content,footer);

    $.fancybox.open({
        type: 'html',
        content: container,
        modal:false,
        autoSize:true,
        openEffect:'none',
        closeEffect:'none'
    });

    // Update the total cost
    $('#itemcost').append(('<span id=\'itemtotalcost\'>{0}</span>').format((currentCost * currentQuantity).toFixed(2)));

    // Only allow numeric input in quantity field
    $("#quantity").keydown(function(event) {
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 ||
            (event.keyCode == 65 && event.ctrlKey === true) ||
            (event.keyCode >= 35 && event.keyCode <= 39)) {
                 return;
        } else {
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault();
            }
        }
    });

    // Update total cost on quantity update
    $("#quantity").keyup(function(event) {
        currentQuantity = ($('#quantity').val() == ''? 0: $('#quantity').val());
        $('#itemtotalcost').remove();
        $('#itemcost').append(('<span id=\'itemtotalcost\'>{0}</span>').format((currentCost * currentQuantity).toFixed(2)));
    });

    // Handler for the cancel button
    $('#cancelbutton').click(function(){
        $.fancybox.close(true);
    });

    // Handler for the done button
    $('#additembutton').click(function(){
        if( canAddToOrder ) {
            if( currentQuantity != '' && currentQuantity > 0 ) {
                doAddToOrder(restaurantId, itemId, itemType, itemSubType, selectedItems.keys(), currentQuantity );
            }
            $.fancybox.close(true);
        }
        else {
            if( itemLimit > 0 && forceItemLimit && selectedItems.size() < itemLimit ) {
                $('#itemcountwarning').append(('<div class=\'itemcountwarning\'>{0}</div>').format(getLabel('order.additional-item-exact-limit')).format(itemLimit));
            }
        }
    });

    // Handler to maintain the selected additional items
    $('.itemcheckbox').change(function(){
        if($(this).is(':checked')) {
            selectedItems.setItem($(this).attr('id'), "");
            $('#' + $(this).attr('id').replace(/\s/g,'_').replace(/###/g,'_').replace(/\(/g,'_').replace(/\)/g,'_') + '_span').addClass('red');
            currentCost += parseFloat(itemCosts.getItem($(this).attr('id')));
        } else {
            selectedItems.removeItem($(this).attr('id'));
            $('#' + $(this).attr('id').replace(/\s/g,'_').replace(/###/g,'_').replace(/\(/g,'_').replace(/\)/g,'_') + '_span').removeClass('red');
            currentCost -= parseFloat(itemCosts.getItem($(this).attr('id')));
        }
        $('#itemtotalcost').remove();
        $('#itemcost').append(('<span id=\'itemtotalcost\'>{0}</span>').format((currentCost * currentQuantity).toFixed(2)));

        canAddToOrder = true;
        $('.itemcountwarning').remove();
        if( itemLimit > 0 && selectedItems.size() > itemLimit ) {
            canAddToOrder = false;
            $('#itemcountwarning').append(('<div class=\'itemcountwarning\'>{0}</div>').format(getLabel('order.additional-item-limit')).format(itemLimit));
        }
        else if( itemLimit > 0 && forceItemLimit && selectedItems.size() < itemLimit ) {
            canAddToOrder = false;
        }
    });
}

// Add item to order update result on display
function doAddToOrder(restaurantId, itemId, itemType, itemSubType, additionalItems, quantity ) {

    var update = {
        restaurantId: restaurantId,
        itemId: itemId,
        itemType: unescape(itemType),
        itemSubType: unescape(itemSubType),
        additionalItems: unescapeArray(additionalItems),
        quantity: quantity || 1
    };

    $.fancybox.showLoading(getLabel('ajax.adding-item'));
    $.post( ctx+'/order/addItem.ajax', { body: JSON.stringify(update) },
        function( data ) {
            $.fancybox.hideLoading();
            if( data.success ) {
                buildOrder(data.order);
            } else {
                alert('success:' + data.success);
            }
        }
    );
}

// Check if a special offer is applicable to an order
function checkCanAddSpecialOfferToOrder(restaurantId, specialOfferId, specialOfferItemsArray, cost ) {

    // If no location set, break
    if( !currentOrder.deliveryAddress.displaySummary ) {
        showLocationWarning();
        return;
    }

    var update = ({
        restaurantId: restaurantId,
        orderId: (currentOrder? currentOrder.orderId: null),
        specialOfferId: specialOfferId
    });

    $.fancybox.showLoading(getLabel('ajax.checking-availability'));
    $.post( ctx+'/order/checkSpecialOffer.ajax', { body: JSON.stringify(update) },
        function( data ) {
            $.fancybox.hideLoading();
            if( data.success ) {
                if( data.applicable ) {
                    addSpecialOfferToOrder(restaurantId, specialOfferId, specialOfferItemsArray, cost );
                } else {
                    showSpecialOfferWarning();
                }
            } else {
                alert(data);
            }
        }
    );
}

function showSpecialOfferWarning() {

    var warning;
    if( currentOrder ) {
        warning = (currentOrder.deliveryType == 'DELIVERY'? getLabel('order.special-offer-not-available-delivery'): getLabel('order.special-offer-not-available-collection'));
    } else {
        warning = getLabel('order.special-offer-not-available');
    }

    var header = ('<div class=\'dialog-header\'><h2>{0}</h2></div>').format(getLabel('order.special-offer-not-available-title'));
    var subheader = ('<div class=\'dialog-subheader\'><div class=\'dialog-warning-wrapper\'>{0}</div></div>').format(warning);
    var container = ('<div class=\'dialog-wrapper\'>{0}{1}<div class=\'dialog-footer\'></div>').format(header,subheader);

    $.fancybox.open({
        type: 'html',
        content: container,
        autoSize:false,
        width:400,
        autoHeight:true,
        modal:false,
        openEffect:'none',
        closeEffect:'none'
    });
}

// Add a special offer item to the order
function addSpecialOfferToOrder(restaurantId, specialOfferId, specialOfferItemsArray, cost ) {

    // Decode and build special offer items array
    var specialOfferItems = [];
    specialOfferItemsArray.forEach(function(specialOfferItemStr){

        var itemArray = specialOfferItemStr.split('%%%');
        var itemChoiceArrayStr = itemArray[2];
        var itemChoiceCostArrayStr = itemArray[3];
        var itemChoices = [];
        var itemChoiceCosts = [];

        itemChoiceArrayStr.split('$$$').forEach(function(itemChoiceStr){
            var itemChoice = new Object({
                text:itemChoiceStr
            });
            itemChoices.push(itemChoice);
        });

        itemChoiceCostArrayStr.split('$$$').forEach(function(itemChoiceCostStr){
            var itemChoiceCost = new Object({
                cost:Number(itemChoiceCostStr)
            });
            itemChoiceCosts.push(itemChoiceCost);
        });

        var specialOfferItem = new Object({
            title: (itemArray[0] == 'null'? null: unescapeQuotes(itemArray[0])),
            description: (itemArray[1] == 'null'? null: unescapeQuotes(itemArray[1])),
            itemChoices: itemChoices,
            itemChoiceCosts: itemChoiceCosts
        });
        specialOfferItems.push(specialOfferItem);
    });

    // Check restaurant with callback to add to order
    restaurantCheck(restaurantId, function(){
        doAddSpecialOfferToOrderCheck(restaurantId, specialOfferId, specialOfferItems, 1, cost);
    });

}

// Either build select dialog or proceed directly to add special offer to order
function doAddSpecialOfferToOrderCheck(restaurantId, specialOfferId, specialOfferItems, quantity, cost) {

    var currentQuantity = quantity;
    var additionalCost = 0;

    // If no choices for special offer just add straight away
    if(specialOfferItems.length == 0) {
        doAddSpecialOfferToOrder(restaurantId, specialOfferId, [], [], quantity);
        return;
    }

    // Build the container for showing the quantity and total cost
    var itemQuantityField = ('<div class=\'additional-item-quantity\'>{0}: <input id=\'quantity\' value=\'{1}\'/></div>').format(getLabel('order.quantity'),quantity);
    var itemTotalField = ('<div class=\'additional-item-total-cost\'><span id=\'itemcost\'></span> {0}</div>').format(ccy);
    var itemCostContainer = ('<div class=\'additional-item-cost-wrapper\'>{0}{1}</div>').format(itemQuantityField,itemTotalField);

    // Build dialog to display items and choices
    var specialOfferItemBody = '';
    var specialOfferItemIndex = 0;
    specialOfferItems.forEach(function(specialOfferItem){
        var specialOfferItemContent = ('<div class=\'specialofferitemtitle\'>{0}</div>').format(unescapeQuotes(specialOfferItem.title));
        if( specialOfferItem.description && specialOfferItem.description != '' ) {
            specialOfferItemContent += ('<div class=\'specialofferitemdescription\'>{0}</div>').format(unescapeQuotes(specialOfferItem.description));
        }
        var selectOptions = '';
        for( var i = 0; i < specialOfferItem.itemChoices.length; i++ ) {
            var itemChoice = specialOfferItem.itemChoices[i];
            var itemChoiceCost = specialOfferItem.itemChoiceCosts[i];
            if( i == 0 ) {
                additionalCost += itemChoiceCost.cost; // Add default selected value
            }
            var additionalText = itemChoiceCost.cost == 0? '': ' (+' + itemChoiceCost.cost.toFixed(2).replace('.',',') + ' ' + ccy + ')';
            selectOptions += ('<option cost=\'{0}\' value=\'{1}\'>{2}</option>').format(itemChoiceCost.cost, itemChoice.text, unescapeQuotes(itemChoice.text) + additionalText);
        };
        var selectBox = ('<div class=\'specialofferitemchoice\'><select id=\'specialOfferItemSelect_{0}\'>{1}</select></div>').format(specialOfferItemIndex, selectOptions);

        specialOfferItemContent += selectBox;
        specialOfferItemBody += ('<div class=\'specialofferitem\'>{0}</div>').format(specialOfferItemContent);
        specialOfferItemIndex++;
    });

    var header = ('<div class=\'dialog-header\'><h2>{0}</h2></div>').format(getLabel('order.special-offer-choices'));
    var content = ('<div class=\'dialog-content\'>{0}{1}</div>').format(specialOfferItemBody,itemCostContainer);

    // Build buttons for save and cancel
    var addItemButton = ('<a id=\'additembutton\' class=\'order-button unselectable\'>{0}</a>').format(getLabel('button.done'));
    var cancelButton = ('<a id=\'cancelbutton\' class=\'order-button unselectable\'>{0}</a>').format(getLabel('button.cancel'));
    var buttonContainer = ('<div class=\'dialog-buttons\'>{0} {1}</div>').format(addItemButton,cancelButton);
    var footer = ('<div class=\'dialog-footer\'>{0}</div>').format(buttonContainer);

    // Build main container for additional items
    var container = ('<div class=\'dialog-wrapper\'>{0}{1}{2}</div>').format(header,content,footer);

    $.fancybox.open({
        type: 'html',
        content: container,
        autoSize:false,
        autoHeight:true,
        width:450,
        minHeight:150,
        modal:false,
        openEffect:'none',
        closeEffect:'none'
    });

    // Update the total cost
    $('#itemcost').append(('<span id=\'itemtotalcost\'>{0}</span>').format(((cost + additionalCost) * currentQuantity).toFixed(2).replace('.',',')));

    // Only allow numeric input in quantity field
    $("#quantity").keydown(function(event) {
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 ||
            (event.keyCode == 65 && event.ctrlKey === true) ||
            (event.keyCode >= 35 && event.keyCode <= 39)) {
                 return;
        } else {
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault();
            }
        }
    });

    // Update total cost on item selection
    for( var i = 0; i < specialOfferItems.length; i++ ) {
        $('#specialOfferItemSelect_'+i).change(function() {
            var newAdditionalCost = 0;
            for( var j = 0; j < specialOfferItems.length; j++ ) {
                var itemCost = $('option:selected', '#specialOfferItemSelect_' + j).attr('cost');
                newAdditionalCost += Number(itemCost);
            }
            additionalCost = newAdditionalCost;
            currentQuantity = ($('#quantity').val() == ''? 0: $('#quantity').val());
            $('#itemtotalcost').remove();
            $('#itemcost').append(('<span id=\'itemtotalcost\'>{0}</span>').format(((cost + additionalCost) * currentQuantity).toFixed(2).replace('.',',')));
        });
    };

    // Update total cost on quantity update
    $("#quantity").keyup(function(event) {
        currentQuantity = ($('#quantity').val() == ''? 0: $('#quantity').val());
        $('#itemtotalcost').remove();
        $('#itemcost').append(('<span id=\'itemtotalcost\'>{0}</span>').format(((cost + additionalCost) * currentQuantity).toFixed(2).replace('.',',')));
    });

    // Handler for the cancel button
    $('#cancelbutton').click(function(){
        $.fancybox.close(true);
    });

    // Handler for the add item button
    $('#additembutton').click(function(){
        if( currentQuantity != '' && currentQuantity > 0 ) {
            var itemChoices = [];
            var itemChoiceCosts = [];
            for( i = 0; i < specialOfferItems.length; i++) {
                var selectedValue = $('#specialOfferItemSelect_' + i ).val();
                var itemCost = $('option:selected', '#specialOfferItemSelect_' + i).attr('cost');
                if( selectedValue == 'EMPTY' ) {
                    return;
                } else {
                    itemChoices.push(selectedValue);
                    itemChoiceCosts.push(itemCost);

                }
            }
            doAddSpecialOfferToOrder(restaurantId, specialOfferId, itemChoices, itemChoiceCosts, currentQuantity);
        }
        $.fancybox.close(true);
    });
}

// Add the special offer item to the order
function doAddSpecialOfferToOrder(restaurantId, specialOfferId, itemChoices, itemChoiceCosts, quantity ) {

    var update = {
        restaurantId: restaurantId,
        specialOfferId: specialOfferId,
        itemChoices: unescapeArray(itemChoices),
        itemChoiceCosts: unescapeArray(itemChoiceCosts),
        quantity: quantity || 1
    };

    $.fancybox.showLoading(getLabel('ajax.adding-item'));
    $.post( ctx+'/order/addSpecialOffer.ajax', { body: JSON.stringify(update) },
        function( data ) {
            $.fancybox.hideLoading();
            if( data.success ) {
                if( data.applicable ) {
                    buildOrder(data.order);
                } else {
                    showSpecialOfferWarning();
                }
            } else {
                alert('success:' + data.success);
            }
        }
    );
}

// Remove an item from the order
function updateQuantity(orderItemId, quantity ) {

    var update = {
        orderItemId: orderItemId,
        quantity: quantity
    };

    var label = (quantity > 0? getLabel('ajax.adding-item'): getLabel('ajax.removing-item'));
    $.fancybox.showLoading(label);
    $.post( ctx+'/order/updateItemQuantity.ajax', { body: JSON.stringify(update) },
        function( data ) {
            $.fancybox.hideLoading();
            if( data.success ) {
                buildOrder(data.order);
            } else {
                alert('success:' + data.success);
            }
        }
    );
}

// Remove voucher from order
function removeVoucher() {
    $.fancybox.showLoading();
    $.post( ctx+'/order/removeVoucher.ajax', {},
        function( data ) {
            $.fancybox.hideLoading();
            if( data.success ) {
                buildOrder(data.order);
            } else {
                alert('success:' + data.success);
            }
        }
    );
}


// Update a selected free item in a discount option
function updateFreeItem(discountId,freeItem) {
    var update = {
        discountId: discountId,
        freeItem: freeItem
    };

    $.fancybox.showLoading();
    $.post( ctx+'/order/updateFreeItem.ajax', { body: JSON.stringify(update) },
        function( data ) {
            $.fancybox.hideLoading();
            if( data.success ) {
                buildOrder(data.order);
            } else {
                alert('success:' + data.success);
            }
        }
    );
}

// Proceed to checkout
function checkout() {
    $.fancybox.showLoading();
    location.href = ctx + '/checkout.html';
}

// Unescapes string values
function unescape(str) {
    if(!str || str == '') {
        return str;
    }
    while(str.indexOf('_') != -1) {
        str = str.replace('_',' ');
    }
    return unescapeQuotes(str);
}

// Unescapes an array of string values
function unescapeArray(arr) {
    var ret = [];
    arr.forEach(function(entry){
        ret.push(unescape(entry));
    });
    return ret;
}