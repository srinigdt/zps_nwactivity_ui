$.sap.declare("gdt.ui.ps.networkcomp.data.DataService_UserPrefs");
$.sap.require("gdt.ui.ps.networkcomp.util.SAPGatewayHelper");
$.sap.require("sap.ui.core.Core");
$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");

gdt.ui.ps.networkcomp.data.DataService_UserPrefs = (function($, core, _, helper) {
	var load = function(id) {
			return $.Deferred(function(defer) {
				var model = core.getModel();
				model.read("/UserPrefSet(UserID='" + id + "',CatagoryID='',Key='')", {
	            	success: function(data, response) {
	                	defer.resolve(data.results);
	            	},
					error: function(response) {
						if (!!response && !!response.response && !!response.response.statusCode && response.response.statusCode != 404) {
							defer.reject(helper.ParseError(response, "UI could not fetch the User Preferences from SAP."));
						} else {
							defer.resolve();
						}
					}
	            });
				/* global _:true */
				/* global gdt:true */
				$.sap.declare("gdt.ui.ps.networkcomp.data.DataService_UserPrefs");
				$.sap.require("gdt.ui.ps.networkcomp.util.SAPGatewayHelper");
				$.sap.require("sap.ui.core.Core");
				$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");

				gdt.ui.ps.networkcomp.data.DataService_UserPrefs = (function($, core, _, helper) {
					var load = function(id) {
							return $.Deferred(function(defer) {
								var model = core.getModel();
								model.read("/UserPrefSet(UserID='" + id + "',CatagoryID='',Key='')", {
					            	success: function(data, response) {
					                	defer.resolve(data.results);
					            	},
									error: function(response) {
										if (!!response && !!response.response && !!response.response.statusCode && response.response.statusCode != 404) {
											defer.reject(helper.ParseError(response, "UI could not fetch the User Preferences from SAP."));
										} else {
											defer.resolve();
										}
									}
					            });
							}).promise();		
						}; 
					
					return {
					    load: load
					};
					
				})($,sap.ui.getCore(),_, gdt.ui.ps.networkcomp.util.SAPGatewayHelper);		}).promise();		
		}; 
	
	return {
	    load: load,
	};
	
})($,sap.ui.getCore(),_, gdt.ui.ps.networkcomp.util.SAPGatewayHelper);