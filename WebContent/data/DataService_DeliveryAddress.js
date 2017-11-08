/* global _:true */
/* global gdt:true */

$.sap.declare("gdt.ui.ps.networkcomp.data.DataService_DeliveryAddress");
$.sap.require("gdt.ui.ps.networkcomp.util.SAPGatewayHelper");
$.sap.require("sap.ui.core.Core");
$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");

gdt.ui.ps.networkcomp.data.DataService_DeliveryAddress = (function($, core, _, helper) {

	var get = function(key) {
		return $.Deferred(function(defer) {
			var model = core.getModel();
    		model.read("/DeliveryAddressSet(Customer='" + key.Customer + "',Addrnumber='" + key.Addrnumber+"')", {
	            	success: function(data, response) {
	                	defer.resolve(_fixDataDown(data));
	            	},
					error: function(data, response) {
						defer.reject(helper.ParseError(data,"Delivery Address details could not be fetched from SAP."));
					}
	            });
		}).promise();		
	},
	_fixDataDown = function(data) {
		if (!data){ return data;}
	                	
		return data;
	},
	fixDataUp = function(data) {
		if (!data) {return data;}
      return data; 
	},
	
	getByForeignKey = function(key) {
		return $.Deferred(function(defer) {
			var model = core.getModel();
        	model.read("/DeliveryAddressSet(Customer='" + key.Customer + "',Addrnumber='" + key.Addrnumber+"')", {
            	success: function(data, response) {
            		_.each(data.results, function (result) { result = _fixDataDown(result);});
                	defer.resolve(data.results, response);
            	},
				error: function(data) {
					defer.reject(helper.ParseError(data, "Delivery Address details could not be fetched from SAP."));
				}
            });
		}).promise();		
	},
	remove = function(key) {
		return $.Deferred(function(defer) {
			var model = core.getModel();
    		model.remove("/DeliveryAddressSet(Customer='" + key.Customer + "',Addrnumber='" + key.Addrnumber+"')", {
	            	success: function(data, response) {
	            		if (response.statusCode >= 200 && response.statusCode <= 299) {
	            			defer.resolve();
	            		} else {
	                		defer.reject(helper.ParseError(data,"The Delivery Address detail record could not be deleted from SAP."));
	            		}
	            	},
					error: function(data) {
						defer.reject(helper.ParseError(data,"The Delivery Address details  could not be deleted from SAP."));
					}
	            });
		}).promise();		
	},
	
	create = function(DeliveryAddressData) {
		return $.Deferred(function(defer) {
			var model = core.getModel();
			fixDataUp(DeliveryAddressData);
    		model.create("/DeliveryAddressSet", DeliveryAddressData, {
	            	success: function(data, response) {
	            		if (response.statusCode >= 200 && response.statusCode <= 299) {
	            			defer.resolve(_fixDataDown(data));
	            		} else {
							defer.reject(helper.ParseError(data,"The Delivery Address details data could not be created/updated in SAP."));
	            		}
	            	},
					error: function(data) {
						defer.reject(helper.ParseError(data,"Please correct the following error(s)"));
					},
					async: true
	            });
		}).promise();		
	}; 

return {
    get: get,
    getByForeignKey: getByForeignKey,
    remove: remove,
    create: create
};
	
	
	
})($,sap.ui.getCore(),_, gdt.ui.ps.networkcomp.util.SAPGatewayHelper);