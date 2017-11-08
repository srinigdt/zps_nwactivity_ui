sap.ui.define([
   "sap/ui/core/UIComponent",
   "sap/ui/model/json/JSONModel",
   "sap/ui/model/odata/ODataModel",
   "sap/ui/model/resource/ResourceModel",
   "gdt/ui/ps/networkcomp/data/Preloader",
   "gdt/ui/ps/networkcomp/util/DialogHelper"
], function (UIComponent, JSONModel,ODataModel,ResourceModel,Preloader,DialogHelper) {
   "use strict";
   return UIComponent.extend("gdt.ui.ps.networkcomp.Component", {
            metadata : {
            	manifest: "json",
         //   	,
		 //       rootView : "gdt.ui.ps.networkcomp.views.App"

                 config : {
            	           resourceBundle : "i18n/i18n.properties",
            	           titleResource : "GDT PS Material Ordering Process",
            	           fullWidth:true,
            	           serviceConfig : {
            	               name : "Z_PS_NETWORK_COMP_ADD_SRV",
            	               serviceUrl : "/sap/opu/odata/sap/Z_PS_NETWORK_COMP_ADD_SRV"
            	                             }
            		      }
	},
	
      init : function () {
  	  
    this.dialogHelper = new DialogHelper( );
    	  
    var that          = this,
     	core          = sap.ui.getCore(),
     	serviceConfig = this.getMetadata().getConfig()["serviceConfig"], 
     	sourceUrl     = this.getMetadata().getManifestEntry("sap.app").dataSources["MaterialOrderingService"].uri,
     	serviceUrl    = ((window.location.hostname === "localhost") ? "proxy" : "")
                        + serviceConfig.serviceUrl
                        + ((window.location.hostname === "localhost") ? "?sap-client=150" : "");
   var  rootPath      = jQuery.sap.getModulePath("gdt.ui.ps.networkcomp");
	                    
  var   mainCSSUrl    = [rootPath, "css/style.css"].join("/"),
        quickViewDataUrl = [rootPath, "model/customerQuickView.json"].join("/"),                 
        i18nModel     = new ResourceModel({
		                    bundleUrl : [rootPath,
		                            "i18n/i18n.properties"].join("/")
	                    }),
                    
	    copies        = new JSONModel([]),
        lineItems     = new JSONModel([]),
        materials     = new JSONModel([]),
        ProjectNetworks= new JSONModel([]),
	    systemInfo    = new JSONModel({}),
	    currentData   = new JSONModel({}),
	    deliveryAddress = new JSONModel({}),
	    customerShipToAddress=new JSONModel({}),
	    lineItem      = new JSONModel({}),
	    lineItemCopy  = new JSONModel({}),
	    currentDataCopy = new JSONModel({}),
	    blankLineItem = new JSONModel({}),
	    Manufacturers = new JSONModel([]),
	    Vendors       = new JSONModel([]),
	    Uom           = new JSONModel([]),
	    Countries     = new JSONModel([]),
	    Address       = new JSONModel([]),
	    Customers     = new JSONModel([]),
	    Regions       = new JSONModel([]),
	    Languages     = new JSONModel([]),
	    TaxJurisdiction = new JSONModel([]),
	    MaterialGroup = new JSONModel([]),
	    MaterialType  = new JSONModel([]),
	    Languages     = new JSONModel([]),
	    deleteEntries = new JSONModel([]),
	    blankAddressLine = new JSONModel({}),
	    mailComposeLines = new JSONModel([]),
	    customerAddressTemplate  = new sap.ui.model.json.JSONModel(quickViewDataUrl),
	    customerAddress   = new JSONModel({}),
	    procurementList  = new JSONModel([
	                                   {'key' :'PEV',
	                                    'Name':'PEV'},
	                                   {'key ':'PFS',
		                                'Name':'PFS'},
		                               {'key' :'WE',
			                            'Name':'WE'}

	                                   
	                                      ]), 
	    
	    titleList   = new JSONModel([
                                 {'key' :'',
                                  'Name':''},     
                                 {'key' :'0001',
	                              'Name':'Ms.'},
	                             {'key':'0002',
		                          'Name':'Mr.'},
		                         {'key' :'0003',
			                      'Name':'Company'},
		                         {'key' :'0004',
				                  'Name':'Mr. and Mrs.'}
	                                   
	                                      ]), 
        deviceModel   = new JSONModel({
                          isTouch : sap.ui.Device.support.touch,
                          isNoTouch : !sap.ui.Device.support.touch,
                          isPhone : jQuery.device.is.phone,
                          isNoPhone : !jQuery.device.is.phone,
                          listMode : (jQuery.device.is.phone) ? "None" : "SingleSelectMaster",
                          listItemType : (jQuery.device.is.phone) ? "Active" : "Inactive"
                          }),
      
       currentState   =  new JSONModel({
  	                        isEditMode : false,
  	                        isNotEditMode : true,
  	                        canDelete : false,
  	                        canEdit : true,
  	                        itemNumber:"",
  	                        deleteEnable:false,
  	                        anyErrors:false,
  	                        anyItems:false,
  	                        isCustCreate:false,
  	                        isMailTab:false,
  	                        isMailCompose:false
  	                      }),
  	                      
  	   inputData       =  new JSONModel({
  	                        Network   : "",
  	                        Activity  : "",
  	                        ItemNumber: ""
  	                       }),
  	   model           = new ODataModel(serviceUrl, {
 	                        json : true,
 	                        loadMetadataAsync : false
 	                    });
    model.setDefaultBindingMode("TwoWay");
    jQuery.sap.includeStyleSheet(mainCSSUrl);    
    

    /* call the init function of the parent */
    UIComponent.prototype.init.apply(this, arguments);
 
    
//** Setting Models
   
    this.setModel(i18nModel, "i18n");
    core.setModel(deviceModel, "device");
    core.setModel(currentState, "currentState");
    core.setModel(systemInfo, "systemInfo");
    core.setModel(inputData, "inputData");
    core.setModel(copies, "copies");
    core.setModel(lineItems, "lineItems");
    core.setModel(blankLineItem,"blankLineItem"); 
    core.setModel(deleteEntries,"deleteEntries");
    core.setModel(Manufacturers,"Manufacturers");
    core.setModel(Vendors,"Vendors");
    core.setModel(Uom,"Uom");
    core.setModel(Countries,"Countries");
    core.setModel(Regions,"Regions");
    core.setModel(Address,"Address");
    core.setModel(Customers,"Customers");
    core.setModel(MaterialGroup,"MaterialGroup");
    core.setModel(MaterialType,"MaterialType");
    core.setModel(currentData, "currentData");
    core.setModel(materials,'materials'); 
    core.setModel(ProjectNetworks,'ProjectNetworks');
    core.setModel(procurementList,'procurementList'); 
    core.setModel(titleList,'titleList');
    core.setModel(customerAddress,'customerAddress');
    core.setModel(deliveryAddress,'deliveryAddress');
    core.setModel(customerShipToAddress,'customerShipToAddress');
    core.setModel(blankAddressLine,'blankAddressLine');
    core.setModel(TaxJurisdiction,'TaxJurisdiction');
    core.setModel(Languages,'Languages');
    core.setModel(lineItem,'lineItem');
    core.setModel(lineItemCopy,'lineItemCopy');
    core.setModel(currentDataCopy,'currentDataCopy');
    core.setModel(customerAddressTemplate,'customerAddressTemplate');
    core.setModel(mailComposeLines,'mailComposeLines');
    core.setModel(model);
    
    $.when(Preloader.init(model)).done(function() {
    	that.getRouter().initialize();
    }).fail(function() {
    	sap.m.MessageToast.show("Failed to preload data...app could not start");
    });     
         


      }
   });
});