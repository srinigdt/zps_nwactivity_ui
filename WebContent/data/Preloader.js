/* global _:true */
/* global gdt:true */
$.sap.declare("gdt.ui.ps.networkcomp.data.Preloader");
$.sap.require("gdt.ui.ps.networkcomp.data.DataContext");
$.sap.require("sap.ui.core.Core");
$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");

gdt.ui.ps.networkcomp.data.Preloader = (function($, core, _, datacontext) {
	var init = function(model) {

		var	systemInfoDfr = $.Deferred(function(defer) {
				model.read("/SystemProfileSet()", {
	            	success: function(data) {
	                	var systemInfo = core.getModel('systemInfo');
	                	if (data.results.length > 0) {
	                		systemInfo.setData(data.results[0]);
	                		defer.resolve();
	                	} else {
							defer.reject();
	                	}
	            	},
					error: function() {
						defer.reject();
					}
	            });
			}),

			blankDetailLineDfr = $.Deferred(function(defer) {
				model.read("/ItemNwCompSet(Network='000000000000',Activity='0000',ItemNumber='0000')", {
	            	success: function(data) {
	                	var blankDetailLine = core.getModel('blankLineItem');
	                	blankDetailLine.setData(data);
	                	defer.resolve();
	            	},
					error: function() {
						defer.reject();
					}
	            });			
			}),
			
			blankDeliveryAddressLineDfr = $.Deferred(function(defer) {
				model.read("/DeliveryAddressSet(Customer='',Addrnumber='00000000')", {
	            	success: function(data, response) {
	            		core.getModel('blankAddressLine').setData(data);
	                	defer.resolve();
	            	},
					error: function(data, response) {
						defer.reject();
					}
	            });	
			}),
			
			manufacturersDfr = $.Deferred(function(defer) {
				model.read('/ManufacturerSet', {
					success: function(data) {
						var Manufacturers = core.getModel('Manufacturers'),
						    Vendors       = core.getModel('Vendors'),
							mfrs = null,
							vdrs = null;

						data.results.unshift({ManufacturerID: '', ManufacturerName: ''});
						mfrs = _.filter(_.reject(data.results, {ManufacturerName : 'Alt Payee'}),{Ktokk : 'MNFR'});
					//	vdrs = _.filter(_.reject(data.results, {ManufacturerName : 'Alt Payee'}),{Ktokk : 'YB01'});
						Manufacturers.setData(mfrs);
					//	Vendors.setData(vdrs);
						defer.resolve();
					},
					error: function() {
						defer.reject();
					}
				});
			}),
			
			UomDfr = $.Deferred(function(defer) {
				model.read("/UomSet?$filter=Msehi eq 'ALL'", {
	            	success: function(data) {
	                	var UomModel = core.getModel('Uom');
	                	UomModel.setData(data);
	                	defer.resolve();
	            	},
					error: function() {
						defer.reject();
					}
	            });			
			}),

			CountriesDfr = $.Deferred(function(defer) {
				model.read("/ValueTextsSet?$filter=Value eq 'Countries'", {
	            	success: function(data) {
	                	var model = core.getModel('Countries');
	                	model.setData(data.results);
	                	defer.resolve();
	            	},
					error: function() {
						defer.reject();
					}
	            });			
			}),
			
			MaterialTypeDfr = $.Deferred(function(defer) {
				model.read("/ValueTextsSet?$filter=Value eq 'MaterialType'", {
	            	success: function(data) {
	                	var model = core.getModel('MaterialType');
	                	model.setData(data.results);
	                	defer.resolve();
	            	},
					error: function() {
						defer.reject();
					}
	            });			
			}),
			
			MaterialGroupDfr = $.Deferred(function(defer) {
				model.read("/ValueTextsSet?$filter=Value eq 'MaterialGroup'", {
	            	success: function(data) {
	                	var model = core.getModel('MaterialGroup');
	                	model.setData(data.results);
	                	defer.resolve();
	            	},
					error: function() {
						defer.reject();
					}
	            });			
			}),
			
			languageDfr = $.Deferred(function(defer) {
				model.read("/ValueTextsSet?$filter=Value eq 'Languages'", {
	            	success: function(data) {
	                	var model = core.getModel('Languages');
	                	model.setData(data.results);
	                	defer.resolve();
	            	},
					error: function() {
						defer.reject();
					}
	            });			
			}),
			
			RegionsDfr = $.Deferred(function(defer) {
				model.read("/RegionsSet?$filter=Land1 eq 'ALL'", {
	            	success: function(data) {
	                	var model = core.getModel('Regions');
	                	model.setData(data.results);
	                	defer.resolve();
	            	},
					error: function() {
						defer.reject();
					}
	            });			
			});
			

		return $.when(systemInfoDfr,blankDetailLineDfr,manufacturersDfr).promise();
	};
	
	return {
		init: init
	};
})($,sap.ui.getCore(), _, gdt.ui.ps.networkcomp.data.DataContext);