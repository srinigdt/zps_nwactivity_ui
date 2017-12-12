/* global _:true */
/* global gdt:true */
/* global _toggleEdit:true */
jQuery.sap.declare("gdt.ui.ps.networkcomp.util.DragAndDropHelper");
$.sap.require("sap.ui.core.Core");
$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");
$.sap.require("sap.ui.core.format.DateFormat");
$.sap.require("gdt.ui.ps.networkcomp.data.DataContext");
$.sap.require("sap.ui.commons.Button");
$.sap.require("gdt.ui.ps.networkcomp.data.DataImporter");
$.sap.require("gdt.ui.ps.networkcomp.util.Formatter");
$.sap.require("gdt.ui.ps.networkcomp.util.TableDisplayHelper");

gdt.ui.ps.networkcomp.util.DragAndDropHelper = (function($, core, _,importer,datacontext,Button,formatter,tableHelper,view,vc){

var initialize = function(viewcontroller){
	if(viewcontroller){
    vc = viewcontroller;
	view = viewcontroller.getView( );}
	$(document).on( "paste", "td", _handlePaste);
  // 	$(document).on( "keydown", "td", _handleTableKeyDown);
   	$(document).on(
   		    "dragover",
   		    function(e) {
   		        e.preventDefault();
   		        e.stopPropagation();
   		    }
   		);
   	$(document).on(
   		    "dragenter",
   		    function(e) {
   		        e.preventDefault();
   		        e.stopPropagation();
   		    }
   		);
   	$(document).on("drop", "#"+view.byId("NwActivityHeaderItems").getId(), _handleDropFile);		   
	
	
},

_handlePaste=function(event){
	var e = event.originalEvent,
	data = (e.type === "paste") ? e.clipboardData.getData("text") : "",
	target = event.target,
	isMailCompose = core.getModel("currentState").getProperty("/isMailCompose"),
	tbl  = (!isMailCompose)?view.byId("lineItemsTable"):view.byId("PartIDsLineItemsTable"),
	rows = (!isMailCompose)?view.getModel("lineItems").getData():view.getModel("mailComposeLines").getData(),
	page = view.byId("NwActivityHeaderItems"),
	done = false,
	td   = null,
	tr   = null,
	body = null,
	startRow = tbl.getFirstVisibleRow(),
	lastRow = 0,
	numRows = (data) ? rows.length : 0,
	pasteRowNum = 0,
	pasteColNum = 0,
	tokens = [],
	tokencount = 0;
if(target.id.search("errorsTable") > 0){ return;}
if (numRows === 0){ return;}

page.setBusyIndicatorDelay(0);
page.setBusy(true);
//	sap.m.MessageToast.show("Data("+data+") is Pasted");
	
	setTimeout(function() {
		var lineItemsModel = (!isMailCompose)?view.getModel("lineItems"):view.getModel("mailComposeLines"),
			errors = [],
			detailsArray = _.map(lineItemsModel.getData(), _.clone);

		td = $(target).closest("td");

		if (td) {
			tr = $(td).closest("tr");
		}

		if (tr){
			pasteColNum =  _.findIndex(tr.children(), {id : $(td).attr("id")});
			body = tr.closest("tbody");
		}

		if (body) {
			lastRow = body.children().length - 1;
			pasteRowNum =  _.findIndex(body.children(), {id : $(tr).attr("id")});
		}

		if (core.getModel("currentState").getProperty("/isEditMode")) {
			tokens = _.without(data.split(/\r\n|\r|\n/g),"");    // split("\r");
			tokencount = tokens.length;

			tokens = _.map(tokens, function (token) {  // strip commas and $ or % signs
				if (token.replace(/[^0-9$.,]/g, "") === token) {
					return token.replace(/[^0-9.]/g, "");
				}

				return token;
			});

			for (var i = 0; i < (tokencount - (numRows - (startRow + pasteRowNum))); i++) {
				detailsArray.push(_createNewLine(detailsArray));
			}
			setTimeout(function () {
				var c = _.find(tbl.getColumns(), function (col) {
						var colid = col.getAggregation("template").getId(),
							trgid = target.getAttribute("id").substring(0, colid.length);

						return colid === trgid;
					}),
					mfr = null,
					t = (c) ? c.getTemplate() : null,
					bindingInfo = (t) ? t.getBindingInfo("value") : null,
					parts = (bindingInfo) ? bindingInfo.parts : null,
					firstPart = (parts && parts.length > 0) ? parts[0] : null,
					keys = [],          
					addressIDs = [],
					missingAddresses = [],	
					path = (firstPart) ? firstPart.path : null;

				if (path) {
					if(path === "Mfrpn") {
						_.each(tokens, function(token) {
							var key = {
									MaterialID : "",
									MfrPartID : ($.isNumeric(token)) ?  token.toUpperCase().trim().replace(/^0+/, "") : token.toUpperCase().trim()
								};

							if (key.MfrPartID.length === 9 && parseInt(key.MfrPartID).toString() === key.MfrPartID) { // GDT SAP Material ID
								key.MaterialID = key.MfrPartID;
								key.MfrPartID = "";
							}
							if(!!key.MaterialID || !!key.MfrPartID){ keys.push(key);}
						});
						keys = _.uniq(keys, function(key) { return key.MaterialID + key.MfrPartID; });
						keys = _.filter(keys, function(key) { return !datacontext.materials.getLocal(key);});
						if (keys.length > 0) {
							try {
								datacontext.materials.load(keys).done(function () {
									var result;
									_.each(detailsArray, function (r, i) {
										if ((i >= (startRow + pasteRowNum)) && ((i - (startRow + pasteRowNum)) < tokencount)) {
											result = _lookupPartID(detailsArray[i], tokens[i - (startRow + pasteRowNum)], true, (path === "Mfrpn"), null, null, true);
											if (Boolean(result)) {
												if (Boolean(result.Material)) {
													detailsArray[i] = result;
												} else {
													result.Mfrpn = tokens[i - (startRow + pasteRowNum)];
													result.LongMatlDesc="";
													if(errors.length === 0){result.ItemNumber = "1";}
													else{result.ItemNumber = (parseInt(errors[errors.length - 1].ItemNumber )+ 1).toString();}
													errors.push(result);
												}
											}
										}
									});
									if (errors.length === 0 && !isMailCompose) {
										lineItemsModel.setData(detailsArray);
										tableHelper.changeRowDisplay(view.getController());
									} else {
										errors = _.uniq(errors, function (error) {
											return error.Mfrpn;
										});
										if(!isMailCompose){
										_presentImportErrors(errors);
										}else{											
											lineItemsModel.setData(_.filter(detailsArray,function(line){ return (line.Material === "");}));
										}
									}
									page.setBusy(false);
								}).fail(function (msg) {
									sap.m.MessageToast.show(msg);
									page.setBusy(false);
								});
							} catch (e) {
								sap.m.MessageToast.show("Couldn't load the pasted part numbers.");
								page.setBusy(false);
							}
						} else {
							if(!isMailCompose){
							_.each(detailsArray, function (r, i) {
								if ((i >= (startRow + pasteRowNum)) && ((i - (startRow + pasteRowNum)) < tokencount)) {									
									detailsArray[i] = _lookupPartID(detailsArray[i], tokens[i - (startRow + pasteRowNum)], true, (path == "Mfrpn"), null, null, true);
								    if((!detailsArray[i].ItemNumber) && i > 0) { detailsArray[i].ItemNumber =  ( parseInt(detailsArray[i-1].ItemNumber) + 1 ).toString();}
								}
							});
							lineItemsModel.setData(detailsArray);
							tableHelper.changeRowDisplay(view.getController());
							}
							page.setBusy(false);
						}
					} else {
						if(!isMailCompose){
							_.each(rows, function (r, i) {
								if ((i >= (startRow + pasteRowNum)) && ((i - (startRow + pasteRowNum)) < tokencount)) {
								 detailsArray[i][path] = tokens[i - (startRow + pasteRowNum)];
								 }
							});
							lineItemsModel.setData(detailsArray);
							tableHelper.changeRowDisplay(view.getController());
						}
							page.setBusy(false);
						
					}
				}
			});
		}
	});
	event.preventDefault();
	event.stopPropagation();	
	
},

_handleTableKeyDown=function(event){	
	var target = event.target,
	tbl = view.byId("lineItemsTable"),
	data = core.getModel("lineItems").getData(),
	newtarget = null,
	parent = null,
	td = null,
	tr = null,
	body = null,
	value = null,
	startRow = tbl.getFirstVisibleRow(),
	lastRow = 0,
	numRows = (data) ? data.length : 0,
	voffset = 0,
	hoffset = 0,
	newrow = -1,
	newcol = -1,
	moved = false,
	row = 0,
	col = 0;

if (numRows === 0){ return;}

td = $(target).closest("td");

if (td) {
	tr = $(td).closest("tr");
}

if (tr){
	col =  _.findIndex(tr.children(), {id : $(td).attr("id")});
	body = tr.closest("tbody");
}

if (body) {
	lastRow = body.children().length - 1;
	row =  _.findIndex(body.children(), {id : $(tr).attr("id")});
}

if (event.ctrlKey && event.shiftKey && event.keyCode === 13) { // Ctrl-Shift-Down = copy to all rows
	$(target).blur();
	setTimeout(function() {
		var c = _.find(tbl.getColumns(), function (col) { 
				var colid = col.getAggregation("template").getId(),
					trgid = target.getAttribute("id").substring(0,colid.length);
			
				return colid === trgid;
			}),
			t = (c) ? c.getTemplate() : null,
			bindingInfo = (t) ? t.getBindingInfo("value") :  null,
			parts = (bindingInfo) ? bindingInfo.parts : null,
			firstPart = (parts && parts.length > 0) ? parts[0] : null,
			path = (firstPart) ? firstPart.path : null,
			lineItemModel = view.getModel("lineItems");
		
		if (path && path !== "ItemNumber") {
            _.each(data, function (r, i) {
                if ((core.getModel("currentState").getProperty("/isEditMode")) && !lineItemModel.getProperty("/" + (i) + "/WBSElement") && !lineItemModel.getProperty("/" + (i) + "/MarkedAsDeleted") && !lineItemModel.getProperty("/" + (i) + "/DeletedFlag")) {
                    lineItemModel.setProperty("/" + (i) + "/" + path, data[row + startRow][path]);
                }
            });
            view.getModel("lineItems").setData(data);
        }
    });
	event.preventDefault();
	event.stopPropagation();
	return;
} 

if (event.shiftKey) {
	if (event.keyCode === 9) {
		hoffset = -1;
	}
} else {
	if (event.keyCode === 9) {
		hoffset = 1;
	}
}
if (event.keyCode === 40){ voffset = 1;}
if (event.keyCode === 38){ voffset = -1;}

newrow = row + voffset;
newcol = col + hoffset;

if (newrow === row && newcol === col){ return;} // not one of our interesting key presses

$(target).blur();

setTimeout(function() {
	var c = _.find(tbl.getColumns(), function (col) { return col.getAggregation("template").getId() === target.getAttribute("id").substring(0,target.getAttribute("id").indexOf("-"));}),
		t = (c) ? c.getTemplate() : null,
		bindingInfo = (t) ? t.getBindingInfo("value") :  null,
		parts = (bindingInfo) ? bindingInfo.parts : null,
		firstPart = (parts && parts.length > 0) ? parts[0] : null,
		path = (firstPart) ? firstPart.path : null,
		lineItemModel = view.getModel("lineItems");

		if (event.shiftKey) {
			if (event.keyCode !== 9) {
				value = lineItemModel.getProperty("/"+(startRow + row)+"/"+path);
			}
		}
	if (path && path !== "ItemNumber") {
    	if (value && (core.getModel("currentState").getProperty("/isEditMode")) && !lineItemModel.getProperty("/"+(startRow + newrow) + "/Deletion") && !lineItemModel.getProperty("/"+(startRow + newrow) + "/Db")){
    	lineItemModel.setProperty("/"+(startRow + newrow)+"/"+path,value);	
    	} 
	}
	
	if ((newrow > lastRow) && (startRow + lastRow < numRows - 1)) {
		newrow--;
		row--;
		tbl.setFirstVisibleRow(startRow+1);
	}
	
	if ((newrow < 0) && (startRow > 0)) {
		newrow++;
		row++;
		tbl.setFirstVisibleRow(startRow-1);
	}
	
	setTimeout(function() {
    	
		if ((voffset && newrow >= 0 && newrow < body.children().length) || 
    			(hoffset && newcol >= 0 && newcol < $(body.find("tr")[newrow]).children().length)) {
    		newtarget = $($(body.find("tr")[newrow]).find("td")[newcol]).find("input");
    		event.preventDefault();
    		event.stopPropagation();
    	}
    	
		if (newtarget) {
    		setTimeout(function() {
			
    			if(!$(newtarget).visible(true, false, "both")){ $(".sapUiTableCtrlScr").scrollTo($(newtarget));}
    			$(newtarget).focus();

    		});
		}
	});
},10);	
},

_handleDropFile=function(event){
 
 var viewController = view.getController( );
	// instantiate dialog
	if (!viewController._lineImportDialog) {
		viewController._lineImportDialog = sap.ui.xmlfragment("gdt.ui.ps.networkcomp.fragment.Details_LineImportConfirmDialog", viewController);
		view.addDependent(viewController._lineImportDialog);
	}
	
    var dialog = viewController._lineImportDialog;
	var files = event.originalEvent.dataTransfer.files;
	

event.stopPropagation();
event.preventDefault();


if (view.byId("iconTabBar").getSelectedKey() !== "activityItemTab"){ return;}
// Below lines are conditionally eliminating pop up
if( 1 === 2){
if (!_isEmpty()) {
	dialog.removeAllButtons();

	dialog.addStyleClass("sapUiSizeCompact");
	dialog.addButton(new Button({text: "Append", press:function(){
		dialog.close();
		_doImportFile(files, true);
	}}));
	dialog.addButton(new Button({text: "Replace", press:function(){
		dialog.close();
		_doImportFile(files);
	}}));
	dialog.addButton(new Button({text: "Cancel", press:function(){
		dialog.close();
	}}));

	dialog.open();
} else {
	_doImportFile(files);
}
}
_doImportFile(files,true); // Defualt all lines to be appended


},

_isEmpty = function() {
	var details = view.getModel("lineItems").getData();
	
	if (!details || details.length === 0){ return true;}
	if (details.length > 1){ return false;}
	if (!details[0].Mfrpn) {return true;}	
	return false;
},


_doImportFile = function(files, append) {
	var busyDlg = view.getController()._dialog;
	// instantiate dialog
	if (!busyDlg) {
		busyDlg = view.getController()._dialog = sap.ui.xmlfragment("gdt.ui.ps.networkcomp.fragment.BusyDialog", view.getController());
		view.addDependent(busyDlg);
	}	
	
	var reader = new FileReader();

    reader.onload = (function(file) {
        return function(e) {
        	var errors = [],
				missingAddresses = [];
        	
            if (e.target.readyState === FileReader.DONE) { // DONE == 2
            	var vch = view.getController( ).DetailControllerHelper;
            	if (!view.getModel("currentState").getProperty("/isEditMode")){ vch.toggleEdit(true);}
                importer.ImportFromCsvFile(e.target.result, view.getModel("currentData"),
                				view.getModel("lineItems"), errors, missingAddresses,
                				_createNewLine,_lookupPartID, append)
                    .done(function(){sap.m.MessageToast.show("Successfully imported File");})
					.fail(function (msg) {
						sap.m.MessageBox.show(msg, {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Import Error",
							actions: sap.m.MessageBox.Action.OK
						});
					})
                	.always(function () {
						busyDlg.close();
						tableHelper.changeRowDisplay(view.getController());
                		if (errors && errors.length !== 0) {
                			_presentImportErrors(errors);
                		} else {
							if (missingAddresses && missingAddresses.length !== 0) {
							//	_presentAddressErrors(missingAddresses);
							} else {
	//
							}
						}
					});
            }
        };
      })(files[0]);
    
    reader.onerror = (function() {
		busyDlg.close();
    })();

	busyDlg.setText("Attempting to import file.");
	busyDlg.open();
	
	setTimeout(function () {
		try {
			reader.readAsText(files[0]);
		}
		catch(err) {
			busyDlg.close();
		}
    });
},


_createNewLine = function(detailsArray) {
	var currentDataModel   = view.getModel("currentData"), 
	    currentData   = view.getModel("currentData").getData( ),
		NetworkId  = currentDataModel.getProperty("/Network"),
		ActivityId = currentDataModel.getProperty("/Activity"),
		CustomerId = currentDataModel.getProperty("/Customer"),
		DeliveryDate = currentDataModel.getProperty("/ReqDate"),
		newLine = jQuery.extend(true, {}, core.getModel("blankLineItem").getData()),
		userid = core.getModel("systemInfo").getProperty("/Uname"),
		today = new Date(Date.now()),
		maxLine,
		maxCompLine,
		lines = (detailsArray)?detailsArray:view.getModel("lineItems").getData(),
		lineNum = 0,MaxCompId = 0;
	
    if(lines.length > 0){ maxLine = _.max(lines,function(line){return line.ItemNumber;});}
    if(lines.length > 0){ maxCompLine = _.max(lines,function(line){return line.Component;});}
    lineNum = (maxLine)?_pad(parseInt(maxLine.ItemNumber) + 10,4):_pad(lineNum + 10,4);
    MaxCompId = (maxLine)?_pad(parseInt(maxCompLine.Component) + 1,15):_pad(MaxCompId + 1,15);
	newLine.ItemNumber = lineNum.toString( );
	newLine.Component = MaxCompId.toString( );
	newLine.Procind = "PFS";
	newLine.EntryQuantity = "1";
	if(currentData.IsAddressCopiedToItem){
		newLine.IsAddrCopyFromHeader= true;
		newLine.IsAddrCopyFromItem  = false;
		newLine.CopiedAddrComponent = "000000000000000"; // "000000000000000" as header Notation
		newLine.Customer            = currentData.DeliveryAddress.Customer;
		newLine.AddrNo              = currentData.AddrNo;
		newLine.AddrNo2             = currentData.AddrNo2;
		newLine.DeliveryAddress     = currentData.DeliveryAddress;
		newLine.DeliveryAddressFlag = currentData.DeliveryAddressFlag;}
	else{
		newLine.Customer            = currentData.Customer;	
	}	
	
	
	if(DeliveryDate){newLine.ReqDate = new Date(DeliveryDate);}
	core.getModel("currentState").setProperty("/itemNumber",newLine.ItemNumber);
	return newLine;
},

_presentImportErrors = function(errors) {

	var vc = view.getController( );  
	if (!vc._errorImportDilaog) {
		vc._errorImportDilaog = sap.ui.xmlfragment("gdt.ui.ps.networkcomp.fragment.Details_LineItemsImportErrorsDialog",view.getController( ));
		view.addDependent(vc._errorImportDilaog);
	}	

	vc._errorImportDilaog.addStyleClass("sapUiSizeCompact");

	view.setModel(new sap.ui.model.json.JSONModel(_.uniq(errors, function (error) {
		return error.Mfrpn;
	})),"importErrors");

	vc._errorImportDilaog.open();
},


_lookupPartID = function(row, manufacturerPartID, override, Mfrpn, success, fail, localOnly) {		

	var key = {												
				MaterialID : "",
				MfrPartID : (Boolean(manufacturerPartID)) ? (($.isNumeric(manufacturerPartID)) ?  manufacturerPartID.toUpperCase().trim().replace(/^0+/, "") : manufacturerPartID.toUpperCase().trim()) : ""
		},
		def = null,
		localVal = null,
		successFn = function (data, success, deferred) {
			var materialId = (Boolean(data.Materialid)) ? data.Materialid.replace(/^0+/, "") : null,
				vdrMatch = null,
				mfr = null,
				mfrs = core.getModel("Manufacturers").getData() || [],
				vdrs = core.getModel("Vendors").getData() || [],
				dlvdate = core.getModel("currentData").getProperty("/ReqDate"),
				qty = parseFloat(row.EntryQuantity);

			if (materialId && materialId !== "") {

				if (Mfrpn) {
					//row.ItemNumber    = ( parseInt(row.ItemNumber) + 1 ).toString();
					row.Material      = materialId;
					row.Mfrpn         = (!row.Mfrpn)?data.Manufacturerpartid:row.Mfrpn;
					row.MatlDesc      = (override) ? data.Description : (row.MatlDesc) ? row.MatlDesc : data.Description;
					row.BaseUom       =  data.Materialunit;
					row.Broughtin     = (row.Broughtin.toString().toUpperCase() === "YES")?true:false;
					row.Procind       = (data.ProcurementInd)?"WE":(row.Broughtin)?"PEV":"PFS";
					row.IsEnvRlvt     =  data.ProcurementInd;
					row.Manufacturerno = data.Manufacturerno;
					row.MatlType      =  data.Materialtype;
					row.MatlTypeText  =  data.MatlTypeText;
					row.MatlGroup     =  data.Materialgroup;
					row.MatlGroupText =  data.MatlGroupText;
					if(dlvdate){row.ReqDate = new Date(dlvdate);}
					row.Db            = false;
					if(override){				
					row.ItemText      = "";
					row.ItemLongText  = "";					
					row.StgeLoc       = "";
					row.PurGroup      = "";
					row.PurchOrg      = "";
					}
			} else
				if (!Mfrpn) {
					row.Material = null;
				
			}}
			if (Boolean(success)) {success(row);}
			if (Boolean(deferred)){ deferred.resolve(row);}
			return row;
			
		},
		failFn = function (data, fail, deferred) {
			var response = null,
				message = "",
				error = {},
				errordetails = [],
				msg = "UI could not fetch the material details for " + manufacturerPartID + " from SAP.";

			if (data && data.response && data.response.body) {
				response = $.parseJSON(data.response.body);
			}

			if (response && response.error) {
				error = response.error;
				if (error.innererror && error.innererror.errordetails && error.innererror.errordetails.length > 0) {
					errordetails = error.innererror.errordetails;
					for (var i = 0, len = errordetails.length; i < len; i++) {
						if (errordetails[i].message && errordetails[i].message.length > 0) {
							if (message.length !== 0){ message += "\n";}
							message += errordetails[i].message;
						}
					}
					msg = message;
				} else {
					if (response.error.message && response.error.message.value) {
						msg = response.error.message.value;
					}
				}
			}

			if (Boolean(fail)){ fail(row);}

			if (Boolean(deferred) ){
				deferred.resolve(row); // Do not reject promise...otherwise all other updates will fail.
				sap.m.MessageToast.show(msg);
			}

			return row;
		};

	if (key.MfrPartID.length === 0) {
		if (!localOnly) {
			return $.Deferred(function (defer) {
				defer.resolve(row);
			});
		}
		return null;
	}

	if (key.MfrPartID.length === 9 && parseInt(key.MfrPartID).toString() === key.MfrPartID) { // GDT SAP Material ID
		key.MaterialID = key.MfrPartID;
		key.MfrPartID = "";
	}

	if (!localOnly) {
		def = $.Deferred(function (deferred) {
			datacontext.materials.get(key)
				.done(function(data) {
					successFn(data, success, deferred);
				}).fail(function(data) {
					failFn(data, fail, deferred);
				});
		});
		return def.promise();
	}

	localVal = datacontext.materials.getLocal(key);

	if (Boolean(localVal)) {
		return successFn(localVal);
	}

	return failFn("Material " + key.MfrPartID + " not found");

},

_pad = function (n, width, z) {
      	  var 	paddingChar = z || '0',
      	  		stringToPad = n + '';
      	  return stringToPad.length >= width ? stringToPad : new Array(width - stringToPad.length + 1).join(paddingChar) + stringToPad;
		};

	return {
		initialize:initialize,
		createNewLine:_createNewLine,
		lookupPartID:_lookupPartID,
		pad:_pad
	};

		
		
		
	})($, sap.ui.getCore(), _,gdt.ui.ps.networkcomp.data.DataImporter, gdt.ui.ps.networkcomp.data.DataContext,sap.ui.commons.Button,gdt.ui.ps.networkcomp.util.Formatter,gdt.ui.ps.networkcomp.util.TableDisplayHelper);