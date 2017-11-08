/* global _:true */
/* global gdt:true */

$.sap.declare("gdt.ui.ps.networkcomp.data.DataService_CustomerInfo");
$.sap.require("gdt.ui.ps.networkcomp.util.SAPGatewayHelper");
$.sap.require("sap.ui.core.Core");
$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");

gdt.ui.ps.networkcomp.data.DataService_CustomerInfo = (function($, core, _, helper) {
	var get = function(key) {
			return $.Deferred(function(defer) {
				var model = core.getModel();
				model.read("/CustomerInfoSet(CustomerNo='" + key + "')", {
					success: function(data) {
						defer.resolve(data);
					},
					error: function(response) {
						defer.reject(helper.ParseError(response, "The application could not fetch the Customer details from SAP."));
					}
				});
			}).promise();   
		},
		load = function(keys) {
			return $.Deferred(function(defer) {
				var model = core.getModel(),
					batchOperations = [];

				if (!keys || keys.length == 0) {
					defer.resolve([]);
				} else {
					_.each(keys, function (key) {
						batchOperations.push(model.createBatchOperation(
							"/CustomerInfoSet(CustomerNo='" + key + "')", 'GET'));
					});
					model.addBatchReadOperations(batchOperations);
					model.submitBatch(function (data) {
						var results = [];
						_.each(data.__batchResponses, function (response) {
							results.push((Boolean(response.data)) ? response.data : null);
						});
						defer.resolve(results);
					}, function (response) {
						defer.reject(helper.ParseError(response, "The application could not fetch Customer details from SAP."));
					});
				}
			}).promise();
		};

	return {
	    get: get,
		load: load
	};
	
})($,sap.ui.getCore(),_, gdt.ui.ps.networkcomp.util.SAPGatewayHelper);