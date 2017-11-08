$.sap.declare("gdt.ui.ps.networkcomp.data.DataLoader");
$.sap.require("gdt.ui.ps.networkcomp.data.DataContext");
$.sap.require("gdt.ui.ps.networkcomp.util.SAPGatewayHelper");
$.sap.require("sap.ui.core.Core");
$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");

gdt.ui.ps.networkcomp.data.DataLoader = (function($, core, _, datacontext, helper) {
	return true;
})($,sap.ui.getCore(), _ , gdt.ui.ps.networkcomp.data.DataContext, gdt.ui.ps.networkcomp.util.SAPGatewayHelper);
