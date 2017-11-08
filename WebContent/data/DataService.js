$.sap.declare("gdt.ui.ps.networkcomp.data.DataService");
$.sap.require("gdt.ui.ps.networkcomp.data.DataService_NetworkActivityHeader");
$.sap.require("gdt.ui.ps.networkcomp.data.DataService_NetworkActivityItems");
$.sap.require("gdt.ui.ps.networkcomp.data.DataService_Materials");
$.sap.require("gdt.ui.ps.networkcomp.data.DataService_SendMail");
$.sap.require("gdt.ui.ps.networkcomp.data.DataService_UserPrefs");
$.sap.require("gdt.ui.ps.networkcomp.data.DataService_CustomerInfo");
$.sap.require("gdt.ui.ps.networkcomp.data.DataService_DeliveryAddress");

gdt.ui.ps.networkcomp.data.DataService = (function(activityHeader, activityItems,materials,EmailNotification,userprefs,customerInfo,
		                                           deliveryAddress) {
	var dataservice = {
		activityHeader : activityHeader,
		activityItems : activityItems,
		materials:materials,
		EmailNotification:EmailNotification,
		userprefs:userprefs,
		customerInfo:customerInfo,
		deliveryAddress:deliveryAddress
		

	};

	return dataservice;
})(gdt.ui.ps.networkcomp.data.DataService_NetworkActivityHeader,
   gdt.ui.ps.networkcomp.data.DataService_NetworkActivityItems,
   gdt.ui.ps.networkcomp.data.DataService_Materials,
   gdt.ui.ps.networkcomp.data.DataService_SendMail,
   gdt.ui.ps.networkcomp.data.DataService_UserPrefs,
   gdt.ui.ps.networkcomp.data.DataService_CustomerInfo,
   gdt.ui.ps.networkcomp.data.DataService_DeliveryAddress);