/* global _:true */
/* global gdt:true */
$.sap.declare("gdt.ui.ps.networkcomp.data.DataService_NetworkActivityItems");
$.sap.require("gdt.ui.ps.networkcomp.util.SAPGatewayHelper");
$.sap.require("sap.ui.core.Core");
$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");

gdt.ui.ps.networkcomp.data.DataService_NetworkActivityItems = (function($, core, _, helper) {

	var get = function(key) {
		return $.Deferred(function(defer) {
			var model = core.getModel();
    		model.read("/HeaderNwCompSet(Network='" + key[0] + "',Activity='" + key[1] + "',ItemNumber=" + "''" +")", {
	            	success: function(data, response) {
	                	defer.resolve(_fixDataDown(data));
	            	},
					error: function(data, response) {
						defer.reject(helper.ParseError(data,"Data Could not be fetched from SAP."));
					}
	            });
		}).promise();		
	},
	_fixDataDown = function(data) {
		if (!data){ return data;}
	                	
		return data;
	},
	fixDataUp = function(data) {
		if (!data){ return data;}
      return data; 
	},
	
	getByForeignKey = function(key) {
		return $.Deferred(function(defer) {
			var model = core.getModel();
        	model.read("/HeaderNwCompSet(Network='" +key[0] + "',Activity='" + key[1] + ",ItemNumber=" + "''" +")/LineItems", {
            	success: function(data, response) {
            		_.each(data.results, function (result) { result = _fixDataDown(result);});
                	defer.resolve(data.results, response);
            	},
				error: function(data) {
					defer.reject(helper.ParseError(data, "Data Could not be fetched from SAP."));
				}
            });
		}).promise();		
	},
	remove = function(key) {
		return $.Deferred(function(defer) {
			var model = core.getModel();
    		model.remove("/HeaderNwCompSet(Network='" + key[0] + ",Activity='" + key[1] + ",ItemNumber=" + "''" +"')", {
	            	success: function(data, response) {
	            		if (response.statusCode >= 200 && response.statusCode <= 299) {
	            			defer.resolve();
	            		} else {
	                		defer.reject(helper.ParseError(data,"The record Could not be deleted from SAP."));
	            		}
	            	},
					error: function(data) {
						defer.reject(helper.ParseError(data,"The record Could not be deleted from SAP."));
					}
	            });
		}).promise();		
	},
	
	create = function(data) {
		return $.Deferred(function(defer) {
			var model = core.getModel();
			fixDataUp(data);
    		model.create("/HeaderNwCompSet", data, {
	            	success: function(data, response) {
	            		if (response.statusCode >= 200 && response.statusCode <= 299) {
	            			defer.resolve(_fixDataDown(data));
	            		} else {
							defer.reject(helper.ParseError(data,"The data could not be created/updated in SAP."));
	            		}
	            	},
					error: function(data) {
						defer.reject(helper.ParseError(data,"The data could not be created/updated in SAP."));
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