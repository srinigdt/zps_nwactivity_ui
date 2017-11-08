/* global _:true */
/* global gdt:true */
$.sap.declare("gdt.ui.ps.networkcomp.data.DataService_NetworkActivityHeader");  
$.sap.require("gdt.ui.ps.networkcomp.util.SAPGatewayHelper");
$.sap.require("sap.ui.core.Core");
$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");

gdt.ui.ps.networkcomp.data.DataService_NetworkActivityHeader = (function($, core, _, helper) {
	var get = function(key) {
			return $.Deferred(function(defer) {
				var model = core.getModel();
	    		model.read("/HeaderNwCompSet(Network='" + key[0] + "',Activity='" + key[1] + "',ItemNumber=" + "'')?$expand=LineItems" , {
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
  	        if( (!!data.LineItems) && data.LineItems.results.length > 0){core.getModel('currentState').setProperty("/anyItems",true);}
  	        else{core.getModel('currentState').setProperty("/anyItems",false);}
  	        
  	        
  	      /* Take care of SAP Date to Timestamp, timezone issue */
  	      if (data.ReqDate){ data.ReqDate = new Date(data.ReqDate.getTime() + (data.ReqDate.getTimezoneOffset() * 60 * 1000));}
		  _.each(data.LineItems.results,function(line){
			  if (line.ReqDate){ line.ReqDate = new Date(line.ReqDate.getTime() + (line.ReqDate.getTimezoneOffset() * 60 * 1000));	}  
		  });
		//  data.DeliveryAddress = jQuery.extend(true, {}, core.getModel('blankAddressLine').getData());
  	      return data;
		},
		fixDataUp = function(data) {
			if (!data){ return data;}
          return data; 
		},
		
		getByForeignKey = function(key) {
			return $.Deferred(function(defer) {
				var model = core.getModel();
            	model.read("/HeaderNwCompSet(Network='" +  key[0] + ",Activity='" +  key[1] + ",ItemNumber=" + "''" +"')/LineItems", {
	            	success: function(data, response) {
	            		_.each(data.results, function (result) { result = _fixDataDown(result);});
	                	defer.resolve(data.results, response);
	            	},
					error: function(data) {
						defer.reject(helper.ParseError(data, "Data could not be fetched from SAP."));
					}
	            });
			}).promise();		
		},
		remove = function(key) {
			return $.Deferred(function(defer) {
				var model = core.getModel();
				if(key[2].length == 0){
	    		model.remove("/HeaderNwCompSet(Network='" + key[0] + ",Activity='" + key[1] + ",ItemNumber=" + "''" +"')", {
		            	success: function(data, response) {
		            		if (response.statusCode >= 200 && response.statusCode <= 299) {
		            			defer.resolve();
		            		} else {
		                		defer.reject(helper.ParseError(data,"The record could not be deleted from SAP."));
		            		}
		            	},
						error: function(data) {
							defer.reject(helper.ParseError(data,"The record could not be deleted from SAP."));
						}
		            });
				}else{
	    		model.callFunction("/DeleteItems",'POST', {Components:key[2],Network:key[0]},null,
		            	 function(data, response) { //success
		            		if (response.statusCode >= 200 && response.statusCode <= 299) {
		            			defer.resolve(data);
		            		} else {
		            			defer.reject(helper.ParseError(data,"The line items could not be deleted from SAP"));
		            		}
		            	},
					      function(data) { //error
							defer.reject(helper.ParseError(data,"The line items could not be deleted from SAP"));
						},
						true  // Async
		            );
				}
	    		
			}).promise();		
		},
		
		create = function(data) {
			return $.Deferred(function(defer) {
				var model = core.getModel();
				fixDataUp(data);
	    		model.create("/HeaderNwCompSet", data, {
		            	success: function(result_data, response) {
		            		if (response.statusCode >= 200 && response.statusCode <= 299) {
		            			defer.resolve(_fixDataDown(result_data));
		            		} else {
								defer.reject(helper.ParseError(result_data,"The data could not be created/updated in SAP."));
		            		}
		            	},
						error: function(error_data) {
							defer.reject(helper.ParseError(error_data,"The data could not be created/updated in SAP."));
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