/* global _:true */
/* global gdt:true */
jQuery.sap.declare("gdt.ui.ps.networkcomp.util.ExportFileHelper");
$.sap.require("sap.ui.core.Core");
$.sap.require("sap.ui.core.util.Export");
$.sap.require("sap.ui.core.util.ExportTypeCSV");
$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");


gdt.ui.ps.networkcomp.util.ExportFileHelper = (function($, core, _,view){

var	exportErrorPartIDs = function(event,viewController){
	if(!view){view = viewController.getView( );}
	var model = (event.getSource().getId( ).search("mailComposeExport") < 0 )?"importErrors":"mailComposeLines";
	var	Export = new sap.ui.core.util.Export({
		exportType: new sap.ui.core.util.ExportTypeCSV({charset : "utf-16"}),
		models: view.getModel(model),
		rows : { path : "/"},
		columns : [
					{name: "No#", template : { content : {path: "ItemNumber"}}},
					{name: "MPN", template : { content : {path: "Mfrpn"}}},
					{name: "SAP Number", template : { content : {path: "Material"}}},
					{name: "Short Description", template : { content : {path: "MatlDesc"}}},
					{name: "UOM", template : { content : {path: "BaseUom"}}},
					{name: "Long Description", template : { content : {path: "LongMatlDesc"}}},
					{name: "Manufacturer Name", template : { content : {path: "Manufacturerno"}}},
					{name: "Material Type", template : { content : {path: "MatlType"}}},
					{name: "Material Group", template : { content : {path: "MatlGroup"}}}
		]});					
	Export.saveFile(core.getModel("currentData").getProperty("/Network")+"_ImportError PartIDs").always(function() {
		this.destroy();
	});			
	
     };


return {
	exportErrorPartIDs:exportErrorPartIDs
};
	
	
})($, sap.ui.getCore(), _);