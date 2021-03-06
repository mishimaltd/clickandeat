// Global restaurant variables
var restaurant;
var address;
var mainContact;
var notificationOptions;
var deliveryOptions;
var menu;

// Global menu category edit form variable
var menuCategoryEditForm;

// Global menu item edit form variable
var menuItemEditForm;

// Global discount edit form variable
var discountEditForm;

// Global special offer edit form variable
var specialOfferEditForm;

// Global special offer item edit form variable
var specialOfferItemEditForm;

Ext.define('AD.controller.RestaurantEdit', {
    extend: 'Ext.app.Controller',
    stores:['Restaurants','MenuCategories','MenuItems','Discounts','SpecialOffers','SpecialOfferItems','RestaurantUpdates','RestaurantLinks'],
    models: [
        'Restaurant',
        'Person',
        'Address',
        'NotificationOptions',
        'DeliveryOptions',
        'Menu',
        'MenuItemTypeCost',
        'MenuItemSubType',
        'MenuItemAdditionalItemChoice',
        'Discount',
        'DiscountApplicableTime',
        'SpecialOffer',
        'SpecialOfferApplicableTime',
        'SpecialOfferItem',
        'RestaurantUpdates'
    ],
    views:[
    	'restaurant.Edit',
    	'restaurant.MainDetails',
    	'restaurant.DeliveryDetails',
    	'restaurant.Menu',
    	'restaurant.Discounts',
    	'restaurant.SpecialOffers',
    	'restaurant.RestaurantUpdates',
    	'restaurant.QuickLaunch'
    ],

    refs: [{
        ref:'menuCategoriesGrid',
        selector:'#menucategoriesgrid'
    },{
        ref:'menuItemsGrid',
        selector:'#menuitemsgrid'
    },{
        ref:'menuEditForm',
        selector:'#menueditform'
    },{
        ref:'restaurantTabPanel',
        selector:'#restauranttabpanel'
    },{
        ref:'mainDetailsForm',
        selector:'restaurantmaindetails'
    },{
        ref:'deliveryDetailsForm',
        selector:'restaurantdeliverydetails'
    },{
        ref:'discountsGrid',
        selector:'#discountsgrid'
    },{
        ref:'discountEditForm',
        selector:'#discounteditform'
    },{
        ref:'specialOffersGrid',
        selector:'#specialoffersgrid'
    },{
        ref:'specialOfferItemsGrid',
        selector:'#specialofferitemsgrid'
    },{
        ref:'specialOfferEditForm',
        selector:'#specialoffereditform'
    },{
        ref:'specialOfferItemEditForm',
        selector:'#specialofferitemeditform'
    },{
        ref:'restaurantUpdatesGrid',
        selector:'#restaurantupdatesgrid'
    },{
         ref:'restaurantQuickLaunch',
         selector:'#restaurantquicklaunch'
    }],

	init: function() {

        // Set up event handlers
        this.control({

		    'restaurantquicklaunch': {
                itemdblclick:this.onGridDblClick,
                expand:this.onGridExpanded

            },

            'restaurantedit button[action=close]': {
                click:this.close
            },

            'restaurantedit button[action=saverestaurant]': {
                click:function() {
                    this.saveRestaurant(null,null);
                }
            },

            'restaurantedit button[action=upload]': {
                click: this.uploadImage
            },

            'restaurantedit button[action=clear]': {
                click: this.clearImage
            },

            'restaurantedit button[action=sendForOwnerApproval]': {
                click: this.sendForOwnerApproval
            },

            'restaurantedit button[action=openToTestPhoneCall]': {
                click: this.openToTestPhoneCall
            },

            'restaurantedit button[action=showLocation]': {
                click: this.showLocation
            },

            'restaurantedit button[action=downloadMenu]': {
                click: this.downloadMenu
            },

            'restaurantedit button[action=openExternal]': {
                click: this.openExternal
            },

            'restaurantmaindetails': {
                render:this.mainDetailsRendered
            },

            'restaurantdeliverydetails': {
                render:this.deliveryDetailsRendered
            },

            'restaurantmenu': {
                render:this.menuRendered
            },

            'restaurantdiscounts': {
                render:this.discountsRendered
            },

            '#menucategoriesgrid': {
                itemclick:this.menuCategoriesGridSelected
            },

            '#menucategoriesgrid button[action=create]': {
                click:this.createMenuCategory
            },

            'restaurantmenucategoryedit button[action=save]': {
                click:this.updateMenuCategory
            },

            'restaurantmenucategoryedit button[action=revert]': {
                click:this.revertMenuCategory
            },

            'restaurantmenucategoryedit button[action=remove]': {
                click:this.removeMenuCategory
            },

            'restaurantmenucategoryedit': {
                render:this.menuCategoryEditRendered
            },

            '#menuitemsgrid': {
                itemclick:this.menuItemsGridSelected
            },

            '#menuitemsgrid button[action=create]': {
                click:this.createMenuItem
            },
            '#menuitemsgrid button[action=copyRestaurantMenu]': {
                click:this.copyRestaurantMenu
            },
            'restaurantmenuitemedit button[action=save]': {
                click:this.updateMenuItem
            },

            'restaurantmenuitemedit button[action=revert]': {
                click:this.revertMenuItem
            },

            'restaurantmenuitemedit button[action=remove]': {
                click:this.removeMenuItem
            },

            'restaurantmenuitemedit': {
                render:this.menuItemEditRendered
            },

            'restaurantmenuitemedit radiofield[name=type]': {
                change:this.menuItemTypeChanged
            },

            '#discountsgrid': {
                itemclick:this.discountsGridSelected
            },

            '#discountsgrid button[action=create]': {
                click:this.createDiscount
            },

            'restaurantdiscountedit': {
                render:this.discountEditRendered
            },

            'restaurantdiscountedit button[action=save]': {
                click:this.updateDiscount
            },

            'restaurantdiscountedit button[action=revert]': {
                click:this.revertDiscount
            },

            'restaurantdiscountedit button[action=remove]': {
                click:this.removeDiscount
            },

            'restaurantspecialoffers': {
                render:this.specialOffersRendered
            },

            '#specialoffersgrid': {
                itemclick:this.specialOffersGridSelected
            },

            '#specialoffersgrid button[action=create]': {
                click:this.createSpecialOffer
            },

            'restaurantspecialofferedit button[action=save]': {
                click:this.updateSpecialOffer
            },

            'restaurantspecialofferedit button[action=revert]': {
                click:this.revertSpecialOffer
            },

            'restaurantspecialofferedit button[action=remove]': {
                click:this.removeSpecialOffer
            },

            'restaurantspecialofferedit': {
                render:this.specialOfferEditRendered
            },

            '#specialofferitemsgrid': {
                itemclick:this.specialOfferItemsGridSelected
            },

            '#specialofferitemsgrid button[action=create]': {
                click:this.createSpecialOfferItem
            },

            'restaurantspecialofferitemedit button[action=save]': {
                click:this.updateSpecialOfferItem
            },

            'restaurantspecialofferitemedit button[action=revert]': {
                click:this.revertSpecialOfferItem
            },

            'restaurantspecialofferitemedit button[action=remove]': {
                click:this.removeSpecialOfferItem
            },

            'restaurantspecialofferitemedit': {
                render:this.specialOfferItemEditRendered
            },
            'restaurantupdates': {
                render:this.restaurantUpdatesRendered
            }

        });

        // Initialize restaurant if one is set
        this.initializeRestaurant(restaurantObj);

    },

	onGridDblClick: function(view,record,item,index,eventObj,options) {
        var restaurantId = record.get('restaurantId');
        location.href = ctx + '/admin/restaurants/edit.html?restaurantId=' + restaurantId;
	},

	onGridExpanded: function(panel) {
	    panel.doLayout();
        panel.mun(panel.scrollEl, 'scroll', panel.onElScroll, panel);
        panel.mon(panel.scrollEl, 'scroll', panel.onElScroll, panel);
	},

	close: function(button) {
	    location.href = ctx + '/admin/restaurants.html';
	},

    // Initialises the restaurant object
    initializeRestaurant: function(restaurantObj) {

        // Initialize models from restaurant JSON
	    restaurant = new AD.model.Restaurant(restaurantObj);
	    address = new AD.model.Address(restaurantObj.address);
	    mainContact = new AD.model.Person(restaurantObj.mainContact);
	    notificationOptions = new AD.model.NotificationOptions(restaurantObj.notificationOptions);
	    deliveryOptions = new AD.model.DeliveryOptions(restaurantObj.deliveryOptions);

	    // Initialize the menu object using fully qualified model records
	    var menuCategories = [];
	    restaurantObj.menu.menuCategories.forEach(function(category) {
	        var menuCategory = new AD.model.MenuCategory(category);
	        var menuItems = [];
	        category.menuItems.forEach(function(item) {
	            var menuItem = new AD.model.MenuItem(item);
	            var menuItemTypeCosts = [];
	            item.menuItemTypeCosts.forEach(function(itemType){
	                var menuItemTypeCost = new AD.model.MenuItemTypeCost(itemType);
	                menuItemTypeCosts.push(menuItemTypeCost);
	            });
	            menuItem.set('menuItemTypeCosts',menuItemTypeCosts);
	            var menuItemSubTypes = [];
	            item.menuItemSubTypes.forEach(function(subType){
	                var menuItemSubType = new AD.model.MenuItemSubType(subType);
	                menuItemSubTypes.push(menuItemSubType);
	            });
	            menuItem.set('menuItemSubTypes',menuItemSubTypes);
	            var additionalItemChoices = [];
	            item.additionalItemChoices.forEach(function(additionalItemChoice){
	                var menuItemAdditionalItemChoice = new AD.model.MenuItemAdditionalItemChoice(additionalItemChoice);
	                additionalItemChoices.push(menuItemAdditionalItemChoice);
	            });
	            menuItem.set('additionalItemChoices',additionalItemChoices);
	            menuItems.push(menuItem);
	        });
	        menuCategory.set('menuItems',menuItems);
	        menuCategories.push(menuCategory);
	    });

	    menu = new AD.model.Menu(restaurantObj.menu);
	    menu.set('menuCategories',menuCategories);

        // If a menu category or item is being edited clear it now
        if( menuCategoryEditForm || menuItemEditForm ) {
            this.getMenuCategoriesGrid().getSelectionModel().deselectAll();
            this.getMenuItemsGrid().getSelectionModel().deselectAll();
            this.getMenuItemsStore().removeAll();
            this.getMenuEditForm().removeAll();
            menuCategoryEditForm = null;
            menuItemEditForm = null;
        }

        // Reload the menu categories store
	    this.getMenuCategoriesStore().removeAll(true);
        this.getMenuCategoriesStore().loadData(menu.get('menuCategories'));

        // Initialize the discounts for the restaurant
        var discounts = [];
        restaurantObj.discounts.forEach(function(discountObj){
            var discount = new AD.model.Discount(discountObj);
            var discountApplicableTimes = [];
            discountObj.discountApplicableTimes.forEach(function(discountApplicableTimeObj){
                var discountApplicableTime = new AD.model.DiscountApplicableTime({
                    dayOfWeek: discountApplicableTimeObj.dayOfWeek,
                    applicable: discountApplicableTimeObj.applicable,
                    applicableFrom: discountApplicableTimeObj.applicableFrom,
                    applicableTo: discountApplicableTimeObj.applicableTo
                });
                discountApplicableTimes.push(discountApplicableTime);
            });

            discount.set('discountApplicableTimes',discountApplicableTimes);
            discounts.push(discount);

        });

        // If a discount is being edited clear it now
        if( discountEditForm ) {
            this.getDiscountsGrid().getSelectionModel().deselectAll(true);
            this.getDiscountEditForm().removeAll(true);
            discountEditForm = null;
        }

        this.getDiscountsStore().removeAll(true);
        this.getDiscountsStore().loadData(discounts);

	    // Initialize special offers for the restaurant
	    var specialOffers = [];
	    restaurantObj.specialOffers.forEach(function(offer) {
	        var specialOffer = new AD.model.SpecialOffer(offer);
            var specialOfferApplicableTimes = [];
            offer.offerApplicableTimes.forEach(function(offerApplicableTimeObj){
                var offerApplicableTime = new AD.model.SpecialOfferApplicableTime({
                    dayOfWeek: offerApplicableTimeObj.dayOfWeek,
                    applicable: offerApplicableTimeObj.applicable,
                    applicableFrom: offerApplicableTimeObj.applicableFrom,
                    applicableTo: offerApplicableTimeObj.applicableTo
                });
                specialOfferApplicableTimes.push(offerApplicableTime);
            });
            specialOffer.set('offerApplicableTimes',specialOfferApplicableTimes);

	        var specialOfferItems = [];
	        offer.specialOfferItems.forEach(function(item) {
	            var specialOfferItem = new AD.model.SpecialOfferItem(item);
	            specialOfferItems.push(specialOfferItem);
	        });
	        specialOffer.set('specialOfferItems',specialOfferItems);
	        specialOffers.push(specialOffer);
	    });

        // If a special offer or special offer item is being edited clear it now
        if( specialOfferEditForm || specialOfferItemEditForm ) {
            this.getSpecialOffersGrid().getSelectionModel().deselectAll();
            this.getSpecialOfferItemsGrid().getSelectionModel().deselectAll();
            this.getSpecialOfferItemsStore().removeAll();
            this.getSpecialOfferEditForm().removeAll();
            specialOfferEditForm = null;
            specialOfferItemEditForm = null;
        }

        // Reload the special offers store
	    this.getSpecialOffersStore().removeAll(true);
        this.getSpecialOffersStore().loadData(specialOffers);

    },

    openToTestPhoneCall: function(button) {
        // Check if the document has been saved. Otherwise we don't open it
        if(restaurantObj.created==null){
             alert("The document must be saved before you can open it for testing");
        }else{
            // Open the document in the approveContent jsp
            window.open( ctx + '/approval/restaurant/approveContent.html?restaurantId='+restaurantObj.restaurantId , "_blank");
        }

    },
    copyRestaurantMenu: function() {
        //First check that they have selected a source restaurant from where the menu will be copied
        var restaurantsGrid = Ext.getCmp('restaurantquicklaunch');
        var restaurantSourceRecord;
        if(restaurantsGrid.getSelectionModel().hasSelection()) {
            restaurantSourceRecord = restaurantsGrid.getSelectionModel().getLastSelected();
        }else {
            //in case this fires with no selection
            Ext.Msg.show({
                 title:'No restaurant selected',
                 msg: 'You must select the restaurant whose menu you want to copy!',
                 buttons: Ext.Msg.OK,
                 icon: Ext.Msg.WARNING
            });
            //alert("You must select the restaurant whose menu you want to copy!");
            return;
       	};

        //Warn the user that any changes he\she has made will not be saved
        Ext.Msg.confirm('Copy restaurant menu', 'All the changes that you\'ve made that haven\'t been saved will be lost, do you want to go ahead?', function(button) {
            if (button === 'yes') {
                //alert("Source restaurant:"+restaurantSourceRecord.get('restaurantId'));
                //alert("Target restaurant:"+restaurantObj.restaurantId);
                Ext.Ajax.request({
                    url: ctx + '/admin/restaurants/copyMenu.ajax',
                    method:'POST',
                    params: {
                        sourceRestaurantId: restaurantSourceRecord.get('restaurantId'),
                        targetRestaurantId: restaurantObj.restaurantId

                    },

                    success: function(response) {
                        var obj = Ext.decode(response.responseText);
                        if( obj.success ) {
                            showSuccessMessage(Ext.get('menuitemsgrid'),'Updated','Menu from restaurant '+restaurantSourceRecord.get('name')+'copied successfully. Please wait for the window to reload');
                            window.location.reload();
                            /* Haven't manage to get the code below working
                            var storeMenuCategories = Ext.getCmp('menucategoriesgrid').getStore();
                            var storeMenuItems = Ext.getCmp('menuitemsgrid').getStore();
                            // Reload the menu categories and menu items stores
                            storeMenuCategories.loadPage(storeMenuCategories.currentPage);
                            storeMenuItems.load();
                            */
                        } else {
                            showErrorMessage(Ext.get('menuitemsgrid'),'Error',obj.message);
                        }
                    },

                    failure: function(response) {
                        var obj = Ext.decode(response.responseText);
                        showErrorMessage(Ext.get('menuitemsgrid'),'Error',obj.message);
                    },
                    scope:this
                });



            } else {
                // We stop the processing
                console.log("Menu copy aborted");
                return;
            }
        });
    },

    sendForOwnerApproval: function(button) {
        // Change the list on Site field so that the restaurant is not displayed
        // on the site until the content is approved by the Restaurant owner
        this.getMainDetailsForm().getForm().findField('listOnSite').setValue(false);
        // Set the restaurant to test mode so that the phone calls can be tested
        this.getMainDetailsForm().getForm().findField('testMode').setValue(true);

        // Now save
        this.saveRestaurant(button , this.sendForOwnerApprovalCallBack)
    },

    uploadImage:function() {
        var form = this.getMainDetailsForm().getForm();
        var file = form.findField('file').getValue();
        if( !file || file == '' ) {
            this.getRestaurantTabPanel().setActiveTab(0);
            form.findField('file').markInvalid();
            this.showInvalidFormWarning();
            return;
        }
        this.getMainDetailsForm().getForm().submit({
            url: ctx + '/admin/upload.ajax',
            params:{
                restaurantId: restaurantObj.restaurantId
            },
            success: function(form,action) {
                showSuccessMessage(Ext.get('restauranteditpanel'),'Uploaded','Restaurant image has been uploaded');
                restaurantObj.hasUploadedImage = true;
            },
            failure: function(form,action) {
                showErrorMessage(Ext.get('restauranteditpanel'),'Error','Error occurred uploading restaurant image');
            }
        });
    },

    clearImage:function() {
        Ext.Ajax.request({
            url: ctx + '/admin/restaurants/clearImage.ajax',
            method:'POST',
            params: {
                restaurantId: restaurantObj.restaurantId
            },
            success: function(response) {
                var obj = Ext.decode(response.responseText);
                if( obj.success ) {
                    showSuccessMessage(Ext.get('restauranteditpanel'),'Cleared','Cleared restaurant image successfully');
                } else {
                    showErrorMessage(Ext.get('restauranteditpanel'),'Error',obj.message);
                }
            }
        })
    },

    sendForOwnerApprovalCallBack: function() {
        Ext.Ajax.request({
            url: ctx + '/admin/restaurants/sendForApproval.ajax',
            method:'POST',
            params: {
                body: JSON.stringify(restaurantObj)
            },
            success: function(response) {
                var obj = Ext.decode(response.responseText);
                if( obj.success ) {
                    //restaurantObj.id = obj.id;
                    //this.initializeRestaurant(obj.restaurant);
                    showSuccessMessage(Ext.get('restauranteditpanel'),'Sent','Menu sent for owner Approval successfully');
                } else {
                    showErrorMessage(Ext.get('restauranteditpanel'),'Error',obj.message);
                }
            },
            failure: function(response) {
                var obj = Ext.decode(response.responseText);
                showErrorMessage(Ext.get('restauranteditpanel'),'Error',obj.message);
            },
            scope:this
        });
    },

    showLocation: function(button) {
        var mainDetailsForm = this.getMainDetailsForm().getForm();
        var address1 = mainDetailsForm.findField('address1').getValue();
        var town = mainDetailsForm.findField('town').getValue();
        var postCode = mainDetailsForm.findField('postCode').getValue();
        if(address1 == '' || town == '' || postCode == '' ) {
            showErrorMessage(Ext.get('restauranteditpanel'),'Error','Please enter values in address1, town and postCode fields');
        } else {
            Ext.Ajax.request({
                url: ctx + '/admin/restaurants/showLocation.ajax',
                method:'POST',
                params: {
                    address: address1 + ' ' + town + ' ' + postCode
                },
                success: function(response) {
                    var obj = Ext.decode(response.responseText);
                    if( obj.success ) {
                        showDirections(obj.lng,obj.lat,null,null,'restaurant');
                    } else {
                        showErrorMessage(Ext.get('restauranteditpanel'),'Error',obj.message);
                    }
                },
                scope:this
            });
        }
    },

    downloadMenu:function(button) {
        window.location = ctx + "/admin/menu/downloadMenu.html?id=" + restaurantObj.restaurantId;
    },

    openExternal:function(button) {
        var externalId = restaurantObj.externalId;
        if(externalId != null && externalId != '') {
            window.open(externalId);
        }
    },

    saveRestaurant: function(button , callback) {

        // Check if the main details form is invalid`
        if(!this.getMainDetailsForm().getForm().isValid()) {
            this.getRestaurantTabPanel().setActiveTab(0);
            this.showInvalidFormWarning();
            return;
        }

        // Check if the delivery details form is invalid`
        if(!this.getDeliveryDetailsForm().getForm().isValid()) {
            this.getRestaurantTabPanel().setActiveTab(1);
            this.showInvalidFormWarning();
            return;
        }

        // Get the input values from the main details form
        var mainDetailValues = this.getMainDetailsForm().getForm().getValues();

        // Update the restaurant object details from the main details form
        restaurantObj.name = mainDetailValues['name'];
        restaurantObj.description = mainDetailValues['description'];
        restaurantObj.imageName = mainDetailValues['imageName'];
        restaurantObj.listOnSite = mainDetailValues['listOnSite'] == 'on';
        restaurantObj.phoneOrdersOnly = mainDetailValues['phoneOrdersOnly'] == 'on';
        restaurantObj.recommended = mainDetailValues['recommended'] == 'on';
        restaurantObj.testMode = mainDetailValues['testMode'] == 'on';
        restaurantObj.searchRanking = mainDetailValues['searchRanking'];
        restaurantObj.commissionPercent = mainDetailValues['commissionPercent'];
        restaurantObj.contactEmail = mainDetailValues['contactEmail'];
        restaurantObj.contactTelephone = mainDetailValues['contactTelephone'];
        restaurantObj.contactMobile = mainDetailValues['contactMobile'];
        restaurantObj.website = mainDetailValues['website'];

        // Build cuisines array onto restaurant object
        var cuisines = [];
        this.getMainDetailsForm().down('checkboxgroup').items.each(function(checkBoxItem) {
            if(checkBoxItem.getValue()) {
                cuisines.push(checkBoxItem.inputValue);
            }
        });
        restaurantObj.cuisines = cuisines;

        // Update address details for the restaurant
        restaurantObj.address = new Object({
            address1: mainDetailValues['address1'],
            address2: mainDetailValues['address2'],
            address3: mainDetailValues['address3'],
            town: mainDetailValues['town'],
            region: mainDetailValues['region'],
            postCode: mainDetailValues['postCode']
        });

        // Update main contact details for the restaurant
        restaurantObj.mainContact = new Object({
            firstName: mainDetailValues['firstName'],
            lastName: mainDetailValues['lastName'],
            telephone: mainDetailValues['telephone'],
            mobile: mainDetailValues['mobile'],
            email: mainDetailValues['email']
        });

        // Update notification options for the restuarant
        restaurantObj.notificationOptions = new Object({
            receiveNotificationCall: mainDetailValues['receiveNotificationCall'] == 'on',
            receiveSMSNotification: mainDetailValues['receiveSMSNotification'] == 'on',
            notificationPhoneNumber: mainDetailValues['notificationPhoneNumber'],
            notificationSMSNumber: mainDetailValues['notificationSMSNumber'],
            notificationEmailAddress: mainDetailValues['notificationEmailAddress'],
            printerEmailAddress: mainDetailValues['printerEmailAddress']
        });

        // Get the input values from the delivery details form
        var deliveryDetailValues = this.getDeliveryDetailsForm().getForm().getValues();

        // Update opening times for the restaurant
        restaurantObj.openingTimes = new Object();
        restaurantObj.openingTimes.openingTimesSummary = deliveryDetailValues['openingTimesSummary'];

        // Build daily opening times summary
        var openingTimes = [];
        for( i = 1; i < 8; i++ ) {
            var openingTime = new Object({
                dayOfWeek: i,
                open: deliveryDetailValues['open_' + i] == 'on',
                earlyOpeningTime: deliveryDetailValues['earlyOpeningTime_' + i],
                earlyClosingTime: deliveryDetailValues['earlyClosingTime_' + i],
                lateOpeningTime: deliveryDetailValues['lateOpeningTime_' + i],
                lateClosingTime: deliveryDetailValues['lateClosingTime_' + i]
            });
            openingTimes.push(openingTime);
        }
        restaurantObj.openingTimes.openingTimes = openingTimes;
        restaurantObj.openingTimes.closedDates = delimitedStringToArray(deliveryDetailValues['closedDates'],'\n');

        var bankHolidayOpeningTimes = new Object({
            open: deliveryDetailValues['open_bankHoliday'] == 'on',
            earlyOpeningTime: deliveryDetailValues['earlyOpeningTime_bankHoliday'],
            earlyClosingTime: deliveryDetailValues['earlyClosingTime_bankHoliday'],
            lateOpeningTime: deliveryDetailValues['lateOpeningTime_bankHoliday'],
            lateClosingTime: deliveryDetailValues['lateClosingTime_bankHoliday']
        });
        restaurantObj.openingTimes.bankHolidayOpeningTimes = bankHolidayOpeningTimes;

        // Validate the delivery charges by order amount if set
        var variableChargeOrderValues = deliveryDetailValues['variableChargeOrderValues'];
        var variableChargeAmounts = deliveryDetailValues['variableChargeAmounts'];
        var variableChargeOrderValueArray = delimitedStringToArray(variableChargeOrderValues,'\n');
        var variableChargeAmountArray = delimitedStringToArray(variableChargeAmounts,'\n');
        if( variableChargeOrderValueArray.length != variableChargeAmountArray.length ) {
            this.getRestaurantTabPanel().setActiveTab(1);
            Ext.MessageBox.show({
                title:'Input Values Not Valid',
                msg:'Please ensure that minimum order values and delivery charges have the same number of lines',
                buttons:Ext.MessageBox.OK,
                icon:Ext.MessageBox.WARNING,
                closable:false
            });
            return;
        }

        // Validate the delivery charges and areas if set
        var deliveryChargeAreas = deliveryDetailValues['deliveryChargeAreas'];
        var deliveryChargeAmounts = deliveryDetailValues['deliveryChargeAmounts'];
        var deliveryChargeAreaArray = delimitedStringToArray(deliveryChargeAreas,'\n');
        var deliveryChargeAmountArray = delimitedStringToArray(deliveryChargeAmounts,'\n');
        if( deliveryChargeAreaArray.length != deliveryChargeAmountArray.length ) {
            this.getRestaurantTabPanel().setActiveTab(1);
            Ext.MessageBox.show({
                title:'Input Values Not Valid',
                msg:'Please ensure that delivery charge areas and amounts have the same number of lines',
                buttons:Ext.MessageBox.OK,
                icon:Ext.MessageBox.WARNING,
                closable:false
            });
            return;
        }

        // If both delivery charge areas and order amounts are set, raise error
        if( variableChargeOrderValueArray.length > 0 && deliveryChargeAreaArray.length > 0 ) {
            this.getRestaurantTabPanel().setActiveTab(1);
            Ext.MessageBox.show({
                title:'Input Values Not Valid',
                msg:'You can only specify delivery charges by minimum order value or by location, not both',
                buttons:Ext.MessageBox.OK,
                icon:Ext.MessageBox.WARNING,
                closable:false
            });
            return;
        }

        // Validate the minimum order values and areas if set
        var minimumDeliveryAreas = deliveryDetailValues['minimumDeliveryAreas'];
        var minimumDeliveryAmounts = deliveryDetailValues['minimumDeliveryAmounts'];
        var minimumDeliveryAreaArray = delimitedStringToArray(minimumDeliveryAreas,'\n');
        var minimumDeliveryAmountArray = delimitedStringToArray(minimumDeliveryAmounts,'\n');
        if( minimumDeliveryAreaArray.length != minimumDeliveryAmountArray.length ) {
            this.getRestaurantTabPanel().setActiveTab(1);
            Ext.MessageBox.show({
                title:'Input Values Not Valid',
                msg:'Please ensure that minimum delivery value areas and charges have the same number of lines',
                buttons:Ext.MessageBox.OK,
                icon:Ext.MessageBox.WARNING,
                closable:false
            });
            return;
        }

        // Build an array of variable delivery charge objects to send back to the server
        var variableDeliveryCharges = [];
        for( var i = 0; i < variableChargeOrderValueArray.length; i++ ) {
            var minimumOrderValue = variableChargeOrderValueArray[i];
            var deliveryCharge = variableChargeAmountArray[i];
            var variableDeliveryCharge = new Object({
                minimumOrderValue: minimumOrderValue,
                deliveryCharge: deliveryCharge
            });
            variableDeliveryCharges.push(variableDeliveryCharge);
        }

        // Build an array of delivery charge objects to send back to the server
        var areaDeliveryCharges = [];
        for( var i = 0; i < deliveryChargeAreaArray.length; i++ ) {
            var areas = deliveryChargeAreaArray[i];
            var charge = deliveryChargeAmountArray[i];
            var areaDeliveryCharge = new Object({
                deliveryCharge: charge,
                areas: delimitedStringToArray(areas,',')
            });
            areaDeliveryCharges.push(areaDeliveryCharge);
        }

        // Build an array of delivery charge objects to send back to the server
        var areaDeliveryCharges = [];
        for( var i = 0; i < deliveryChargeAreaArray.length; i++ ) {
            var areas = deliveryChargeAreaArray[i];
            var charge = deliveryChargeAmountArray[i];
            var areaDeliveryCharge = new Object({
                deliveryCharge: charge,
                areas: delimitedStringToArray(areas,',')
            });
            areaDeliveryCharges.push(areaDeliveryCharge);
        }

        // Build an array of delivery charge objects to send back to the server
        var areaMinimumOrderCharges = [];
        for( var i = 0; i < minimumDeliveryAreaArray.length; i++ ) {
            var areas = minimumDeliveryAreaArray[i];
            var charge = minimumDeliveryAmountArray[i];
            var areaMinimumDeliveryCharge = new Object({
                deliveryCharge: charge,
                areas: delimitedStringToArray(areas,',')
            });
            areaMinimumOrderCharges.push(areaMinimumDeliveryCharge);
        }

        // Build delivery options details
        restaurantObj.deliveryOptions = new Object({
            deliveryOptionsSummary: deliveryDetailValues['deliveryOptionsSummary'],
            deliveryTimeMinutes: deliveryDetailValues['deliveryTimeMinutes'],
            collectionTimeMinutes: deliveryDetailValues['collectionTimeMinutes'],
            minimumOrderForDelivery: deliveryDetailValues['minimumOrderForDelivery'],
            deliveryCharge: deliveryDetailValues['deliveryCharge'],
            allowFreeDelivery: deliveryDetailValues['allowFreeDelivery'] == 'on',
            minimumOrderForFreeDelivery: deliveryDetailValues['minimumOrderForFreeDelivery'],
            allowDeliveryBelowMinimumForFreeDelivery: deliveryDetailValues['allowDeliveryBelowMinimumForFreeDelivery'] == 'on',
            deliveryRadiusInKilometres: deliveryDetailValues['deliveryRadiusInKilometres'],
            areasDeliveredTo: delimitedStringToArray(deliveryDetailValues['areasDeliveredTo'],'\n'),
            variableDeliveryCharges: variableDeliveryCharges,
            areaDeliveryCharges: areaDeliveryCharges,
            areaMinimumOrderCharges: areaMinimumOrderCharges
        });

        // Build restaurant menu
        restaurantObj.menu = new Object();
        var menuCategories = [];
        this.getMenuCategoriesStore().getRange().forEach(function(category){
            var menuCategory = new Object({
                name: category.get('name'),
                categoryId: category.get('categoryId'),
                type: category.get('type'),
                summary: category.get('summary'),
                iconClass: category.get('iconClass'),
                itemTypes: delimitedStringToArray(category.get('itemTypes'),'\n')
            });

            var menuItems = [];
            category.get('menuItems').forEach(function(item){
                var menuItem = new Object({
                    type: item.get('type'),
                    number: item.get('number'),
                    itemId: item.get('itemId'),
                    title: item.get('title'),
                    subtitle: item.get('subtitle'),
                    description: item.get('description'),
                    iconClass: item.get('iconClass'),
                    cost: item.get('cost'),
                    additionalItemCost: item.get('additionalItemCost'),
                    additionalItemChoiceLimit: item.get('additionalItemChoiceLimit'),
                    forceAdditionalItemChoiceLimit: item.get('forceAdditionalItemChoiceLimit')
                });

                var menuItemTypeCosts = [];
                item.get('menuItemTypeCosts').forEach(function(itemTypeCost){
                    var menuItemTypeCost = new Object({
                        type: itemTypeCost.get('type'),
                        cost: itemTypeCost.get('cost'),
                        additionalItemCost: itemTypeCost.get('additionalItemCost')
                    });
                    menuItemTypeCosts.push(menuItemTypeCost);
                });
                menuItem.menuItemTypeCosts = menuItemTypeCosts;

                var menuItemSubTypes = [];
                item.get('menuItemSubTypes').forEach(function(itemSubType){
                    var menuItemSubType = new Object({
                        type: itemSubType.get('type'),
                        cost: itemSubType.get('cost')
                    });
                    menuItemSubTypes.push(menuItemSubType);
                });
                menuItem.menuItemSubTypes = menuItemSubTypes;

                var additionalItemChoices = [];
                item.get('additionalItemChoices').forEach(function(additionalItemChoice){
                    var additionalChoice = new Object({
                        name: additionalItemChoice.get('name'),
                        cost: additionalItemChoice.get('cost')
                    });
                    additionalItemChoices.push(additionalChoice);
                });
                menuItem.additionalItemChoices = additionalItemChoices;
                menuItems.push(menuItem);
            });

            menuCategory.menuItems = menuItems;
            menuCategories.push(menuCategory);
        });
        restaurantObj.menu.menuCategories = menuCategories;

        // Build the discounts
        var restaurantDiscounts = [];
        this.getDiscountsStore().getRange().forEach(function(discount){
            var discountObj = new Object({
                discountId: discount.get('discountId'),
                title: discount.get('title'),
                description: discount.get('description'),
                discountType: discount.get('discountType'),
                collection: discount.get('collection'),
                delivery: discount.get('delivery'),
                canCombineWithOtherDiscounts: discount.get('canCombineWithOtherDiscounts'),
                minimumOrderValue: discount.get('minimumOrderValue'),
                discountAmount: discount.get('discountAmount'),
                freeItems: delimitedStringToArray(discount.get('freeItems'),'\n')
            });

            var discountApplicableTimes = [];
            discount.get('discountApplicableTimes').forEach(function(discountApplicableTime){
                var discountApplicableTimeObj = new Object({
                    dayOfWeek: discountApplicableTime.get('dayOfWeek'),
                    applicable: discountApplicableTime.get('applicable'),
                    applicableFrom: discountApplicableTime.get('applicableFrom'),
                    applicableTo: discountApplicableTime.get('applicableTo')
                });
                discountApplicableTimes.push(discountApplicableTimeObj);
            });

            discountObj.discountApplicableTimes = discountApplicableTimes;
            restaurantDiscounts.push(discountObj);
        });
        restaurantObj.discounts = restaurantDiscounts;

        // Build the special offers
        var restaurantSpecialOffers = [];
        this.getSpecialOffersStore().getRange().forEach(function(offer){
            var specialOffer = new Object({
                specialOfferId: offer.get('specialOfferId'),
                number: offer.get('number'),
                title: offer.get('title'),
                description: offer.get('description'),
                cost: offer.get('cost')
            });

            var offerApplicableTimes = [];
            offer.get('offerApplicableTimes').forEach(function(offerApplicableTime){
                var offerApplicableTimeObj = new Object({
                    dayOfWeek: offerApplicableTime.get('dayOfWeek'),
                    applicable: offerApplicableTime.get('applicable'),
                    applicableFrom: offerApplicableTime.get('applicableFrom'),
                    applicableTo: offerApplicableTime.get('applicableTo')
                });
                offerApplicableTimes.push(offerApplicableTimeObj);
            });
            specialOffer.offerApplicableTimes = offerApplicableTimes;

            // Build the special offer items
            var specialOfferItems = [];
            offer.get('specialOfferItems').forEach(function(item){
                var specialOfferItem = new Object({
                    title: item.get('title'),
                    description: item.get('description'),
                    specialOfferItemChoices: delimitedStringToArray(item.get('specialOfferItemChoices'),'\n'),
                    specialOfferItemChoiceCosts: delimitedStringToArray(item.get('specialOfferItemChoiceCosts'),'\n')
                });
                specialOfferItems.push(specialOfferItem);
            });
            specialOffer.specialOfferItems = specialOfferItems;
            restaurantSpecialOffers.push(specialOffer);
        });
        restaurantObj.specialOffers = restaurantSpecialOffers;

        // Submit the restaurant to the server
        Ext.Ajax.request({
            url: ctx + '/admin/restaurants/save.ajax',
            method:'POST',
            params: {
                body: JSON.stringify(restaurantObj)
            },
            success: function(response) {
                var obj = Ext.decode(response.responseText);
                if( obj.success ) {
                    restaurantObj.id = obj.id;
                    this.initializeRestaurant(obj.restaurant);
                    showSuccessMessage(Ext.get('restauranteditpanel'),'Saved','Restaurant details updated successfully');
                    //If a callback function has been provided we execute it
                    if(!(typeof callback === 'undefined') && callback != null ){
                        callback.call();
                    }
                } else {
                    showErrorMessage(Ext.get('restauranteditpanel'),'Error',obj.message);
                }
            },
            failure: function(response) {
                var obj = Ext.decode(response.responseText);
                showErrorMessage(Ext.get('restauranteditpanel'),'Error',obj.message);
            },
            scope:this
        });

    },

    // Populate main details form
    mainDetailsRendered: function(formPanel) {

        var checkboxgroup = formPanel.down('checkboxgroup');
        cuisines.forEach(function(cuisine){
            var checkbox = Ext.create('Ext.form.field.Checkbox',{
                name:'cuisines',
                boxLabel:cuisine,
                inputValue:cuisine,
                checked:restaurant.get('cuisines').indexOf(cuisine) != -1
            });
            checkboxgroup.items.add(checkbox);
        });

        // Populate form values
        formPanel.loadRecord(restaurant);
        formPanel.loadRecord(address);
        formPanel.loadRecord(mainContact);
        formPanel.loadRecord(notificationOptions);
    },

    // Populate delivery details form
    deliveryDetailsRendered: function(formPanel) {

        // Get the opening times from the restaurant
        var openingTimes = restaurantObj.openingTimes;
        var bankHolidayOpeningTimes = openingTimes.bankHolidayOpeningTimes;

        // Build opening times onto form
        var form = formPanel.getForm();
        form.findField('openingTimesSummary').setValue(openingTimes.openingTimesSummary);
        form.findField('closedDates').setValue(openingTimes.closedDates.join('\n'));

        // Populate individual opening times
        openingTimes.openingTimes.forEach(function(openingTime){
            var day = openingTime.dayOfWeek;
            form.findField('open_' + day).setValue(openingTime.open);
            form.findField('earlyOpeningTime_' + day).setValue(openingTime.earlyOpeningTime);
            form.findField('earlyClosingTime_' + day).setValue(openingTime.earlyClosingTime);
            form.findField('lateOpeningTime_' + day).setValue(openingTime.lateOpeningTime);
            form.findField('lateClosingTime_' + day).setValue(openingTime.lateClosingTime);
        });

        // Populate bank holiday opening times
        form.findField('open_bankHoliday').setValue(bankHolidayOpeningTimes.open);
        form.findField('earlyOpeningTime_bankHoliday').setValue(bankHolidayOpeningTimes.earlyOpeningTime);
        form.findField('earlyClosingTime_bankHoliday').setValue(bankHolidayOpeningTimes.earlyClosingTime);
        form.findField('lateOpeningTime_bankHoliday').setValue(bankHolidayOpeningTimes.lateOpeningTime);
        form.findField('lateClosingTime_bankHoliday').setValue(bankHolidayOpeningTimes.lateClosingTime);

        // Populate the minimum order values and charges
        var variableDeliveryCharges = restaurantObj.deliveryOptions.variableDeliveryCharges;
        var orderValuesArray = [];
        var deliveryChargesArray = [];
        variableDeliveryCharges.forEach(function(variableDeliveryCharge){
            orderValuesArray.push(variableDeliveryCharge.minimumOrderValue);
            deliveryChargesArray.push(variableDeliveryCharge.deliveryCharge);
        });
        form.findField('variableChargeOrderValues').setValue(orderValuesArray.join('\n'));
        form.findField('variableChargeAmounts').setValue(deliveryChargesArray.join('\n'));

        // Populate the delivery areas and charges
        var areaDeliveryCharges = restaurantObj.deliveryOptions.areaDeliveryCharges;
        var deliveryAmountsArray = [];
        var deliveryAreasArray = [];
        areaDeliveryCharges.forEach(function(areaDeliveryCharge){
            deliveryAmountsArray.push(areaDeliveryCharge.deliveryCharge);
            deliveryAreasArray.push(areaDeliveryCharge.areas.join(','));
        });
        form.findField('deliveryChargeAreas').setValue(deliveryAreasArray.join('\n'));
        form.findField('deliveryChargeAmounts').setValue(deliveryAmountsArray.join('\n'));

        // Populate the minimum order value areas and amounts
        var areaMinimumOrderCharges = restaurantObj.deliveryOptions.areaMinimumOrderCharges;
        var minimumOrderChargesArray = [];
        var minimumOrderAreasArray = [];
        areaMinimumOrderCharges.forEach(function(areaMinimumOrderCharge){
            minimumOrderChargesArray.push(areaMinimumOrderCharge.deliveryCharge);
            minimumOrderAreasArray.push(areaMinimumOrderCharge.areas.join(','));
        });
        form.findField('minimumDeliveryAreas').setValue(minimumOrderAreasArray.join('\n'));
        form.findField('minimumDeliveryAmounts').setValue(minimumOrderChargesArray.join('\n'));

        // Populate form values from delivery options record
        formPanel.loadRecord(deliveryOptions);
    },

    // Initialize menu panel
    menuRendered: function(panel) {
        panel.down('#menuitemsgrid').view.on('drop',this.menuItemsGridDropped,this);
    },

    // Fires when the add button is clicked on the menu category grid
    createMenuCategory: function(button) {
        var menuCategory = new AD.model.MenuCategory({
            name:'New Category',
            type:'STANDARD',
            menuItems:[],
            itemTypes:[]
        });
        this.getMenuCategoriesStore().add(menuCategory);
    },

    // Fires when the remove button is clicked on the menu category grid
    removeMenuCategory: function(button) {
        Ext.MessageBox.show({
            title:'Delete menu category',
            msg:'Are you sure you want to remove this menu category?',
            buttons:Ext.MessageBox.YESNO,
            icon:Ext.MessageBox.QUESTION,
            closable:false,
            fn:function(result) {
                if(result == 'yes') {
                    this.getMenuCategoriesStore().remove(menuCategoryEditForm.getRecord());
                    this.getMenuItemsStore().removeAll(false);
                    this.getMenuEditForm().removeAll(true);
                    menuCategoryEditForm = null;
                    showSuccessMessage(Ext.get('restauranteditpanel'),'Deleted','Menu category has been deleted');
                }
            },
            scope:this
        });
    },

    // Fires when the save button is clicked on the menu category edit form
    updateMenuCategory: function(button) {
        if(!menuCategoryEditForm.getForm().isValid()) {
            this.showInvalidFormWarning();
        } else {
            var index = this.getMenuCategoriesStore().indexOf(menuCategoryEditForm.getRecord());
            this.getMenuCategoriesStore().getAt(index).set(menuCategoryEditForm.getValues());
            showSuccessMessage(Ext.get('restauranteditpanel'),'Saved','Menu category details have been updated');
        }
    },

    // Fires when the revert button is clicked on the menu category edit form
    revertMenuCategory: function(button) {
        menuCategoryEditForm.getForm().reset();
        menuCategoryEditForm.loadRecord(menuCategoryEditForm.getRecord());
        showSuccessMessage(Ext.get('restauranteditpanel'),'Reverted','Menu category details have been reverted');
    },

    // Fires when a record is selected in the menu categories grid
    menuCategoriesGridSelected: function(rowmodel,record,item,index,evt,options) {

        // If the item is already selected, do nothing
        var selectedMenuCategory = this.getMenuCategoriesGrid().getSelectionModel().getLastSelected();
        if( menuCategoryEditForm && menuCategoryEditForm.getRecord() == selectedMenuCategory ) {
            return; // Do nothing on purpose
        }

        this.getMenuItemsStore().removeAll(false);
        this.getMenuItemsStore().loadData(record.get('menuItems'));

        var form = Ext.create('AD.view.restaurant.MenuCategoryEdit');
        menuCategoryEditForm = form; // Update global variable
        menuItemEditForm = null; // Update global variable
        this.getMenuEditForm().removeAll(true);
        this.getMenuEditForm().add(form);
    },

    // Updates the menu categories grid after drag/drop
    menuItemsGridDropped: function(node, data, dropRec, dropPosition) {

        // Reorder menu items store
        this.getMenuItemsStore().remove(data.records[0]);
        var index = this.getMenuItemsStore().indexOf(dropRec);
        this.getMenuItemsStore().insert((dropPosition == 'after'? index+1: index), data.records[0]);

        // Update menu items on menu category
        this.updateMenuCategoryItems();
    },

    // Loads the selected menu category into the edit form
    menuCategoryEditRendered: function(formPanel) {
        var selectedMenuCategory = this.getMenuCategoriesGrid().getSelectionModel().getLastSelected();
        menuCategoryEditForm.loadRecord(selectedMenuCategory);
    },

    // Fires when a record is selected in the menu items grid
    menuItemsGridSelected: function(rowmodel,record,item,index,evt,options) {

        // If the item is already selected, do nothing
        var selectedMenuItem = this.getMenuItemsGrid().getSelectionModel().getLastSelected();
        if( menuItemEditForm && menuItemEditForm.getRecord() == selectedMenuItem ) {
            return; // Do nothing on purpose
        }

        var form = Ext.create('AD.view.restaurant.MenuItemEdit');
        menuItemEditForm = form; // Update global variable
        menuCategoryEditForm = null; // Update global variable
        this.getMenuEditForm().removeAll(true);
        this.getMenuEditForm().add(form);
    },

    // Fires when the add button is clicked on the menu item grid
    createMenuItem: function(button) {

        // Get the selected menu category
        var selectedMenuCategory = this.getMenuCategoriesGrid().getSelectionModel().getLastSelected();
        if( !selectedMenuCategory ) {
            return; // No category selected, no nothing
        }

        // Create new menu item and add to the store
        var menuItem = new AD.model.MenuItem({
            title:'New Item',
            type:'STANDARD',
            additionalItemChoices:[],
            menuItemTypeCosts:[],
            menuItemSubTypes:[],
            additionalItemChoices:[]
        });
        this.getMenuItemsStore().add(menuItem);

        // Push new menu item into menu categories store
        var index = this.getMenuCategoriesStore().indexOf(selectedMenuCategory);
        this.getMenuCategoriesStore().getAt(index).set('menuItems',this.getMenuItemsStore().getRange());
    },

    // Fires when the remove button is clicked on the menu item grid
    removeMenuItem: function(button) {
        Ext.MessageBox.show({
            title:'Delete menu item',
            msg:'Are you sure you want to remove this menu item?',
            buttons:Ext.MessageBox.YESNO,
            icon:Ext.MessageBox.QUESTION,
            closable:false,
            fn:function(result) {
                if(result == 'yes') {
                    this.getMenuItemsStore().remove(menuItemEditForm.getRecord());
                    this.getMenuEditForm().removeAll(true);
                    menuItemEditForm = null;
                    // Update menu items on menu category
                    this.updateMenuCategoryItems();
                    showSuccessMessage(Ext.get('restauranteditpanel'),'Deleted','Menu item has been deleted');
                }
            },
            scope:this
        });
    },

    // Fires when the save button is clicked on the menu item edit form
    updateMenuItem: function(button) {

        if(!menuItemEditForm.getForm().isValid()) {
            this.showInvalidFormWarning();
        } else {
            var index = this.getMenuItemsStore().indexOf(menuItemEditForm.getRecord());
            var record = this.getMenuItemsStore().getAt(index);
            record.set(menuItemEditForm.getValues());

            // Populate menu item type costs if present
            var menuItemTypeCosts = [];
            var selectedMenuCategory = this.getMenuCategoriesGrid().getSelectionModel().getLastSelected();
            var itemTypes = selectedMenuCategory.get('itemTypes');
            delimitedStringToArray(itemTypes,'\n').forEach(function(itemType) {
                var cost;
                var additionalItemCost;
                var itemCostField = menuItemEditForm.getForm().findField('cost_' + itemType.replace(' ','_'));
                if( itemCostField ) {
                    cost = itemCostField.getValue();
                }
                var additionalItemCostField = menuItemEditForm.getForm().findField('additionalItemCost_' + itemType.replace(' ','_'));
                if( additionalItemCostField ) {
                    additionalItemCost = additionalItemCostField.getValue();
                }
                var menuItemTypeCost = new AD.model.MenuItemTypeCost({
                    type:itemType,
                    cost:cost,
                    additionalItemCost:additionalItemCost
                });
                menuItemTypeCosts.push(menuItemTypeCost);
            });
            record.set('menuItemTypeCosts',menuItemTypeCosts);

            // Populate sub type names and costs if present
            var menuItemSubTypes = [];
            var subTypeNamesField = menuItemEditForm.getForm().findField('subTypeNames');
            var subTypeCostsField = menuItemEditForm.getForm().findField('subTypeCosts');
            if( subTypeNamesField && subTypeCostsField ) {
                var subTypeNames = delimitedStringToArray(subTypeNamesField.getValue(),'\n');
                var subTypeCosts = delimitedStringToArray(subTypeCostsField.getValue(),'\n');
                for( i = 0; i < subTypeNames.length; i++ ) {
                    var menuItemSubType = new AD.model.MenuItemSubType({
                        type: subTypeNames[i],
                        cost: subTypeCosts[i]
                    });
                    menuItemSubTypes.push(menuItemSubType);
                }
            }
            record.set('menuItemSubTypes',menuItemSubTypes);

            // Populate additional item choices and costs if present
            var additionalItemChoices = [];
            var hasDefaultAdditionalItemCost = menuItemEditForm.getValues()['additionalItemCost'] != '';
            var additionalItemChoiceNamesField = menuItemEditForm.getForm().findField('additionalItemChoiceNames');
            var additionalItemChoiceCostsField = menuItemEditForm.getForm().findField('additionalItemChoiceCosts');
            if( additionalItemChoiceNamesField && additionalItemChoiceCostsField ) {

                if( additionalItemChoiceCostsField.getValue() && additionalItemChoiceCostsField.getValue() != '' && hasDefaultAdditionalItemCost ) {
                    showErrorMessage(Ext.get('restauranteditpanel'),'Error','You cannot set individual costs per additional item if the default item cost is set.');
                    return;
                }

                var additionalItemNames = delimitedStringToArray(additionalItemChoiceNamesField.getValue(),'\n');
                var additionalItemCosts = delimitedStringToArray(additionalItemChoiceCostsField.getValue(),'\n');
                if( additionalItemNames.length != additionalItemCosts.length && !hasDefaultAdditionalItemCost) {
                    showErrorMessage(Ext.get('restauranteditpanel'),'Error','You must enter the same number of additional item costs as additional items');
                    return;
                }
                for( i = 0; i < additionalItemNames.length; i++ ) {
                    var additionalItemCost = null;
                    if( !(additionalItemCosts.length < i || additionalItemCosts[i] == null )) {
                        additionalItemCost = additionalItemCosts[i];
                    }
                    var additionalItemChoice = new AD.model.MenuItemAdditionalItemChoice({
                        name: additionalItemNames[i],
                        cost: additionalItemCost
                    });
                    additionalItemChoices.push(additionalItemChoice);
                }
            }
            record.set('additionalItemChoices',additionalItemChoices);

            // Populate if we force the customer to select the maximum number of additional choices
            var forceAdditionalItemChoiceLimit = menuItemEditForm.getValues()['forceAdditionalItemChoiceLimit'] == 'on';
            record.set('forceAdditionalItemChoiceLimit',forceAdditionalItemChoiceLimit);

            // Update menu items on menu category
            this.updateMenuCategoryItems();

            // Show success message
            showSuccessMessage(Ext.get('restauranteditpanel'),'Saved','Menu item details have been updated');
        }
    },

    // Fires when the revert button is clicked on the menu item edit form
    revertMenuItem: function(button) {
        menuItemEditForm.getForm().reset();
        menuItemEditForm.loadRecord(menuItemEditForm.getRecord());
        menuItemEditForm.getRecord().get('menuItemTypeCosts').forEach(function(menuItemTypeCost){
            var itemCostField = menuItemEditForm.getForm().findField('cost_' + menuItemTypeCost.get('type').replace(' ','_'));
            if( itemCostField ) {
                itemCostField.setValue(menuItemTypeCost.get('cost'));
            }
            var additionalItemCostField = menuItemEditForm.getForm().findField('additionalItemCost_' + menuItemTypeCost.get('type').replace(' ','_'));
            if( additionalItemCostField ) {
                additionalItemCostField.setValue(menuItemTypeCost.get('additionalItemCostField'));
            }
        });

        // Populate any subtypes and associated costs if set
        var subTypeNames = [];
        var subTypeCosts = [];
        selectedMenuItem.get('menuItemSubTypes').forEach(function(menuItemSubType){
            subTypeNames.push(menuItemSubType.get('type'));
            subTypeCosts.push(menuItemSubType.get('cost'));
        });
        var subTypeNamesField = menuItemEditForm.getForm().findField('subTypeNames');
        if( subTypeNamesField ) {
            subTypeNamesField.setValue(subTypeNames.join('\n'));
        }
        var subTypeCostsField = menuItemEditForm.getForm().findField('subTypeCosts');
        if( subTypeCostsField ) {
            subTypeCostsField.setValue(subTypeCosts.join('\n'));
        }

        // Populate any additional item choices and costs if set
        var additionalItemChoiceNames = [];
        var additionalItemChoiceCosts = [];
        selectedMenuItem.get('additionalItemChoices').forEach(function(additionalItemChoice){
            additionalItemChoiceNames.push(additionalItemChoice.get('name'));
            additionalItemChoiceCosts.push(additionalItemChoice.get('cost'));
        });
        menuItemEditForm.getForm().findField('additionalItemChoiceNames').setValue(additionalItemChoiceNames.join('\n'));
        var selectedMenuCategory = this.getMenuCategoriesGrid().getSelectionModel().getLastSelected();
        if( selectedMenuCategory.get('type') != 'GRID') {
            menuItemEditForm.getForm().findField('additionalItemChoiceCosts').setValue(additionalItemChoiceCosts.join('\n'));
        }

        showSuccessMessage(Ext.get('restauranteditpanel'),'Reverted','Menu item details have been reverted');
    },

    // Loads the selected menu item into the edit form
    menuItemEditRendered: function(formPanel) {
        var selectedMenuItem = this.getMenuItemsGrid().getSelectionModel().getLastSelected();
        var selectedMenuCategory = this.getMenuCategoriesGrid().getSelectionModel().getLastSelected();
        if( selectedMenuCategory.get('type') == 'GRID') {

            // Disable select option to switch menu item type (only available for standard items)
            Ext.ComponentManager.get('menuitemtype').hide();

            // Disable cost and additional item costs fields
            formPanel.getForm().findField('cost').disable();
            formPanel.getForm().findField('additionalItemCost').disable();
            formPanel.getForm().findField('additionalItemChoiceCosts').disable();

            // Hide the sub type fields
            Ext.ComponentManager.get('subTypeNames').hide();
            Ext.ComponentManager.get('subTypeCosts').hide();

            var itemTypes = selectedMenuCategory.get('itemTypes');
            if( itemTypes ) {

                // Create field container for item type costs
                var itemTypesContainer = Ext.create('Ext.form.FieldContainer', {
                    fieldLabel:'Item type costs',
                    labelAlign:'top',
                    defaults:{
                        layout:'anchor',
                        anchor:'100%'
                    }
                });

                // Create field container for additional item costs
                var additionalItemCostsContainer = Ext.create('Ext.form.FieldContainer', {
                    fieldLabel:'Additional item costs',
                    labelAlign:'top',
                    defaults:{
                        layout:'anchor',
                        anchor:'100%'
                    }
                });

                // Generate an entry field for the item type cost and additional item costs
                itemTypes.split('\n').forEach(function(itemType){
                    var itemCostField = Ext.create('Ext.form.field.Number', {
                        fieldLabel:itemType,
                        name:'cost_' + itemType.replace(' ','_')
                    });
                    itemTypesContainer.add(itemCostField);

                    var additionalItemCostField = Ext.create('Ext.form.field.Number', {
                        fieldLabel:itemType,
                        name:'additionalItemCost_' + itemType.replace(' ','_')
                    });
                    additionalItemCostsContainer.add(additionalItemCostField);
                });

                // Add the field containers to the form
                menuItemEditForm.add(itemTypesContainer);
                menuItemEditForm.add(additionalItemCostsContainer);
            }
        } else {

            // Populate any subtypes and associated costs if set
            var subTypeNames = [];
            var subTypeCosts = [];
            selectedMenuItem.get('menuItemSubTypes').forEach(function(menuItemSubType){
                subTypeNames.push(menuItemSubType.get('type'));
                subTypeCosts.push(menuItemSubType.get('cost'));
            });
            menuItemEditForm.getForm().findField('subTypeNames').setValue(subTypeNames.join('\n'));
            menuItemEditForm.getForm().findField('subTypeCosts').setValue(subTypeCosts.join('\n'));

            // Hide/unhide fields based on menu item type
            this.updateFormDisplay(selectedMenuItem.get('type'), selectedMenuCategory.get('type'));
        }

        // Load the record onto the form
        menuItemEditForm.loadRecord(selectedMenuItem);

        // Populate menuItemTypeCosts if set
        selectedMenuItem.get('menuItemTypeCosts').forEach(function(menuItemTypeCost){
            var field = menuItemEditForm.getForm().findField('cost_' + menuItemTypeCost.get('type').replace(' ','_'));
            if( field ) {
                field.setValue(menuItemTypeCost.get('cost'));
            }
        });

        // Set the values on the form
        selectedMenuItem.get('menuItemTypeCosts').forEach(function(menuItemTypeCost){
            var itemCostField = menuItemEditForm.getForm().findField('cost_' + menuItemTypeCost.get('type').replace(' ','_'));
            if( itemCostField ) {
                itemCostField.setValue(menuItemTypeCost.get('cost'));
            }
            var additionalItemCostField = menuItemEditForm.getForm().findField('additionalItemCost_' + menuItemTypeCost.get('type').replace(' ','_'));
            if( additionalItemCostField ) {
                additionalItemCostField.setValue(menuItemTypeCost.get('additionalItemCost'));
            }
        });

        // Populate additional item choice and costs
        var additionalItemChoiceNames = [];
        var additionalItemChoiceCosts = [];
        menuItemEditForm.getForm().findField('forceAdditionalItemChoiceLimit').setValue(selectedMenuItem.get('forceAdditionalItemChoiceLimit'));

        selectedMenuItem.get('additionalItemChoices').forEach(function(additionalItemChoice) {
            additionalItemChoiceNames.push(additionalItemChoice.get('name'));
            if( additionalItemChoice.get('cost')) {
                additionalItemChoiceCosts.push(additionalItemChoice.get('cost'));
            }
        });
        menuItemEditForm.getForm().findField('additionalItemChoiceNames').setValue(additionalItemChoiceNames.join('\n'));
        if( selectedMenuCategory.get('type') != 'GRID' ) {
            menuItemEditForm.getForm().findField('additionalItemChoiceCosts').setValue(additionalItemChoiceCosts.join('\n'));
        }
    },

    // Fires when the
    menuItemTypeChanged:function() {
        var selectedMenuCategory = this.getMenuCategoriesGrid().getSelectionModel().getLastSelected();
        var type = menuItemEditForm.getValues()['type'];
        var categoryType = selectedMenuCategory.get('type');
        this.updateFormDisplay(type,categoryType);
    },

    // Updates display and enabled/disabled properties
    updateFormDisplay:function(itemType, categoryType) {
        if( categoryType == 'GRID' ) {
            return; // Subtype options not valid for GRID menu category types
        }
        if( itemType == 'STANDARD') {
            Ext.ComponentManager.get('subTypeNames').hide();
            Ext.ComponentManager.get('subTypeCosts').hide();
            menuItemEditForm.getForm().findField('cost').enable();
        } else {
            Ext.ComponentManager.get('subTypeNames').show();
            Ext.ComponentManager.get('subTypeCosts').show();
            menuItemEditForm.getForm().findField('cost').disable();
        }
    },

    // Updates menu items store into selected menu category menuItems attribute
    updateMenuCategoryItems:function() {
       var selectedMenuCategory = this.getMenuCategoriesGrid().getSelectionModel().getLastSelected();
       var categoryIndex = this.getMenuCategoriesStore().indexOf(selectedMenuCategory);
       this.getMenuCategoriesStore().getAt(categoryIndex).set('menuItems',this.getMenuItemsStore().getRange());
    },

    // Fires when the discounts grid is rendered
    discountsRendered: function(panel) {
    },

    // Fires when a record is selected in the discounts grid
    discountsGridSelected: function(rowmodel,record,item,index,evt,options) {

        // If the item is already selected, do nothing
        var selectedDiscount = this.getDiscountsGrid().getSelectionModel().getLastSelected();
        if( discountEditForm && discountEditForm.getRecord() == selectedDiscount ) {
            return; // Do nothing on purpose
        }

        var form = Ext.create('AD.view.restaurant.DiscountEdit');
        discountEditForm = form; // Update global variable
        this.getDiscountEditForm().removeAll(true);
        this.getDiscountEditForm().add(form);
    },

    // Fires when the add button is clicked on the discounts grid
    createDiscount: function(button) {
        var discount = new AD.model.Discount({
            title:'New Discount',
            discountType:'DISCOUNT_CASH',
            collection:true,
            delivery:true,
            canCombineWithOtherDiscounts:true,
            discountApplicableTimes:[]
        });
        this.getDiscountsStore().add(discount);
    },

    // Loads the selected discount into the edit form
    discountEditRendered: function(formPanel) {
        var selectedDiscount = this.getDiscountsGrid().getSelectionModel().getLastSelected();
        discountEditForm.loadRecord(selectedDiscount);

        // Populate individual applicability dates
        var applicableTimes = selectedDiscount.get('discountApplicableTimes');
        if(applicableTimes.length == 0) {
            for(var i = 1; i < 8; i++ ) {
                discountEditForm.getForm().findField('applicable_' + i).setValue(true);
            }
        } else {
            applicableTimes.forEach(function(discountApplicableTime){
                var day = discountApplicableTime.get('dayOfWeek');
                discountEditForm.getForm().findField('applicable_' + day).setValue(discountApplicableTime.get('applicable'));
                discountEditForm.getForm().findField('applicableFrom_' + day).setValue(discountApplicableTime.get('applicableFrom'));
                discountEditForm.getForm().findField('applicableTo_' + day).setValue(discountApplicableTime.get('applicableTo'));
            });
        }
    },

    // Fires when the save button is clicked on the discount edit form
    updateDiscount: function(button) {
        if(!discountEditForm.getForm().isValid()) {
            this.showInvalidFormWarning();
        } else {
            var formValues = discountEditForm.getValues();
            var discountApplicableTimes = [];
            for( day = 1; day < 8; day++ ) {
                var applicable = formValues['applicable_' + day] == 'on';
                var applicableFrom = formValues['applicableFrom_' + day];
                var applicableTo = formValues['applicableTo_' + day];
                var discountApplicableTime = new AD.model.DiscountApplicableTime({
                    dayOfWeek: day,
                    applicable: applicable,
                    applicableFrom: applicableFrom,
                    applicableTo: applicableTo,
                });
                discountApplicableTimes.push(discountApplicableTime);
            }

            var index = this.getDiscountsStore().indexOf(discountEditForm.getRecord());
            var record = this.getDiscountsStore().getAt(index);
            record.set(formValues);
            record.set('discountApplicableTimes',discountApplicableTimes);
            record.set('delivery',formValues['delivery'] == 'on');
            record.set('collection',formValues['collection'] == 'on');
            record.set('canCombineWithOtherDiscounts',formValues['canCombineWithOtherDiscounts'] == 'on');
            showSuccessMessage(Ext.get('restauranteditpanel'),'Saved','Discount details have been updated');
        }
    },

    // Fires when the revert button is clicked on the menu category edit form
    revertDiscount: function(button) {
        discountEditForm.getForm().reset();
        discountEditForm.loadRecord(discountEditForm.getRecord());
        showSuccessMessage(Ext.get('restauranteditpanel'),'Reverted','Discount details have been reverted');
    },

    // Fires when the remove button is clicked on the discount grid
    removeDiscount: function(button) {
        Ext.MessageBox.show({
            title:'Delete discount',
            msg:'Are you sure you want to remove this discount?',
            buttons:Ext.MessageBox.YESNO,
            icon:Ext.MessageBox.QUESTION,
            closable:false,
            fn:function(result) {
                if(result == 'yes') {
                    this.getDiscountsStore().remove(discountEditForm.getRecord());
                    this.getDiscountEditForm().removeAll(true);
                    discountEditForm = null;
                    showSuccessMessage(Ext.get('restauranteditpanel'),'Deleted','Discount has been deleted');
                }
            },
            scope:this
        });
    },

    // Initialize special offers
    specialOffersRendered: function(panel) {
        panel.down('#specialofferitemsgrid').view.on('drop',this.specialOfferItemsGridDropped,this);
    },

    // Fires when the add button is clicked on the special offer grid
    createSpecialOffer: function(button) {
        var specialOffer = new AD.model.SpecialOffer({
            title:'New Special Offer',
            offerApplicableTimes:[],
            specialOfferItems:[]
        });
        this.getSpecialOffersStore().add(specialOffer);
    },

    // Fires when the remove button is clicked on the special offer grid
    removeSpecialOffer: function(button) {
        Ext.MessageBox.show({
            title:'Delete special offer',
            msg:'Are you sure you want to remove this special offer?',
            buttons:Ext.MessageBox.YESNO,
            icon:Ext.MessageBox.QUESTION,
            closable:false,
            fn:function(result) {
                if(result == 'yes') {
                    this.getSpecialOffersStore().remove(specialOfferEditForm.getRecord());
                    this.getSpecialOfferItemsStore().removeAll(false);
                    this.getSpecialOfferEditForm().removeAll(true);
                    specialOfferEditForm = null;
                    showSuccessMessage(Ext.get('restauranteditpanel'),'Deleted','Special offer has been deleted');
                }
            },
            scope:this
        });
    },

    // Fires when the save button is clicked on the special offer edit form
    updateSpecialOffer: function(button) {
        if(!specialOfferEditForm.getForm().isValid()) {
            this.showInvalidFormWarning();
        } else {
            var formValues = specialOfferEditForm.getValues();
            var offerApplicableTimes = [];
            for( day = 1; day < 8; day++ ) {
                var applicable = formValues['applicable_' + day] == 'on';
                var applicableFrom = formValues['applicableFrom_' + day];
                var applicableTo = formValues['applicableTo_' + day];
                var offerApplicableTime = new AD.model.SpecialOfferApplicableTime({
                    dayOfWeek: day,
                    applicable: applicable,
                    applicableFrom: applicableFrom,
                    applicableTo: applicableTo,
                });
                offerApplicableTimes.push(offerApplicableTime);
            }

            var index = this.getSpecialOffersStore().indexOf(specialOfferEditForm.getRecord());
            var record = this.getSpecialOffersStore().getAt(index);
            record.set(formValues);
            record.set('offerApplicableTimes',offerApplicableTimes);
            showSuccessMessage(Ext.get('restauranteditpanel'),'Saved','Special offer details have been updated');
        }
    },

    // Fires when the revert button is clicked on the special offer edit form
    revertSpecialOffer: function(button) {
        specialOfferEditForm.getForm().reset();
        specialOfferEditForm.loadRecord(specialOfferEditForm.getRecord());
        showSuccessMessage(Ext.get('restauranteditpanel'),'Reverted','Special offer details have been reverted');
    },

    // Fires when a record is selected in the special offers grid
    specialOffersGridSelected: function(rowmodel,record,item,index,evt,options) {

        // If the item is already selected, do nothing
        var selectedSpecialOffer = this.getSpecialOffersGrid().getSelectionModel().getLastSelected();
        if( specialOfferEditForm && specialOfferEditForm.getRecord() == selectedSpecialOffer ) {
            return; // Do nothing on purpose
        }

        this.getSpecialOfferItemsStore().removeAll(false);
        this.getSpecialOfferItemsStore().loadData(record.get('specialOfferItems'));

        var form = Ext.create('AD.view.restaurant.SpecialOfferEdit');
        specialOfferEditForm = form; // Update global variable
        specialOfferItemEditForm = null; // Update global variable
        this.getSpecialOfferEditForm().removeAll(true);
        this.getSpecialOfferEditForm().add(form);
    },

    // Updates the special offers grid after drag/drop
    specialOfferItemsGridDropped: function(node, data, dropRec, dropPosition) {

        // Reorder special offer items store
        this.getSpecialOfferItemsStore().remove(data.records[0]);
        var index = this.getSpecialOfferItemsStore().indexOf(dropRec);
        this.getSpecialOfferItemsStore().insert((dropPosition == 'after'? index+1: index), data.records[0]);

        // Update special offer items on special offer
        this.updateSpecialOfferItems();
    },

    // Loads the selected special offer into the edit form
    specialOfferEditRendered: function(formPanel) {
        var selectedSpecialOffer = this.getSpecialOffersGrid().getSelectionModel().getLastSelected();
        specialOfferEditForm.loadRecord(selectedSpecialOffer);

        // Populate individual applicability dates
        var offerApplicableTimes = selectedSpecialOffer.get('offerApplicableTimes');
        if(offerApplicableTimes.length == 0) {
            for(var i = 1; i < 8; i++ ) {
                specialOfferEditForm.getForm().findField('applicable_' + i).setValue(true);
            }
        } else {
            offerApplicableTimes.forEach(function(offerApplicableTime){
                var day = offerApplicableTime.get('dayOfWeek');
                specialOfferEditForm.getForm().findField('applicable_' + day).setValue(offerApplicableTime.get('applicable'));
                specialOfferEditForm.getForm().findField('applicableFrom_' + day).setValue(offerApplicableTime.get('applicableFrom'));
                specialOfferEditForm.getForm().findField('applicableTo_' + day).setValue(offerApplicableTime.get('applicableTo'));
            });
        }
    },

    // Fires when a record is selected in the speical offer items grid
    specialOfferItemsGridSelected: function(rowmodel,record,item,index,evt,options) {

        // If the item is already selected, do nothing
        var selectedSpecialOfferItem = this.getSpecialOfferItemsGrid().getSelectionModel().getLastSelected();
        if( specialOfferItemEditForm && specialOfferItemEditForm.getRecord() == selectedSpecialOfferItem ) {
            return; // Do nothing on purpose
        }

        var form = Ext.create('AD.view.restaurant.SpecialOfferItemEdit');
        specialOfferItemEditForm = form; // Update global variable
        specialOfferEditForm = null; // Update global variable
        this.getSpecialOfferEditForm().removeAll(true);
        this.getSpecialOfferEditForm().add(form);
    },

    // Fires when the add button is clicked on the special offer item grid
    createSpecialOfferItem: function(button) {

        // Get the selected special offer
        var selectedSpecialOffer = this.getSpecialOffersGrid().getSelectionModel().getLastSelected();
        if( !selectedSpecialOffer ) {
            return; // No special offer selected, no nothing
        }

        // Create new special offer item and add to the store
        var specialOfferItem = new AD.model.SpecialOfferItem({
            title:'New Item',
            specialOfferItemChoices:[]
        });
        this.getSpecialOfferItemsStore().add(specialOfferItem);

        // Push new special offer item into special offer items store
        var index = this.getSpecialOffersStore().indexOf(selectedSpecialOffer);
        this.getSpecialOffersStore().getAt(index).set('specialOfferItems',this.getSpecialOfferItemsStore().getRange());
    },

    // Fires when the remove button is clicked on the special offer item grid
    removeSpecialOfferItem: function(button) {
        Ext.MessageBox.show({
            title:'Delete special offer item',
            msg:'Are you sure you want to remove this special offer item?',
            buttons:Ext.MessageBox.YESNO,
            icon:Ext.MessageBox.QUESTION,
            closable:false,
            fn:function(result) {
                if(result == 'yes') {
                    this.getSpecialOfferItemsStore().remove(specialOfferItemEditForm.getRecord());
                    this.getSpecialOfferEditForm().removeAll(true);
                    specialOfferItemEditForm = null;
                    // Update special offer items on special offer
                    this.updateSpecialOfferItems();
                    showSuccessMessage(Ext.get('restauranteditpanel'),'Deleted','Special offer item has been deleted');
                }
            },
            scope:this
        });
    },

    // Fires when the save button is clicked on the special offer item edit form
    updateSpecialOfferItem: function(button) {

        if(!specialOfferItemEditForm.getForm().isValid()) {
            this.showInvalidFormWarning();
        } else {

            var specialOfferItemChoiceNamesField = specialOfferItemEditForm.getForm().findField('specialOfferItemChoices');
            var specialOfferItemChoiceCostsField = specialOfferItemEditForm.getForm().findField('specialOfferItemChoiceCosts');
            var specialOfferItemChoiceNames = delimitedStringToArray(specialOfferItemChoiceNamesField.getValue(),'\n');
            var specialOfferItemChoiceCosts = delimitedStringToArray(specialOfferItemChoiceCostsField.getValue(),'\n');
            if( specialOfferItemChoiceCosts.length > 0 && specialOfferItemChoiceNames.length != specialOfferItemChoiceCosts.length) {
                showErrorMessage(Ext.get('restauranteditpanel'),'Error','You must set the same number of choice costs as choices (enter 0 for no additional cost).');
                return;
            }

            var index = this.getSpecialOfferItemsStore().indexOf(specialOfferItemEditForm.getRecord());
            var record = this.getSpecialOfferItemsStore().getAt(index);
            record.set(specialOfferItemEditForm.getValues());

            // Update special offer items on special offer
            this.updateSpecialOfferItems();

            // Show success message
            showSuccessMessage(Ext.get('restauranteditpanel'),'Saved','Special offer item details have been updated');
        }
    },

    // Fires when the revert button is clicked on the special offer item edit form
    revertSpecialOfferItem: function(button) {
        specialOfferItemEditForm.getForm().reset();
        specialOfferItemEditForm.loadRecord(specialOfferItemEditForm.getRecord());
        showSuccessMessage(Ext.get('restauranteditpanel'),'Reverted','Special offer item details have been reverted');
    },

    // Loads the selected special offer item into the edit form
    specialOfferItemEditRendered: function(formPanel) {
        var selectedSpecialOfferItem = this.getSpecialOfferItemsGrid().getSelectionModel().getLastSelected();
        specialOfferItemEditForm.loadRecord(selectedSpecialOfferItem);
    },

    // Updates special offer items store into selected special offer items attribute
    updateSpecialOfferItems:function() {
       var selectedSpecialOffer = this.getSpecialOffersGrid().getSelectionModel().getLastSelected();
       var specialOfferIndex = this.getSpecialOffersStore().indexOf(selectedSpecialOffer);
       this.getSpecialOffersStore().getAt(specialOfferIndex).set('specialOfferItems',this.getSpecialOfferItemsStore().getRange());
    },

    // Shows a warning alert box
    showInvalidFormWarning: function() {
        Ext.MessageBox.show({
            title:'Input Values Not Valid',
            msg:'Please check all required fields have been entered correctly',
            buttons:Ext.MessageBox.OK,
            icon:Ext.MessageBox.WARNING,
            closable:false
        });
    },

     // Fires when the discounts grid is rendered
     restaurantUpdatesRendered: function(panel) {
        this.getRestaurantUpdatesStore().loadData(restaurantObj.restaurantUpdates);
     }

});