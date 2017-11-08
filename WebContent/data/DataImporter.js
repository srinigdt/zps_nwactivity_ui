/* global _:true */
/* global gdt:true */
/* global Papa:true */
$.sap.declare("gdt.ui.ps.networkcomp.data.DataImporter");
$.sap.require("sap.ui.core.Core");
$.sap.require("gdt.ui.ps.networkcomp.data.DataContext");
$.sap.require("gdt.ui.ps.networkcomp.util.Formatter");
$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");
$.sap.require("gdt.ui.ps.networkcomp.lib.papaparse-min");

gdt.ui.ps.networkcomp.data.DataImporter = (function($, core, _, Papa, datacontext, formatter) {
	var Defaults = [],
        templateName = "",
		CiscoMfrID = null,
		CiscoVdrID = null,
		IngramVdrID = null,
		TechDataVdrID = null,
		HeaderFields = [{label : "Network #" , field : "Network", lineItem :  true},
//	MG Don"t use Deal Expiration as Quote Expiration {label : "Deal Expiration:", field : "ValidTo", converter : function (val) {return new Date(Date.parse(val));}},
// MG Don"t import Qoute Name into Description field {label : "Quote Name:", field : "HeaderText"},
			{label : "Activity #", field : "Activity", lineItem : true},
			{label : "Delivery Date", field : "ReqDate", lineItem : true ,converter : function (val) {return new Date(val);} },
			{label : "Customer Ship-to # ", field : "Customer", lineItem : true},
			{label : "Delivery Notes", field : "DeliveryText", lineItem : false}
		
		
		],
		DetailLineTemplateNames = ["Material Import"],				
		DetailLineTemplates = [
				[ // Material Component Import
/*					{column : "Network #",     field : "Network", optional : true},
					{column : "Activity #",    field : "Activity",   optional : true},*/
					{column : "Item #",        field : "ItemNumber", optional : true},
					{column : "Qty",           field : "EntryQuantity", converter : function (val) {var amt = val.replace(/,/g, ""); return parseInt(amt).toString();}},
					{column : "Manfucturer Part #", field : "Mfrpn" },
				//	{column : "Material",      field : "Material",   optional : true},
					{column : "Description",   field : "MatlDesc",   converter : function (val) {return val.substring(0, 40);}},
				//	{column : "UOM.",          field : "BaseUom", optional : true},
					{column : "Brought In",    field : "Broughtin"},
				//	{column : "Procurement",   field : "Procind", optional : true},
				//	{column : "Item Cat.",     field : "ItemCat", optional : true},
					{column : "Notes",         field : "ItemText", optional : true}
				//	{column : "Long Notes",    field : "ItemlongText", optional : true},
				//	{column : "Procurement",   field : "Procind", optional : true},
				//	{column : "Storage Loc",   field : "StgeLoc", optional : true},
				//	{column : "Delivery Days", field : "DeliveryDays", optional : true},
				//	{column : "Purchas. Grp",  field : "PurGroup", optional : true},
				//	{column : "Purchas. Org.", field : "PurchOrg", optional : true},
				//	{column : "Address#",      field : "AddressNum", optional : true},
				//	{column : "Customer",      field : "Customer", optional : true},		
				//	

		]],

	ImportFromCsvFile = function(csv, currentData, lineItems, errors, missingAddresses, _createNewLine, _lookupPartID, append) {
			var def = null,
				header = true,
				template = null,
				headerField = null,
				headerValue = null,
				fieldCount = 0,
				optionalCount = 0,
				nextLineNum = 10,
				parsed = Papa.parse(csv),
				line = [],
				newline = {},
				templates = [],
				lineItemsArray = (append) ? lineItems.getData() : [],

				i = 0,
				j = 0,
				k = 0,
				l = 0,
				l2 = 0,
				l3 = Defaults.length;
				this.append = append;

        	def = $.Deferred(function(defer) {
				var searchAddress = "",
                    parentNode,
                    childNode,
					newRows = [],
					keys = [];


				if (!missingAddresses){ missingAddresses = [];}
				if (!errors){ errors = [];}
                lineItemsArray = _.filter(lineItemsArray, function(line) {
                    return (!!line.Material);
                });


				if (parsed && parsed.data && parsed.data.length) {
					l = parsed.data.length;
				}

				for (i = 0; i < l; i++) {
					line = parsed.data[i];
					if (line.length) {
						if (header) {
							templates = [];
							for (j = 0; j < DetailLineTemplates.length; j++) {
								templates.push(DetailLineTemplates[j].length);
							}
						}

						l2 = line.length;
						if (header) {
							for (j = 0; j < l2; j++) {
								var fieldMatched = false;
								for (k = 0; k < DetailLineTemplates.length; k++) {
									column = _.find(DetailLineTemplates[k], function (val) {
										return val.column.toLowerCase().replace(/ /g, "") === line[j].replace(/ /g, "").replace(/\n/g, "").replace(/\r/g, "").toLowerCase();
									});
									if (column && templates[k] > 0) {
										console.log("Template "+DetailLineTemplateNames[k]+" field "+column.field + " matched");
										fieldMatched = true;
										column.position = j;
										templates[k]--;
									}
									if (templates[k] === 0) {
										header = false;
										template = DetailLineTemplates[k];
                                        templateName = DetailLineTemplateNames[k];
										console.log("Template "+DetailLineTemplateNames[k]+" selected.");
									}
									if (!header){ break;}
								}
								if (line[j] && !fieldMatched){ console.log("Possible column header "+ line[j] + " not found in any template - ignored.");}
								headerField = _.find(HeaderFields, function (val) {
									return val.label === line[j];
								});
								if (headerField) {
									if (j < l2 + 1){ headerValue = line[j + 1];}
									if (!headerValue && j < l2 + 2) {headerValue = line[j + 2];}
									if (headerValue && headerValue !== "NA") {
										if (headerField.converter) {
											headerValue = headerField.converter(headerValue);
										}
if(( headerField.field==="Network" && _pad(headerValue.replace(/\s/g,""),12) !== _pad(core.getModel("inputData").getProperty("/Network").replace(/\s/g,""),12)) || 
( headerField.field==="Activity" && _pad(headerValue.replace(/\s/g,""),4) !== _pad(core.getModel("inputData").getProperty("/Activity").replace(/\s/g,""),4)) ){
	defer.reject("The selected Network/Activity IDs does not match with Network/Activity in import Template. Please check and try again");
	return ;
}

if( headerField.field==="Customer"){
	 var model = core.getModel();
	 model.callFunction("/checkExistance","GET", {Value1:headerValue,Value2:"",Variables:"Customer"},null,
    	 function(data, response) { //success
    		if (response.statusCode >= 200 && response.statusCode <= 299 && !data.checkExistance.Error) {
    			core.getModel("currentState").setProperty("/anyErrors",false);			
    		} else {
    			defer.reject("Invalid Customer imported.Please check");
    			core.getModel("currentState").setProperty("/anyErrors",true);
    		}
    	},
	      function(data) { //error
    		defer.reject("Invalid Customer imported.Please check");
    		core.getModel("currentState").setProperty("/anyErrors",true);
    	},
		false  // Async true
    );
}

										
										if (!headerField.lineItem) {
											if (!currentData.getProperty("/" + headerField.field)) {
												currentData.setProperty("/" + headerField.field, headerValue);
											}
										} else {
											Defaults.push({field: headerField.field, value: headerValue});
											l3 = Defaults.length;
											
											if((headerField.field === "ReqDate" || headerField.field === "Customer" ) && (!!headerValue)){
												currentData.setProperty("/" + headerField.field, headerValue);	
											}
											
										}
										headerField = null;
										headerValue = null;
									}
								}
							}
						} else {
							newline = _createNewLine((newRows.length === 0) ? lineItemsArray : newRows);

							
							for (k = 0; k < l3; k++) {
								newline[Defaults[k].field] = Defaults[k].value;
							}

							fieldCount = template.length;
							optionalCount = _.where(template, {optional : true}).length;
							for (j = 0; j < l2; j++) {
								var column = _.find(template, function (val) {
									return val.position === j;
								});
								if (column && line[j]) {
									fieldCount--;
									if (column.converter) {
										newline[column.field] = column.converter(line[j]);
									} else {
										if (Boolean(column.lookup)) {
											switch (line[j].toUpperCase().replace(/ /g, "")) {
												case "FIELD1" :
													newline[column.field] = "";
													break;
												case "FIELD2" :
													newline[column.field] = "";
													break;
												case "FIELD3" :
													newline[column.field] = "";
													break;
											}

										} else { // Transform input if necessary for Field Type.
											switch (column.field) {
												case "ItemNumber" :					
													break;
												case "field2" :
													break;
												case "field3" :							
													break;
												default :
													newline[column.field] = line[j];
													break;
											}
										}
									}
									column = null;
								}
								if (fieldCount === 0) {break;}
							}
							if (fieldCount <= optionalCount  && !newline.Material) {
								nextLineNum += 10;
				
								newRows.push(newline);
							}
						}
					}
				}

                // All lines parsed...now process import
                if (!template) {
                    defer.reject("Import file did not match any known template.  File ignored.");
                } else {
                    if (newRows.length == 0){
                        defer.reject("No recognisable parts were found in Import file.  File ignored.");
                    } else {
                        _.each(newRows, function (row) {
                            var address = "",
                                addressMatch,
                                key = {
                                    MaterialID: "",
                                    MfrPartID: ($.isNumeric(row.Mfrpn)) ?  row.Mfrpn.toUpperCase().trim().replace(/^0+/, "") : row.Mfrpn.toUpperCase().trim()
                                };

                            keys.push(key);
                        });

                        keys = _.uniq(keys, function (key) {
                            return key.MaterialID + key.MfrPartID;
                        });
                        keys = _.filter(keys, function (key) {
                            return !datacontext.materials.getLocal(key);
                        });

                        datacontext.materials.load(keys).done(function (data) {
							var duration;
                            _.each(newRows, function(newline, idx) {
                                _lookupPartID(newline, newline.Mfrpn, false, true, null, null, true);
						

								if (newline.Material) {
									newRows[idx] = newline;
								} else {
									// adding below attributes(Fields) to get them available in export CSV File and Email Master
									newline.LongMatlDesc="";
									newline.MatlType="ROH";
									if(errors.length === 0){newline.ItemNumber = "1";}
									else{newline.ItemNumber = (parseInt(errors[errors.length - 1].ItemNumber )+ 1).toString();}
									errors.push(newline);
								}
                            });
                            Array.prototype.push.apply(lineItemsArray, newRows);
                            
                            if ((!errors || errors.length === 0) && (!missingAddresses || missingAddresses.length === 0)) {
								if (lineItemsArray.length > 100) {
									lineItems.setSizeLimit(lineItemsArray.length + 100);
								}
                                lineItems.setData(lineItemsArray);
                            }
                            defer.resolve();
                        }).fail(function (msg) {
                            defer.reject(msg);
                        });
                    }
                }

			});
        	
        	return def.promise();
		},

        _pad = function (n, width, z) {
      	  var 	paddingChar = z || "0",
      	  		stringToPad = n + "";
      	  return stringToPad.length >= width ? stringToPad : new Array(width - stringToPad.length + 1).join(paddingChar) + stringToPad;
		};
		
	return {
		ImportFromCsvFile: ImportFromCsvFile
	};
})($,sap.ui.getCore(),_, Papa, gdt.ui.ps.networkcomp.data.DataContext,gdt.ui.ps.networkcomp.util.Formatter);