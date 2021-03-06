Ext.define('AD.view.restaurant.Edit' ,{
    extend:'Ext.panel.Panel',
    alias:'widget.restaurantedit',
    id:'restauranteditpanel',
    layout:'fit',

    dockedItems:[{
        xtype:'toolbar',
        dock:'top',
        autoScroll:true,
        layout: {
            overflowHandler: 'Menu'
        },
        items:[{
            xtype:'button',
            icon: resources + '/images/icons-shadowless/disk-black.png',
            text:'Save Changes',
            action:'saverestaurant'
        },{
            xtype:'button',
            icon: resources + '/images/icons-shadowless/arrow-180.png',
            text:'Close',
            action:'close'
        },{
            xtype:'button',
            icon: resources + '/images/icons-shadowless/image--arrow.png',
            text:'Upload image',
            action:'upload',
        },{
            xtype:'button',
            icon: resources + '/images/icons-shadowless/image--minus.png',
            text:'Clear uploaded image',
            action:'clear'
        },'-',{
            xtype:'button',
            icon: resources + '/images/icons-shadowless/mail--arrow.png',
            text:'Send for Owner Approval',
            action:'sendForOwnerApproval'
        },{
            xtype:'button',
            icon: resources + '/images/icons-shadowless/telephone--arrow.png',
            text:'Open to test phone call',
            action:'openToTestPhoneCall'
        },'-',{
            xtype:'button',
            icon: resources + '/images/icons-shadowless/map.png',
            text:'Show location',
            action:'showLocation'
        },'-',{
            xtype:'button',
            icon: resources + '/images/icons-shadowless/report-excel.png',
    	    text:'Export details',
            action:'downloadMenu'
        },'-',{
            xtype:'button',
            icon: resources + '/images/icons-shadowless/navigation-000-button.png',
            text:'Open External Site',
            action:'openExternal'
        }]
    }],

    items:[{
        xtype:'tabpanel',
        id:'restauranttabpanel',
        layout:'fit',
        deferredRender:false,
        items:[{
            xtype:'restaurantmaindetails'
        },{
            xtype:'restaurantdeliverydetails'
        },{
            xtype:'restaurantmenu'
        },{
            xtype:'restaurantdiscounts'
        },{
            xtype:'restaurantspecialoffers'
        },{
            xtype:'restaurantupdates'
        }
        ]
    }]

});