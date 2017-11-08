/* global _:true */
/* global gdt:true */
$.sap.declare("gdt.ui.ps.networkcomp.data.DataService_SendMail");
$.sap.require("gdt.ui.ps.networkcomp.util.SAPGatewayHelper");
$.sap.require("sap.ui.core.Core");
$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");

gdt.ui.ps.networkcomp.data.DataService_SendMail = (function($, core, _, helper) {
	var send = function(MailBodyContent) {
			return $.Deferred(function(defer) {
         		var model = core.getModel();
	    		model.callFunction("/SendMail","POST", {ActionType:"M",MailContent:MailBodyContent},null,
	            	 function(data, response) { //success
	            		if (response.statusCode >= 200 && response.statusCode <= 299) {
	            			defer.resolve(data);
	            		} else {
	            			defer.reject(helper.ParseError(data,"UI fail to Send mail to MasterData Maintenance Team."));
	            		}
	            	},
				      function(data) { //error
						defer.reject(helper.ParseError(data,"UI fail to send mail to MasterData Maintenance Team."));
					},
					true  // Async
	            );
			}).promise();		
		};

		
	return {
		send: send
	};
	
})($,sap.ui.getCore(),_, gdt.ui.ps.networkcomp.util.SAPGatewayHelper);