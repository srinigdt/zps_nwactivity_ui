/* global _:true */
/* global gdt:true */
jQuery.sap.declare("gdt.ui.ps.networkcomp.controllers.DetailControllerHelper");

$.sap.require("sap.ui.core.Core");
$.sap.require("sap.ui.model.json.JSONModel");
$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");
$.sap.require("sap.ui.core.format.DateFormat");
$.sap.require("gdt.ui.ps.networkcomp.data.DataContext");
$.sap.require("gdt.ui.ps.networkcomp.data.DataLoader");
$.sap.require("gdt.ui.ps.networkcomp.util.ValueHelper");
$.sap.require("gdt.ui.ps.networkcomp.util.DragAndDropHelper");
$.sap.require("gdt.ui.ps.networkcomp.util.ClipboardHelper");
$.sap.require("gdt.ui.ps.networkcomp.util.EmailHelper");
$.sap.require("gdt.ui.ps.networkcomp.util.TableDisplayHelper");
$.sap.require("gdt.ui.ps.networkcomp.util.ExportFileHelper");



gdt.ui.ps.networkcomp.controllers.DetailControllerHelper = (function($, core, _, datacontext,dataloader,copies,valueHelper,dragAndDropHelper,clipboardHelper,emailHelper,tableDisplayHelper,ExportFileHelper,view) {
	
var	_getDilaog = function(view){
	var busyDlg = view.getController()._dialog;
	// instantiate dialog
	if (!busyDlg) {
		busyDlg = view.getController()._dialog = sap.ui.xmlfragment("gdt.ui.ps.networkcomp.fragment.BusyDialog", view.getController());
		view.addDependent(busyDlg);
	}
	return busyDlg;
	},
	
	_getDeliveryAddressPopup=function(view){
		var dialog = view.getController()._deliveryAddress;
		// instantiate dialog
		if (!dialog) {
			dialog = view.getController()._deliveryAddress = sap.ui.xmlfragment("gdt.ui.ps.networkcomp.fragment.Details_LineItemDeliveryAddress", view.getController());
			view.addDependent(dialog);
		}
		return dialog;				
	},

	_getHeaderDeliveryAddressPopup=function(view){
		var dialog = view.getController()._deliveryAddressH;
		// instantiate dialog
		if (!dialog) {
			dialog = view.getController()._deliveryAddressH = sap.ui.xmlfragment("gdt.ui.ps.networkcomp.fragment.Details_HeaderDeliveryAddress", view.getController());
			view.addDependent(dialog);
		}
		return dialog;				
	},	
	
	_getCustomerSearchPopup=function(view){
		var dialog = view.getController()._customerSearchDialog;
		// instantiate dialog
		if (!dialog) {
			dialog = view.getController()._customerSearchDialog = sap.ui.xmlfragment("gdt.ui.ps.networkcomp.fragment.CustomerSearchDialog", view.getController());
			view.addDependent(dialog);
		}
		return dialog;				
	},

	_getAddressSearchPopup=function(view){
		var dialog = view.getController()._addressSearchDialog;
		// instantiate dialog
		if (!dialog) {
			dialog = view.getController()._addressSearchDialog = sap.ui.xmlfragment("gdt.ui.ps.networkcomp.fragment.AddressSearchDialog", view.getController());
			view.addDependent(dialog);
		}
		return dialog;				
	},
	
	_TaxjurisdictionPopup=function(view){
	var dialog = view.getController()._TaxjurisdictionDialog;
	if (!dialog) {
		dialog = view.getController()._TaxjurisdictionDialog = sap.ui.xmlfragment("gdt.ui.ps.networkcomp.fragment.TaxJurisdictionDialog", view.getController());
		view.addDependent(dialog);
	}
	return dialog;				
	},

	_getCustomerCreateEditPopup=function(view){
		var dialog = view.getController()._customerCreateEditDialog;
		if (!dialog) {
			dialog = view.getController()._customerCreateEditDialog = sap.ui.xmlfragment("gdt.ui.ps.networkcomp.fragment.CustomerShipToCreateEditDialog", view.getController());
			view.addDependent(dialog);
		}
		return dialog;				
		},	
	
	
	
	read_NwActivityItems_from_SAP=function(viewController,NetworkId,ActivityId,refresh){
		var deferred;
		view = viewController.getView( );
      	
    	if (!refresh && core.getModel("inputData").getProperty("/Network") === NetworkId)
    	{	return $.Deferred(function(def) {return def.resolve();}).promise();}

		deferred =  $.Deferred(function(defer) {
			datacontext.nwactivitcomph.get([NetworkId,ActivityId]).done(function(data){
				var lineItems = data.LineItems.results; 
			    core.getModel("lineItems").setData(lineItems);
			    var maxLineItemNumber = (_.max(lineItems, function(line){ return line.ItemNumber; })).ItemNumber;
			    core.getModel("currentState").setProperty("/itemNumber",maxLineItemNumber);
			    _resizeTable(viewController);
				view.getModel("currentData").setData(data);
				view.getModel("currentData").refresh();
		       defer.resolve(data);
			}).fail(function (msg) {
				defer.reject(msg);
			}).always(function () {					     
		      _setCurrentState(viewController);
		      tableDisplayHelper.changeRowDisplay(viewController);
			});
		});
        	
    	return deferred;                   	   
	    },	
	
	    
	    create_NwActivityItems_into_SAP =  function(action,vc,NetworkId,ActivityId,refresh){
	    	if(!view){view=vc.getController( );}
	    	var msg = "",
			canSave = _canSave();

		if (function(){if(action !== "DELETE_LINES"){ return ( _isDirty() && canSave) ;} return true; }()) {
           
		  var busyDlg	= _getDilaog(view);
			
			if(event === "DELETE_LINES")
				{
				busyDlg.setText("Deleting Line Items in SAP");
				}else{
			busyDlg.setText("Saving data into SAP.");
				}
			busyDlg.open();

			setTimeout(function() {
				_checkSelectedLines(action).done(function() {
					_doSave().done(function(id) {
						sap.m.MessageToast.show("data has been saved.");
					}).fail(function(msg) {
						sap.m.MessageBox.show((msg) ? msg : "The application Could not save this record to SAP.", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "SAP Error",
							actions: sap.m.MessageBox.Action.OK,
							onClose: null});
					}).always(function() {
						busyDlg.close();
					});
				}).fail(function() {
					busyDlg.close();
				});
			},10);

		} else {
			if (!canSave) {
				msg = "Data cannnot be saved, please correct the highlighted errors and try again.";
                console.log(msg);
				sap.m.MessageToast.show(msg);
			} else {
				msg = "No changes have been made, Save cancelled.";
                console.log(-10, msg);
				sap.m.MessageToast.show(msg);
				_toggleEdit(true);
			}
		}                 	   
		    },	

		    
		    delete_NwActivityItems_from_SAP =  function(action,vc,NetworkId,ActivityId,refresh){
		    	if(!view){view=vc.getController( );}
		    	var msg = "",
				canDelete = _canDelete();

			if (function(){if(action !== "RESTRICTED_ACTION"){ return (_isDirty() && canDelete) ;} return true; }()) {
	           
			  var busyDlg	= _getDilaog(view);
			    busyDlg.setTitle("Delete Data");
				busyDlg.setText("Deleting Line Items from SAP");
                busyDlg.open();
				setTimeout(function() {
					_checkSelectedLines(action).done(function() {
						_doDelete().done(function(id) {
							sap.m.MessageToast.show("Seleted lines have been deleted.");
						}).fail(function(msg) {						
							sap.m.MessageBox.show((msg) ? msg : "The application Could not delete the lines from SAP.", {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "SAP Error",
								actions: sap.m.MessageBox.Action.OK,
								onClose: null});
							// Reverse the Flags for Deletion and selection
							  var foundLine;
							  var lineItems = view.getModel("lineItems").getData( );
							_.each(core.getModel("deleteEntries").getData(),function(deleteline){
								foundLine = _.find(lineItems, function(line){ return line.Component === deleteline; });
								if(foundLine){foundLine.Selected = true; foundLine.Deletion = false;}
							});
							
						}).always(function() {
							busyDlg.close();
						});
					}).fail(function() {
						busyDlg.close();
					});
				},10);

			} else {
				if (!canDelete) {
					msg = "Data cannnot be deleted, please correct the highlighted errors and try again.";
	                console.log(msg);
					sap.m.MessageToast.show(msg);
				} else {
					msg = "No changes have been made, delete cancelled.";
	                console.log(-10, msg);
					sap.m.MessageToast.show(msg);
					_toggleEdit(true);
				}
			}                 	   
			    },	    

		    
          _canSave=function(){
             if(view.getModel("currentState").getProperty("/anyErrors")){return false;}
             return true;
             // Last minute validation
		    },
		  _canDelete=function(){
			  if(_.filter(view.getModel("lineItems").getData(),function(line){return (line.Selected);}).length === 0){
				  sap.m.MessageBox.show("Please select Line items to be deleted");
				  return false;
			  }
	         return true;
	         // Last minute validation
			}, 
		    
		  _doSave=function(exit){
			    var busyDlg	= _getDilaog(view);
				var currentState = view.getModel("currentState"),
					deferred = null;

					deferred = $.Deferred(function (def) {
						var timeout     = 0,							
							lineItemsModel   = view.getModel("lineItems"),
							currentDataModel = view.getModel("currentData"),
							currentData = currentDataModel.getData();
					

						_deleteBlankDetailLines();
//						_deleteDBdetailLines();

						_.each(lineItemsModel.getData(),function(line) {
							if (line.Material){ line.Material = dragAndDropHelper.pad(line.Material, 18);}
							    line.Network   = currentData.Network;
							    line.Activity  = currentData.Activity;
							    if(!!line.DeliveryAddressFlag && !!line.Customer && !!line.AddrNo && !!line.AddrNo2 ){line.Customer = currentData.Customer;}
							    if(!line.ReqDate){ line.ReqDate = currentData.ReqDate;}
							    line.ItemText = line.ItemText.substring(0,40);
//							    line.DeliveryDays = "2";
							    line.EntryQuantity = line.EntryQuantity.toString( );
						});
                        
						if(lineItemsModel.getData())
					{	currentData.LineItems = lineItemsModel.getData();}

						console.log("initiating Save...");
						datacontext.nwactivitcomph.create(currentData).done(function(data) {
							var msg = "";
							 
								busyDlg.setText("Material Components are added to Network-Activity("+data.Network+"-"+data.Activity+"), reloading from SAP.");
								console.log("Save successful.");

								if (data.Activity && data.Network) {
									currentState.setProperty("/isEditMode",false);
									currentState.setProperty("/isNotEditMode", true);
									currentState.setProperty("/canEdit", _canEdit());
									copies.setProperty("/currentDataCopy",null);
									copies.setProperty("/currentLineItemsCopy",[]);
									

										if (!exit) {
											setTimeout(function() {
												read_NwActivityItems_from_SAP(view.getController(),data.Network,data.Activity,true).done(function() {											
													 view.getController().getRouter().navTo("detail", {		    
															params:data.Network + "-" + data.Activity,
															tab:"activityItemTab"
														},true);   
													
													
													def.resolve();
												}).fail(function() {
													sap.m.MessageBox.show("The UI App Saved this record to SAP but could not retrieve it again.  You will be returned to the selection list.  If the Network-Activity( " + data.Network +"-"+data.Activity + ") is not in that list, wait a few seconds and hit the refresh button.", {
														icon: sap.m.MessageBox.Icon.ERROR,
														title: "SAP Error",
														actions: sap.m.MessageBox.Action.OK,
														onClose: function () {
														}
													});
													def.resolve();
												});
											}, timeout);
										} else {
											def.resolve();
										}

								} else {
									if (data && data.error && data.error.message && data.error.message.value) {
										msg = data.error.message.value;
									}
									def.reject(msg);
								}
							}).fail(function(msg) {
								def.reject(msg);
								_toggleEdit();
							});
						});

				return deferred.promise();
						  
		  },
		    

		  _doDelete=function(exit){
			    var busyDlg	= _getDilaog(view);
				var currentState = view.getModel("currentState"),
				    components,
				    deleteEntries = [],
				    v_exit = 0,
				    maxLineItem,
				    lineItems,lineItemsDummy,
					deferred = null;

					deferred = $.Deferred(function(def){
     			    		var timeout     = 0,							
							lineItemsModel   = view.getModel("lineItems"),
							currentDataModel = view.getModel("currentData"),					
							currentData = currentDataModel.getData();
     			    		core.getModel("deleteEntries").setData(deleteEntries),
						_deleteBlankDetailLines();
						 lineItems = lineItemsModel.getData();
						 lineItemsDummy = _.reject(lineItems, function(line){return (line.Selected && !line.Db);});     
						 if(lineItems.length !== lineItemsDummy.length ){v_exit = v_exit + 1; lineItemsModel.setData(lineItemsDummy);}
						 
						 maxLineItem = _.max(lineItemsDummy, function(line){ return line.ItemNumber; });
						 if(maxLineItem){core.getModel("currentState").setProperty("/itemNumber",maxLineItem.ItemNumber);}
						 
						 
						 lineItems = _.filter(lineItemsDummy, function(line){return (line.Selected);}); 
						 if(lineItems.length !== 0 && lineItems.length !== lineItemsDummy.length ){v_exit = v_exit + 1;lineItems = lineItemsDummy; }
						 _.each(lineItems,function(line) { 
							 if(line.Selected){
								 line.Deletion = true;
								 line.Selected = false;
								 deleteEntries.push(line.Component);
							if(!components){ components = line.Component; }
							else{
								components = components + "," + line.Component;
						     }
							 }
						});
                        if(deleteEntries.length > 0){core.getModel("deleteEntries").setData(deleteEntries);}
                        if(!components){busyDlg.close();return ;}
						console.log("initiating Deletion...");
						datacontext.nwactivitcomph.remove([currentData.Network,currentData.Activity,components]).done(function(data) {
							var msg = "";
							 
								busyDlg.setText("Selected Material Components are deleted from SAP for Network-Activity("+currentData.Network+"-"+currentData.Network+"), reloading from SAP.");
								console.log("Deletion successful.");
								
								if (currentData.Activity && currentData.Network) {
									
									if(v_exit === 2){exit = true;lineItemsModel.setData(lineItems);
									currentState.setProperty("/isEditMode",false);
									currentState.setProperty("/isNotEditMode", true);
									currentState.setProperty("/canEdit", _canEdit());
									copies.setProperty("/currentDataCopy",null);
									copies.setProperty("/currentLineItemsCopy",[]);
									}
									
//									if(v_exit == 2){exit = true;lineItemsModel.setData(lineItems);}
									
										if (!exit) {
											setTimeout(function() {
												read_NwActivityItems_from_SAP(view.getController(),currentData.Network,currentData.Activity,true).done(function() {											
													 view.getController().getRouter().navTo("detail", {		    
															params:currentData.Network + "-" + currentData.Activity,
															tab:"activityItemTab"
														},true);   
													
													
													def.resolve();
												}).fail(function() {
													sap.m.MessageBox.show("The UI App delete the lines from SAP but could not retrieve it again.  You will be returned to the selection list.  If the Network-Activity( " + currentData.Network +"-"+currentData.Activity + ") is not in that list, wait a few seconds and hit the refresh button.", {
														icon: sap.m.MessageBox.Icon.ERROR,
														title: "SAP Error",
														actions: sap.m.MessageBox.Action.OK,
														onClose: function () {
														}
													});
													def.resolve();
												});
											}, timeout);
										} else {
											def.resolve();
										}

								} else {
									if (data && data.error && data.error.message && data.error.message.value) {
										msg = data.error.message.value;
									}
									def.reject(msg);
								}
							}).fail(function(msg) {
								def.reject(msg);
								_toggleEdit();
							});
							
						});

				return deferred.promise();
						  
		  },	  
		  
	      _checkSelectedLines = function(action) {
					var deferred,l,msg ,rejmsg,popupmsg,popupmsgTitle ,
						lineItemsModel = core.getModel("lineItems"),
						rows = lineItemsModel.getData();
				 if(action === "DELETE_LINES")
					{
						var	selectedLines = _.filter(rows, function(row){return (row.Selected); });
							l = (Boolean(selectedLines)) ? selectedLines.length : 0;
							msg = "Are you sure you wish to delete these " + l + " line items?";
							rejmsg = "Deletion of lines are canceled" ;
							popupmsgTitle = "Confirm Deletion";
					}else{
//
					}

					deferred = $.Deferred(function (def) {
						if (l > 0) {
							
							sap.m.MessageBox.confirm(msg, function (confirmation) {
								if (confirmation !== "CANCEL") {							
								   def.resolve();
								} else {
									def.reject(rejmsg);
								}
							}, popupmsgTitle);
						} else {
							def.resolve();
						}
					});

					return deferred.promise();
				},		    
		    
	    
	    _resizeTable=function(vController){
        	var height = $(document).height(),
        	    view = vController.getView(),
        	tbl = view.byId("lineItemsTable"),
        	offset = 320,
        	rows = parseInt((height - offset) / 32);
        	if (tbl) {
        		if (rows > 5) {
            		tbl.setVisibleRowCount(rows);
            	} else {
            		tbl.setVisibleRowCount(5);
            	}
        	}	
        },
	    
	    
        _setCurrentState=function(viewController){
        	var currentData = core.getModel("currentData").getData(),
    		details = core.getModel("lineItems").getData(),
    		currentState = core.getModel("currentState");
    	

    	currentState.setProperty("/timezone",new Date().toString().match(/\(([A-Za-z\s].*)\)/)[1]);
    	currentState.setProperty("/timezoneOffset",new Date().toString().match(/([-\+][0-9]+)\s/)[1]);
    	currentState.setProperty("/LineCount",(details) ? details.length : 0);
    	currentState.setProperty("/isEditMode",false);
    	currentState.setProperty("/isNotEditMode",true);
		currentState.setProperty("/canEdit", _canEdit());
		currentState.setProperty("/deleteEnable", false);
		currentState.setProperty("/selection", false);

		viewController.getView().setModel(currentState,"currentState");
		
// setting application to editable at initial launch	
        jQuery.sap.delayedCall(30, this, function () {
      	  _toggleEdit(true,viewController);
          handleAddDetailLine();
			});	 	          
       	      
        },    
	   
		_canEdit = function() {
			return 	true ;
		},
        
		_toggleEdit = function(confirmation,viewController) {
			
			if (!confirmation || confirmation === "CANCEL") {return;}
			if(!view){
			     view = viewController.getView( );}
			var currentStateModel  = view.getModel("currentState"),
				cureentDataModel   = view.getModel("currentData"),
				lineItemsModel     = view.getModel("lineItems"),
				mailComposeModel   = view.getModel("mailComposeLines"),
				isEditMode = !currentStateModel.getProperty("/isEditMode"),
				currentDataCopy,
				currentLineItemsCopy,
				mailComposeLinesCopy;	

			currentStateModel.setProperty("/isEditMode", isEditMode);
			currentStateModel.setProperty("/isNotEditMode", !isEditMode);
			currentStateModel.setProperty("/canEdit", (isEditMode === false) && _canEdit());
			currentStateModel.setProperty("/deleteEnable", false);
			

			if (isEditMode) {
                copies.setProperty("/currentDataCopy",jQuery.extend(true, {},cureentDataModel.getData()));
                copies.setProperty("/currentLineItemsCopy",jQuery.extend(true, [], lineItemsModel.getData()));
                copies.setProperty("/mailComposeLinesCopy",jQuery.extend(true, [], mailComposeModel.getData()));
			} else {
				currentDataCopy      = copies.getProperty("/currentDataCopy");
				currentLineItemsCopy = copies.getProperty("/currentLineItemsCopy");
				mailComposeLinesCopy = copies.getProperty("/mailComposeLinesCopy");


				if (currentDataCopy && currentDataCopy.Network && currentDataCopy.Activity) {
					_deleteBlankDetailLines(viewController);
					cureentDataModel.setData(currentDataCopy);
					if(currentDataCopy.ReqDate === null) {view.byId("ReqDate").setValue(null);}
					lineItemsModel.setData(currentLineItemsCopy);
					mailComposeModel.setData(mailComposeLinesCopy);
					copies.setProperty("/currentDataCopy",null);
					copies.setProperty("/currentLineItemsCopy",[]);
					copies.setProperty("/mailComposeLinesCopy",[]);
				} else {
//
				}
			}
			
	//		validate_customer( );
		},		
		
		_deleteBlankDetailLines = function(viewController) {
			if(!view){
			    view = viewController.getView();}
// checking lineItem Tab Lines   			
        	var lineItemsModel = view.getModel("lineItems"),
        		lineItems = jQuery.extend(true, [], lineItemsModel.getData()),
				lengthB4 = lineItems.length;
        	
        	lineItems = _.filter(lineItems, function(line) {
					return (!!line.Material);
			});
        	
        	if (!!lineItemsModel && (lengthB4 > lineItems.length)){ lineItemsModel.setData(lineItems);}
        	
// checking MailCompose Tab Lines        	
        var	mailComposeLinesModel   = view.getModel("mailComposeLines"),
            mailComposeLines        = jQuery.extend(true, [], mailComposeLinesModel.getData()),
            lengthB4                = mailComposeLines.length;
            mailComposeLines        = _.filter(mailComposeLines, function(line) {return (!!line.Mfrpn);});
            if (!!mailComposeLinesModel && (lengthB4 > mailComposeLines.length)){ mailComposeLinesModel.setData(mailComposeLines);}
        	
        	
        },
		
        _deleteDBdetailLines=function(action) {
        	var lineItemsModel = view.getModel("lineItems"),
        	    lineItems = jQuery.extend(true, [], lineItemsModel.getData()),
        	    lengthB4 = lineItems.length;
        	    if(action === "DELETE_LINES"){
        	     lineItems = _.reject(lineItems, function(line){return (!line.Selected && !line.Db);});
        	    }else{
        	    lineItems = _.filter(lineItems, function(line){return (!line.Db);});
        	    }
        	    if (!!lineItemsModel && (lengthB4 > lineItems.length)){ lineItemsModel.setData(lineItems);}
        },
        
		_isDirty = function() {
			var currentDataCopy      = copies.getProperty("/currentDataCopy"),
				currentLineItemsCopy = copies.getProperty("/currentLineItemsCopy"),
				lines = view.getModel("lineItems").getData(),
				toOmit = [ "LineItems" ],
				toOmitLineFields=["DeliveryAddress"],
				detailLinesDifferent = false;

			if (!currentDataCopy || !currentLineItemsCopy){ return true;}

			if (_.reject(currentLineItemsCopy, function(line) { return !line.Material; }).length !== _.reject(lines, function(line) { return !line.Material; }).length) {return true;}

// Fill the necessary fields not to be validated during comparision		
			//	toOmit.push("RequestedDeliveryDate");  // User cannot see this change so don"t enforce if quote.


			_.each(currentLineItemsCopy, function(line) {
				var newLine = _.findWhere(lines, {Component : line.Component});

				if (!newLine) {
					detailLinesDifferent = (Boolean(line.Mfrpn)) ? true : detailLinesDifferent;
				} else {
					if (!_.isEqual(_.omit(line,toOmitLineFields),_.omit(newLine,toOmitLineFields) )){ detailLinesDifferent = true;}
				}
			});

			return 	!_.isEqual(_.omit(currentDataCopy, toOmit), _.omit(view.getModel("currentData").getData(), toOmit)) || detailLinesDifferent;

		},
       
		read_customerInfo_from_SAP=function(viewController,key,refresh){
			var deferred;
			view = viewController.getView( );
	      	
			deferred =  $.Deferred(function(defer) {
				datacontext.customer.get(key).done(function(data){
			       defer.resolve(_updateCustomerModelData(data));
				}).fail(function (msg) {
					defer.reject(msg);
				}).always(function (){					     

				});
			});
	        	
	    	return deferred;                   	   
		    },
		
		_updateCustomerModelData =function(data){
			var custModel = sap.ui.getCore().getModel("customerAddressTemplate");
			var custModelData =  jQuery.extend(true, {},custModel.getData());
			var pages = custModelData.pages;
			var page1 = pages[0];
			var page1groups = page1.groups;
			var page1ContactDetails = page1groups[0];
			var page1ContactDetailsPhone = page1ContactDetails.elements[0];
			var page1ContactDetailsFax   = page1ContactDetails.elements[1];
			var page1ContactDetailsEmail   = page1ContactDetails.elements[2];
			var page1ContactDetailsAddress = page1ContactDetails.elements[3];
			
			page1.description = data.Name;
			page1.title = data.Name;
			
			if(data.Phone.length === 0){delete page1ContactDetails.elements[0];}else{page1ContactDetailsPhone.value = data.Phone;}
			if(data.Fax.length === 0){delete page1ContactDetails.elements[1];}else{page1ContactDetailsFax.value = data.Fax;}
			if(data.Email.length === 0){delete page1ContactDetails.elements[2];}else{page1ContactDetailsEmail.value = data.Email;}
			if(data.Address.length === 0){delete page1ContactDetails.elements[3];}else{page1ContactDetailsAddress.value = data.Address;}

			page1ContactDetails.elements = _.filter(page1ContactDetails.elements,function(line){return (line !== undefined);});
			sap.ui.getCore().getModel("customerAddress").setData(custModelData);
		},
		
		
		handleAddDetailLine = function(event,v) {
			    if(!view){view=v;}
			    try{
			    var isMailCompose = (event.getSource().getId().search("addBlankMailLineId") < 0)?false:true;
			    }catch(err){
			    	var isMailCompose =	false;
			    }
			    var details = (isMailCompose)?view.getModel("mailComposeLines"):view.getModel("lineItems"),
			        currentData = view.getModel("currentData").getData(),
				detailsArray = details.getData(),
				ui5tbl = (isMailCompose)?view.byId("PartIDsLineItemsTable"):view.byId("lineItemsTable"),
				tbl = (isMailCompose)?$("#"+view.byId("PartIDsLineItemsTable").getId()):$("#"+view.byId("lineItemsTable").getId()),
				startRow = ui5tbl.getFirstVisibleRow(),
				numRows = $(tbl).find("tr:not(:has(th))").length;
          
			var newline = dragAndDropHelper.createNewLine(); 
			if(currentData.IsAddressCopiedToItem){
				newline.IsAddrCopyFromHeader= true;
				newline.IsAddrCopyFromItem  = false;
				newline.CopiedAddrComponent = "000000000000000"; // "000000000000000" as header Notation
				newline.Customer            = currentData.DeliveryAddress.Customer;
				newline.AddrNo              = currentData.AddrNo;
				newline.AddrNo2             = currentData.AddrNo2;
				newline.DeliveryAddress     = currentData.DeliveryAddress;
				newline.DeliveryAddressFlag = currentData.DeliveryAddressFlag;}
			else{
				newline.Customer            = currentData.Customer;	
			}
			if(isMailCompose){newline.LongMatlDesc="";  newline.ItemNumber = (detailsArray.length + 1 ).toString( ) ; }
			detailsArray.push(newline);
			details.refresh(false);

			setTimeout(function () {
				if (startRow < detailsArray.length - numRows) {
					ui5tbl.setFirstVisibleRow(detailsArray.length - numRows);
				}
			},1000);
		},	
		
		
		handleChangePartID = function(source) {

			var	binding = source.getBinding("value"),
				context = binding.getContext(),
				rowModel = binding.getModel(),
				row = (context) ? rowModel.getProperty(context.getPath()) : rowModel.getData(),
				manufacturerPartID = source.getValue().toUpperCase(),
				isMailCompose = core.getModel("currentState").getProperty("/isMailCompose"),
				page = view.byId("NwActivityHeaderItems"),
				isCustomerPartID = (binding.getPath() === "Mfrpn");
            
		           if(manufacturerPartID.length !== 0){
		   			page.setBusyIndicatorDelay(0);
		   			page.setBusy(true);
		           }else
		           {source.setValueState(sap.ui.core.ValueState.None);
		            source.setTooltip();
		            return; 
		            }		


			setTimeout(function () {
			//	_lookupPartID
				dragAndDropHelper.lookupPartID(row, manufacturerPartID, true, isCustomerPartID, function(data) {
					if (isCustomerPartID && data.Material) {
						if(!isMailCompose){
						source.setValueState(sap.ui.core.ValueState.None);
						source.setTooltip();

						if (context) {
							rowModel.setProperty(context.getPath(),data);
						} else {
							rowModel.setData(data);
						}
						}else{
							source.setTooltip("Part number already exists in the Master Data.  If you believe it is correct, please contact the Master Data Maintenance group.");
							source.setValueState(sap.ui.core.ValueState.Error);	
						}
					} else {
						if(!isMailCompose){
						source.setTooltip("Part number does not exist in the Master Data for this Manufacturer.  If you believe it is correct, please contact the Master Data Maintenance group.");
						source.setValueState(sap.ui.core.ValueState.Error);
						}
						else{
							source.setValueState(sap.ui.core.ValueState.None);
							source.setTooltip();

							if (context) {
								rowModel.setProperty(context.getPath(),data);
							} else {
								rowModel.setData(data);
							}							
						}
					}
					page.setBusy(false);
				}, function() {
					if(!isMailCompose){
					source.setTooltip("Part number does not exist in the Master Data for this Manufacturer.  If you believe it is correct, please contact the Master Data Maintenance group.");
					source.setValueState(sap.ui.core.ValueState.Error);
					}else{
						source.setValueState(sap.ui.core.ValueState.None);
						source.setTooltip();
						if (context) {
							rowModel.setProperty(context.getPath(),row);
						} else {
							rowModel.setData(row);
						}							
					}
					page.setBusy(false);
				});
			});
		},		
		
		
		selectBroughtIn=function(event,vc){
		var source   = event.getSource(),
		    binding  = source.getBinding("value"),
		    context  = binding.getContext(),							
		    selected = source.getValue(),			
	        model   = binding.getModel();
	   var row     = model.getProperty(context.getPath());	
	   if(selected){row.Procind = "PEV";}else{row.Procind = "PFS";}
	   
        model.setProperty(context.getPath(), row);			    
		},
		
		resetData=function(vc){
			if(!view){view = vc.getView();}
			view.getModel("currentData").setData(null);
			view.getModel("lineItems").setData([]);
			view.getModel("mailComposeLines").setData([]);
			view.getModel("currentState").setProperty("/selection",false);
			view.getModel("currentState").setProperty("/deleteEnable",false);
			view.getModel("currentState").setProperty("/anyErrors",false);
			view.byId("ReqDate").setValue(null);
		},
		
		validate_customer=function(oEvent){
		var	current  = view.getModel("currentState");
			if(oEvent){
			var source   = oEvent.getSource(),
	        binding  = source.getBinding("value"),	        
	        value    = source.getValue( );
			}else{
				value = view.getModel("currentData").getProperty("/Customer");	
			}
		
	 if(value.length==0){
		    source.setValueState("None");
			source.setValueStateText("");
			current.setProperty("/anyErrors",false);
			return;
	 }
		var	customerDfr = $.Deferred(function(defer) {
		 var model = sap.ui.getCore().getModel();
		 model.callFunction("/checkExistance","GET", {Value1:value,Value2:"",Variables:"Customer"},null,
        	 function(data, response) { //success
        		if (response.statusCode >= 200 && response.statusCode <= 299 && !data.checkExistance.Error) {
        			if(source){
        			source.setValueState("None");
        			source.setValueStateText("");
        			
        			}else{
        				defer.resolve();
        			}
        			current.setProperty("/anyErrors",false);
        		} else {
        			if(source){
        			source.setValueState("Error");
        			source.setValueStateText("Entered Customer does not found in SAP system");
        			
        			}else{
        				defer.reject();
        			}
        			current.setProperty("/anyErrors",true);
        		}
        	},
		      function(data) { //error
        		if(source){
        		source.setValueState("Error");
        		source.setValueStateText("Entered Customer does not found in SAP system");        		
        		}else{
        			defer.reject();
        		}
        		current.setProperty("/anyErrors",true);
			},
			true  // Async
        );
			});
			return $.when(customerDfr).promise();	
		},
// ******************************Begin*******************************************************
// ******************  D E L I V E R Y   A D D R E S S  *************************************
// ******************************************************************************************		

// Header Level Delivery address Read		
		read_delivery_address_for_header=function(event,viewController){
			view = viewController.getView( );
		var	currentDataModel = view.getModel("currentData"),
		    currentData     = currentDataModel.getData(), 
		    currentDataCopy = jQuery.extend(true, {}, currentData);

			
			core.getModel("currentDataCopy").setData(currentData);
			
        if(currentData.DeliveryAddress.Activity === undefined){			
			var deferred;
					
			var Customer   = currentDataCopy.Customer,
			    Addrnumber = currentDataCopy.AddrNo || currentDataCopy.AddrNo2;
			if(!!Addrnumber && !!Customer){Addrnumber="";}
		//	if(!Addrnumber && !Customer){Customer = copyRow.Customer }
			
			deferred =  $.Deferred(function(defer) {
				datacontext.deliveryAddress.get({"Customer":Customer,"Addrnumber":Addrnumber}).done(function(data){
				   currentData.DeliveryAddress = data; // Setting Delivery address
				   core.getModel("deliveryAddress").setData(data);
				   currentDataCopy.DeliveryAddress = jQuery.extend(true, {}, data);
				   if(currentDataCopy.AddrNo){ currentDataCopy.DeliveryAddressFlag = "U";} // Updating the address fields for existing address number,it will not permit to create new address one
		//		   if(!!currentDataCopy.Addrnumber && !!currentDataCopy.DeliveryAddress.Customer)currentDataCopy.Customer=""; 
				   currentDataModel.setData(currentDataCopy);
			       _getHeaderDeliveryAddressPopup(view).open( );
			        defer.resolve(data);
				}).fail(function (msg) {
					defer.reject(msg);
					sap.m.MessageToast.show("Delivery Address not found");
				}).always(function () {					     
				});
			});
	        	
	    	return deferred;   
}{
	if(currentDataCopy.AddrNo){ currentDataCopy.DeliveryAddressFlag = "U";}
	currentDataModel.setData(currentDataCopy);
	 _getHeaderDeliveryAddressPopup(view).open( );
}
		},		
		
// Item Level Delivery Address Read		
 read_delivery_address_for_item=function(event,viewController){
var			source = event.getSource(),
			binding = source.getBinding("color"),
			context = binding.getContext(),
			model = binding.getModel(),
			row = model.getProperty(context.getPath()),
			copyRow = jQuery.extend(true, {}, row);
			core.getModel("lineItemCopy").setData(row);
			
        if(row.DeliveryAddress.Activity === undefined){			
			var deferred;
			view = viewController.getView( );		
			var Customer = copyRow.Customer,
			    Addrnumber = copyRow.AddrNo || copyRow.AddrNo2;
			if(!Addrnumber && !Customer){Customer = copyRow.Customer = view.getModel("currentData").getProperty("/Customer"); }
			
			deferred =  $.Deferred(function(defer) {
				datacontext.deliveryAddress.get({"Customer":Customer,"Addrnumber":Addrnumber}).done(function(data){
				   row.DeliveryAddress = data; // Setting Delivery address
				   core.getModel("deliveryAddress").setData(row.DeliveryAddress);
				   copyRow.DeliveryAddress = jQuery.extend(true, {}, data);
				   if(copyRow.AddrNo){ copyRow.DeliveryAddressFlag = "U"; }// Updating the address fields for existing address number,it will not permit to create new address one
			       view.getModel("lineItem").setData(copyRow);
			       _getDeliveryAddressPopup(view).open( );
			        defer.resolve(data);
				}).fail(function (msg) {
					defer.reject(msg);
					sap.m.MessageToast.show("Delivery Address not found");
				}).always(function () {					     
				});
			});
	        	
	    	return deferred;   
}{
	if(copyRow.AddrNo){ copyRow.DeliveryAddressFlag = "U";}
	 view.getModel("lineItem").setData(copyRow);
	 _getDeliveryAddressPopup(view).open( );
}
		},
		
		
getAddressForCustomerOrAddrNumber = function(event,viewController,CustOrAddr){
var	source = event.getSource(),
    action = (source.sId.search("customerShipToEditID") > 0)?"customerShipToCreate":(source.sId === "AddressNumberSearchForH" || source.sId === "CustomersNumberSearchForH" || source.sId ===  "CustomerDeliveryAddressIDH")?"deliveryAddressSearchForH"  :"deliveryAddressSearchForI",
	binding = source.getBinding("value"),
	value = (binding)?source.getValue():undefined,
	model = (binding)?binding.getModel():
		   (action==="customerShipToCreate")?viewController.getView().getModel("customerShipToAddress"):
		   (action==="deliveryAddressSearchForH")?viewController.getView().getModel("currentData"):viewController.getView().getModel("lineItem"),
	Customer="",
	Addrnumber="",
	deliveryAddressFlag="",
	data  = model.getData();

if(action ==="deliveryAddressSearchForI" || action ==="deliveryAddressSearchForH" ){	
	
if(CustOrAddr==="Customer" ){
	var property = (action ==="deliveryAddressSearchForH")?"/DeliveryAddress/Customer":"/Customer";
  if(data.AddrNo2){model.setProperty(property,""); sap.m.MessageToast.show("Please enter either only Customer number or Address Number:"); return ;} 
   deliveryAddressFlag="K";
   Customer=(value !== undefined)?value:model.getProperty(property);
  }
  else{
	  var customer =(action ==="deliveryAddressSearchForH")?data.DeliveryAddress.Customer:data.Customer;
	  if(customer){model.setProperty("/AddrNo2",""); sap.m.MessageToast.show("Please enter either only Customer number or Address Number:"); return; } 

	deliveryAddressFlag="A";
	Addrnumber=(value !== undefined)?value:data.AddrNo2;
   }	
}else{
	try{
	Customer=source.getValue();
	}catch(err){
    Customer=data.Customer;	
	}
}

var deferred =  $.Deferred(function(defer) {
	datacontext.deliveryAddress.get({"Customer":Customer,"Addrnumber":Addrnumber}).done(function(resultData){
    if(action ==="deliveryAddressSearchForI" || action ==="deliveryAddressSearchForH" ){
	   data.AddrNo="";
	   data.DeliveryAddressFlag=deliveryAddressFlag;
	   data.DeliveryAddress = resultData; // Setting Delivery address
	   model.setData(data);
	   model.refresh(true);
	}else if(action ==="deliveryAddressSearchForH" ){
	//	
	}	
	 else{
		model.setData(resultData)	;
		}
	    defer.resolve(resultData);
	}).fail(function (msg) {
		defer.reject(msg);
		if(action ==="deliveryAddressSearchForI" ){
		   data.AddrNo="";
		   data.DeliveryAddressFlag="";
		   data.Customer="";
		   data.AddrNo2="";
		   data.DeliveryAddress = core.getModel("blankAddressLine").getData(); // Setting Delivery address
		   model.setData(data);
		   model.refresh(true);
		}else if(action ==="deliveryAddressSearchForH" ){
			   data.AddrNo="";
			   data.DeliveryAddressFlag="";
			   data.AddrNo2="";
			   data.DeliveryAddress = core.getModel("blankAddressLine").getData(); // Setting Delivery address
			   model.setData(data);
			   model.refresh(true);			
		}
		
		else
			{
			model.setData(jQuery.extend(true, {}, core.getModel("blankAddressLine").getData()));
			}
		sap.m.MessageToast.show("Delivery Address not found");
	}).always(function (){					     
	});
});
	
return deferred;   

	
},		


check_address_in_SAP=function(data,viewController){
	var deferred;
	view = viewController.getView( );
	var busyDlg	= _getDilaog(view);
    busyDlg.setTitle("Checking Address Data");
	busyDlg.setText("Checking Delivery Address data is consistent");
    busyDlg.open();
    data.Action = "CHECK_ADDRESS";
	deferred =  $.Deferred(function(defer) {
		datacontext.deliveryAddress.create(data).done(function(data){
		    defer.resolve( );		   
		}).fail(function (msg) {
            defer.reject(msg);
		}).always(function (){	
			 busyDlg.close( );
		});
	});		
	return deferred;                    	   
    },

    create_customer_in_SAP=function(data,viewController,action){
    	var deferred;
    	view = viewController.getView( );
    	var busyDlg	= _getDilaog(view);
    	if(action === "CREATE_CUSTOMER"){
        busyDlg.setTitle("Create Customer");
    	busyDlg.setText("Creating Customer in SAP.Please wait...");
    	}else{
    		   busyDlg.setTitle("Update Customer");
    	    	busyDlg.setText("Updating Customer data in SAP.Please wait...");	
    	}
        busyDlg.open();
        data.Action = action;
    	deferred =  $.Deferred(function(defer) {
    		datacontext.deliveryAddress.create(data).done(function(data){
    		    defer.resolve(data);		   
    		}).fail(function (msg) {
                defer.reject(msg);
    		}).always(function (){	
    			 busyDlg.close( );
    		});
    	});		
    	return deferred;                    	   
        },  


//******************************End*********************************************************
//******************  D E L I V E R Y   A D D R E S S  *************************************
//******************************************************************************************		

        
        
//******************************Begin*******************************************************
//**************  C U S T O M E R  S H I P - T O   A D D R E S S  **************************
//******************************************************************************************		
customerShipToCreate=function(event,viewController){
view = viewController.getView( );
var customerData = view.getModel("customerShipToAddress").getData();
if(_isValidCustomerData(customerData,"CREATE")){
	create_customer_in_SAP(customerData,viewController,"CREATE_CUSTOMER").done(function(data){
		view.getModel("customerShipToAddress").setData(data);
		view.getModel("currentData").setProperty("/Customer",data.Customer);
		_getCustomerCreateEditPopup(view).close();
		
/*		sap.m.MessageBox.show("Customer Ship-to # "+ data.Customer +" is successfully created in SAP", {
			icon: sap.m.MessageBox.Icon.SUCCESS,
			title: "Customer Ship-to Created",
			actions: sap.m.MessageBox.Action.OK,
			onClose: null});*/

		var dialog = new sap.m.Dialog({
			icon: "sap-icon://message-information",
			title: "Customer Ship-to Created",
			type: "Message",
				content: new sap.m.Text({
					text: "Customer Ship-to # "+ data.Customer +" is successfully created in SAP"
				}),
			endButton: new sap.m.Button({
				icon:"sap-icon://accept",
				text:"OK",
				type:"Accept",
				tooltip:"Ok to Exit",
				press: function () {
					dialog.close();
				}
			}),
			beginButton: new sap.m.Button({
				icon:"sap-icon://copy",
				text:"Copy",
				type:"Emphasized", 
				tooltip:"Copy Customer Ship-to Number",				
				press: function () {
					clipboardHelper.executeCopy();
				}
			}),
			afterClose: function() {
				dialog.destroy();
			}
		});
		clipboardHelper.copyToClipboard(data.Customer,viewController);
		dialog.open();
	
		
		
		
	}).fail(function(msg){
		sap.m.MessageBox.show((msg) ? msg : "Error in Data.Please correct errors", {
			icon: sap.m.MessageBox.Icon.ERROR,
			title: "SAP Error",
			actions: sap.m.MessageBox.Action.OK,
			onClose: null});
	
	});	
}
},		

customerShipToUpdate=function(event,viewController){
	view = viewController.getView( );
	var customerData = view.getModel("customerShipToAddress").getData();
	if(_isValidCustomerData(customerData,"UPDATE")){
		create_customer_in_SAP(customerData,viewController,"UPDATE_CUSTOMER").done(function(data){
			view.getModel("customerShipToAddress").setData(data);
			_getCustomerCreateEditPopup(view).close();
			sap.m.MessageToast.show("Customer Ship-to Data gets updated successfully");
		}).fail(function(msg){
			sap.m.MessageBox.show((msg) ? msg : "Error in Data.Please correct errors", {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: "SAP Error",
				actions: sap.m.MessageBox.Action.OK,
				onClose: null});			
		});		
	}
	},


_isValidCustomerData=function(customerShipTo,action){
	var msg="";
	
if(action !== "CREATE" && customerShipTo.CustActGrp!=="Z002"){
	msg = "You are not authorized to change non-Project Ship-to’s"	;
}	

if(msg.length===0){
if(customerShipTo.Name1.length === 0){
msg = "Please enter valid Customer Name";
}
if(customerShipTo.Country.length === 0){
	msg = (msg.length===0)?"Please enter valid Country":msg + "\n Please enter valid Country";
}
	else if(sap.ui.getCore().getElementById("CustomerShipToCountryID").getValue() !== ""){
		msg = (msg.length===0)?"Transportation Zone not defined for "+customerShipTo.Country  :msg + "\n Transportation Zone not defined for "+customerShipTo.Country;		
}
if(customerShipTo.Sort1.length === 0){
	msg = (msg.length===0)?"Please enter valid Search term":msg + "\n Please enter valid Search term";
}
if(customerShipTo.City1.length === 0){
	msg = (msg.length===0)?"Please enter valid City":msg + "\n Please enter valid City";
}
if(customerShipTo.PostCode1.length === 0){
	msg = (msg.length===0)?"Please enter valid Postal Code":msg +"\n Please enter valid Postal Code";
}
}
if(msg.length !== 0){
	sap.m.MessageBox.show((msg) ? msg : "Error in Data.Please correct errors", {
		icon: sap.m.MessageBox.Icon.ERROR,
		title: "SAP Error",
		actions: sap.m.MessageBox.Action.OK,
		onClose: null});
return false;	
}else{
	return true;
}

},

checkExistance=function(value1,value2,variable){
var	deferred =  $.Deferred(function(defer) {
var model = sap.ui.getCore().getModel();
model.callFunction("/checkExistance","GET", {Value1:value1,Value2:value2,Variables:variable},null,
	 function(data, response) { //success
		if (response.statusCode >= 200 && response.statusCode <= 299) {
			 defer.resolve(data);	
		} else {
			defer.reject(data);
		}
	},
      function(error) { //error
		defer.reject(error);
	},
	false  // Async
);
	});
	return deferred;
};
//******************************END*********************************************************
//**************  C U S T O M E R  S H I P - T O   A D D R E S S  **************************
//******************************************************************************************		
		
		
		
		return {
			read_NwActivityItems_from_SAP : read_NwActivityItems_from_SAP,
			create_NwActivityItems_into_SAP:create_NwActivityItems_into_SAP,
			delete_NwActivityItems_from_SAP:delete_NwActivityItems_from_SAP,
			read_customerInfo_from_SAP:read_customerInfo_from_SAP,
			read_delivery_address_for_header:read_delivery_address_for_header,
			read_delivery_address_for_item:read_delivery_address_for_item,
			check_address_in_SAP:check_address_in_SAP,
			checkExistance:checkExistance,
			toggleEdit:_toggleEdit,
			isDirty:_isDirty,
			valueHelper:valueHelper,
			dragAndDropHelper:dragAndDropHelper,
			clipboardHelper:clipboardHelper,
			emailHelper:emailHelper,
			tableDisplayHelper: tableDisplayHelper,
			handleChangePartID:handleChangePartID,
			getBusyDialog:_getDilaog,
			resetData:resetData,
			updateCustomerModelData:_updateCustomerModelData,
			exportFileHelper:ExportFileHelper,
			getAddressSearchPopup:_getAddressSearchPopup,
			getCustomerSearchPopup:_getCustomerSearchPopup,
			getCustomerCreateEditPopup:_getCustomerCreateEditPopup,
			taxjurisdictionPopup:_TaxjurisdictionPopup,
			datacontext:datacontext,
			customerShipToCreate:customerShipToCreate,
			customerShipToUpdate:customerShipToUpdate,
			getAddressForCustomerOrAddrNumber:getAddressForCustomerOrAddrNumber,
			handleAddDetailLine:handleAddDetailLine
		};	

})($, sap.ui.getCore(), _, gdt.ui.ps.networkcomp.data.DataContext,
		gdt.ui.ps.networkcomp.data.DataLoader,sap.ui.getCore().getModel("copies"),
		gdt.ui.ps.networkcomp.util.ValueHelper,gdt.ui.ps.networkcomp.util.DragAndDropHelper,gdt.ui.ps.networkcomp.util.ClipboardHelper,
		gdt.ui.ps.networkcomp.util.EmailHelper,gdt.ui.ps.networkcomp.util.TableDisplayHelper,
		gdt.ui.ps.networkcomp.util.ExportFileHelper);