Ext.define('AD.controller.RestaurantList', {
    extend: 'Ext.app.Controller',
    stores:['Restaurants'],
    models: ['Restaurant','NotificationOptions'],
    views:[
    	'restaurant.List'
    ],

    refs: [{
        ref:'restaurantList',
        selector:'restaurantlist'
    }],

	init: function() {
		this.control({
		    'restaurantlist': {
                render:this.onGridRendered,
                itemdblclick:this.onGridDblClick,
                itemcontextmenu:this.onContextMenu
            },

            'restaurantlist button[action=create]': {
            	click:this.create
            },

            'restaurantlist button[action=edit]': {
            	click:this.editSelected
            },

            'restaurantlist button[action=delete]': {
            	click:this.deleteSelected
            },

            'restaurantlist menuitem[action=downloadTemplate]': {
            	click:this.downloadTemplate
            },

            'restaurantlist menuitem[action=uploadTemplate]': {
                click:this.uploadTemplate
            },

            'restaurantlist menuitem[action=downloadBulkTemplate]': {
            	click:this.downloadBulkTemplate
            },

            'restaurantlist menuitem[action=uploadBulkTemplate]': {
                click:this.uploadBulkTemplate
            }

		});
	},

    refresh: function(button) {
    	reloadListStore('restaurantlist');
    },

    create: function(button) {
        location.href = ctx + '/admin/restaurants/edit.html';
    },

    editSelected: function() {
        var record = this.getSelectedRecord();
        if( record ) {
            var restaurantId = record.get('restaurantId');
            location.href = ctx + '/admin/restaurants/edit.html?restaurantId=' + restaurantId;
        }
    },


	onContextMenu: function(view, record, item, index, e ) {
	    e.stopEvent();
	    this.getRestaurantList().getSelectionModel().select(record);
	    var restaurantId = record.get('restaurantId');
	    var externalId = record.get('externalId');
	    var ctrl = this;
	    var menu = Ext.create('Ext.menu.Menu',{
	        id:'restaurant-menu',
            items:[{
                text:'Edit restaurant',
                icon:'../resources/images/icons-shadowless/document-text.png',
                handler:function(){
                    ctrl.editSelected();
                }
            }],
            listeners:{
                'hide': {
                    fn:function(){
                        this.destroy();
                    }
                }
            }
	    });

        // Add list/unlist buttons
	    if(record.get('listOnSite') == true) {
	        menu.add({
	            text:'Delist from site',
	            icon:'../resources/images/icons-shadowless/minus-shield.png',
	            handler:function() {
	                ctrl.updateAttribute(restaurantId,'listOnSite',false);
	            }
	        });
	    } else {
	        menu.add({
	            text:'List on site',
	            icon:'../resources/images/icons-shadowless/tick-shield.png',
	            handler:function() {
	                ctrl.updateAttribute(restaurantId,'listOnSite',true);
	            }
	        });
	    }

        // Add recommend button
	    if(record.get('recommended') == true) {
	        menu.add({
	            text:'Remove from recommendations',
	            icon:'../resources/images/icons-shadowless/thumb.png',
	            handler:function() {
	                ctrl.updateAttribute(restaurantId,'recommended',false);
	            }
	        });
	    } else {
	        menu.add({
	            text:'Add to recommendations',
	            icon:'../resources/images/icons-shadowless/thumb-up.png',
	            handler:function() {
	                ctrl.updateAttribute(restaurantId,'recommended',true);
	            }
	        });
	    }
        menu.add('-');
        menu.add({
            text:'Delete restaurant',
            icon:'../resources/images/icons-shadowless/cross-button.png',
            handler:function() {
                ctrl.deleteRestaurant(restaurantId);
            }
        });

        // Add jump to external button
        if(record.get('origin') == 'JustEat') {
            menu.add('-');
            menu.add({
                text:'Open external site',
                icon:'../resources/images/icons-shadowless/navigation-000-button.png',
                handler:function() {
                    window.open(externalId);
                }
            });
            menu.add({
                text:'Set as Llamarycomer',
                icon:'../resources/images/icons-shadowless/home.png',
                handler:function() {
                    ctrl.setLocalOrigin(restaurantId);
                }
            });
        }

	    menu.showAt(e.getXY());
	},

    updateAttribute:function(restaurantId, attribute, value ) {
        Ext.Ajax.request({
            url: ctx + '/admin/restaurants/updateAttribute.ajax',
            method:'POST',
            params: {
                restaurantId: restaurantId,
                attribute: attribute,
                value: value
            },
            success: function(response) {
                var obj = Ext.decode(response.responseText);
                if( obj.success ) {
                    showSuccessMessage(Ext.get('restaurantlist'),'Updated','Restaurant updated successfully');
                    var store = Ext.getCmp('restaurantlist').getStore();
                    store.loadPage(store.currentPage);
                } else {
                    showErrorMessage(Ext.get('restaurantlist'),'Error',obj.message);
                }
            },
            failure: function(response) {
                var obj = Ext.decode(response.responseText);
                showErrorMessage(Ext.get('restaurantlist'),'Error',obj.message);
            },
            scope:this
        });
    },

    deleteRestaurant: function(restaurantId) {
        Ext.MessageBox.show({
            title:'Delete restaurant',
            msg:'Are you sure you want to delete this restaurant?',
            buttons:Ext.MessageBox.YESNO,
            icon:Ext.MessageBox.QUESTION,
            closable:false,
            fn:function(result) {
                if(result == 'yes') {
                    this.updateAttribute(restaurantId,'deleted',true);
                }
            },
            scope:this
        });
    },

    setLocalOrigin: function(restaurantId) {
        Ext.MessageBox.show({
            title:'Set as Llamarycomer',
            msg:'Are you sure you want to unlink from JustEat?',
            buttons:Ext.MessageBox.YESNO,
            icon:Ext.MessageBox.QUESTION,
            closable:false,
            fn:function(result) {
                if(result == 'yes') {
                    Ext.Ajax.request({
                        url: ctx + '/admin/restaurants/setLocalOrigin.ajax',
                        method:'POST',
                        params: {
                            restaurantId: restaurantId
                        },
                        success: function(response) {
                            var obj = Ext.decode(response.responseText);
                            if( obj.success ) {
                                showSuccessMessage(Ext.get('restaurantlist'),'Updated','Restaurant updated successfully');
                                var store = Ext.getCmp('restaurantlist').getStore();
                                store.loadPage(store.currentPage);
                            } else {
                                showErrorMessage(Ext.get('restaurantlist'),'Error',obj.message);
                            }
                        },
                        failure: function(response) {
                            var obj = Ext.decode(response.responseText);
                            showErrorMessage(Ext.get('restaurantlist'),'Error',obj.message);
                        },
                        scope:this
                    });
                }
            },
            scope:this
        });
    },

	onGridRendered: function(grid) {
		grid.getStore().loadPage(1);
	},

	onGridDblClick: function(view,record,item,index,eventObj,options) {
        var restaurantId = record.get('restaurantId');
        location.href = ctx + '/admin/restaurants/edit.html?restaurantId=' + restaurantId;
	},

	getSelectedRecord: function() {
	    return this.getRestaurantList().getSelectionModel().getLastSelected();
	},

    downloadTemplate:function() {
        window.location = '/admin/menu/downloadTemplate.html';
    },

    downloadBulkTemplate:function() {
        window.location = '/admin/menu/downloadBulkTemplate.html';
    },

    uploadTemplate:function() {
        Ext.create('Ext.window.Window', {
            title: 'Upload Restaurant Sheet',
            id:'uploadsheet',
            height: 130,
            width: 450,
            autoScroll:true,
            layout:'fit',
            closeAction:'destroy',
            items: [{
                xtype:'form',
                id:'uploadForm',
                bodyPadding: 15,
                layout:'anchor',
                frame:false,
                border:false,
                items:[{
                    xtype:'filefield',
                    anchor:'100%',
                    allowBlank:true,
                    fieldLabel:'Spreadsheet',
                    name:'file',
                    buttonText:'Select File'
                }]
            }],
            buttons: [{
                text:'Upload',
                handler:function() {
                    var formPanel = Ext.getCmp('uploadForm');
                    var fileField = formPanel.getForm().findField('file');
                    if( fileField.getValue() != '' ) {
                        var myMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait..."});
                        myMask.show();
                        formPanel.getForm().submit({
                            url: ctx + '/admin/menu/upload.ajax',
                            success: function(form,action) {
                                myMask.hide();
                                var obj = Ext.decode(action.response.responseText);
                                if( obj.valid == true ) {
                                    Ext.getCmp('uploadsheet').close();
                                    showSuccessMessage(Ext.get('restaurantlist'),'Uploaded','Restaurant data uploaded successfully');
                                    var store = Ext.getCmp('restaurantlist').getStore();
                                    store.loadPage(store.currentPage);
                                } else {
                                    var errorText = '';
                                    obj.errors.forEach(function(error){
                                        errorText += '<p>' + error + '</p>';
                                    });
                                    Ext.Msg.show({
                                         title:'Errors validating spreadsheet',
                                         msg: errorText,
                                         buttons: Ext.Msg.OK,
                                         icon: Ext.Msg.WARNING
                                    });
                                }
                            },
                            failure: function(form,action) {
                                myMask.hide();
                                showErrorMessage(Ext.get('restaurantlist'),'Error','Error occurred uploading restaurant details');
                            }
                        });
                    }
                }
            }]
        }).show();
    },

    uploadBulkTemplate:function() {
        Ext.create('Ext.window.Window', {
            title: 'Upload Bulk Restaurant Sheet',
            id:'uploadsheet',
            height: 130,
            width: 450,
            autoScroll:true,
            layout:'fit',
            closeAction:'destroy',
            items: [{
                xtype:'form',
                id:'uploadForm',
                bodyPadding: 15,
                layout:'anchor',
                frame:false,
                border:false,
                items:[{
                    xtype:'filefield',
                    anchor:'100%',
                    allowBlank:true,
                    fieldLabel:'Spreadsheet',
                    name:'file',
                    buttonText:'Select File'
                }]
            }],
            buttons: [{
                text:'Upload',
                handler:function() {
                    var formPanel = Ext.getCmp('uploadForm');
                    var fileField = formPanel.getForm().findField('file');
                    if( fileField.getValue() != '' ) {
                        var myMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait..."});
                        myMask.show();
                        formPanel.getForm().submit({
                            url: ctx + '/admin/menu/bulkUpload.ajax',
                            success: function(form,action) {
                                myMask.hide();
                                var obj = Ext.decode(action.response.responseText);
                                if( obj.valid == true ) {
                                    Ext.getCmp('uploadsheet').close();
                                    showSuccessMessage(Ext.get('restaurantlist'),'Uploaded','Restaurant data uploaded successfully');
                                    var store = Ext.getCmp('restaurantlist').getStore();
                                    store.loadPage(store.currentPage);
                                } else {
                                    var errorText = '';
                                    obj.errors.forEach(function(error){
                                        errorText += '<p>' + error + '</p>';
                                    });
                                    Ext.Msg.show({
                                         title:'Errors validating spreadsheet',
                                         msg: errorText,
                                         buttons: Ext.Msg.OK,
                                         icon: Ext.Msg.WARNING
                                    });
                                }
                            },
                            failure: function(form,action) {
                                myMask.hide();
                                showErrorMessage(Ext.get('restaurantlist'),'Error','Error occurred uploading bulk restaurant details');
                            }
                        });
                    }
                }
            }]
        }).show();
    }

});