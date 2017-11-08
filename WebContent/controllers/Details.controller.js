/* global _:true */
/* global gdt:true */
sap.ui.define([
   "gdt/ui/ps/networkcomp/controllers/BaseController",
   "gdt/ui/ps/networkcomp/controls/HoverButton",
   "gdt/ui/ps/networkcomp/util/Formatter",
   "sap/m/MessageToast",
   "sap/m/MessageBox",
   "sap/ui/model/json/JSONModel",
   "sap/ui/model/resource/ResourceModel",
   "gdt/ui/ps/networkcomp/controllers/DetailControllerHelper"
  
   

], function (BaseController,HoverButton,Formatter,MessageToast,MessageBox,JSONModel,ResourceModel,DetailControllerHelper,view,core) {
   "use strict";
   return BaseController.extend("gdt.ui.ps.networkcomp.controllers.Details", {
   
	   formatter:Formatter,

    onInit : function(){
		   view = this.getView();
		   core = sap.ui.getCore();
	       view.setModel(core.getModel("lineItems"), "lineItems" );
	       view.setModel(core.getModel("materials"),"materials");
	   	   view.setModel(core.getModel("currentState"),"currentState");
	   	   view.setModel(core.getModel("currentData"),"currentData");	   	
		   view.setModel(core.getModel("device"),"device");
		   view.setModel(core.getModel("procurementList"),"procurementList");
		   view.setModel(core.getModel("titleList"),"titleList");
		   view.setModel(core.getModel("deliveryAddress"),"deliveryAddress");
		   view.setModel(core.getModel("lineItem"),"lineItem");
		   view.setModel(core.getModel("Address"),"Address");
		   view.setModel(core.getModel("Customers"),"Customers");
		   view.setModel(core.getModel("TaxJurisdiction"),"TaxJurisdiction");
		   view.setModel(core.getModel("customerShipToAddress"),"customerShipToAddress"); 
		   view.setModel(core.getModel("mailComposeLines"),"mailComposeLines");
   
		   DetailControllerHelper.tableDisplayHelper.initialize(this);
		   DetailControllerHelper.dragAndDropHelper.initialize(this);
		   this.DetailControllerHelper = DetailControllerHelper;                         
		   this.getRouter().getRoute("detail").attachMatched(this._onRouteMatched, this);		
		   
	          var sysinfo = core.getModel("systemInfo").getData();
	          if(sysinfo.Uname==="SXVASAMSETTI" && sysinfo.Sysid==="HED"){ //it works only for User SXVASAMSETTI and in Development.
/*	          view.byId("info2").addStyleClass("demo");
	          view.byId("info2").setVisible(true);*/

	        	  view.byId("mailInfo").addStyleClass("mailInfo");
	        	  view.byId("mailInfo2").addStyleClass("mailInfo2");
       
	          }	
	          
	         

	   },
	   
	   _onRouteMatched : function (oEvent) {
		   if( oEvent.getParameter("name") !== "detail"){ return;}
		   
			var oArgs, oView,iconTabBar;
			oView      = this.getView();
			iconTabBar = oView.byId("iconTabBar");
			oArgs      = oEvent.getParameter("arguments");
			
			var params = oArgs.params.split("-");
			var currentTab = oArgs.tab || "activityItemTab";
			var NetworkId = params[0];
			var ActivityId = params[1];
				
			// instantiate dialog
			var busyDialog = DetailControllerHelper.getBusyDialog(this.getView());
			if (!this._dialog) {
				this._dialog = sap.ui.xmlfragment("gdt.ui.ps.networkcomp.fragment.BusyDialog", this);
				this.getView().addDependent(this._dialog);
			}
			
			// open dialog
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._dialog);
			this._dialog.open();

			
			var forceRefresh = true;
			var that = this;
			setTimeout(function () {
				DetailControllerHelper.read_NwActivityItems_from_SAP(that,NetworkId,ActivityId,forceRefresh).done(function(){
				  if (iconTabBar && (iconTabBar.getSelectedKey() !== currentTab)) {
                      iconTabBar.setSelectedKey(currentTab);
                  }	
				  that._dialog.close();
				  core.getModel("inputData").setProperty("/Network",NetworkId);
				  core.getModel("inputData").setProperty("/Activity",ActivityId);
			}).fail(function(msg){
				that._dialog.close();
			}).always(function(){});	
				that._dialog.close();

			});
			
			
			
		},
		


		onDialogClosed : function (oEvent) {
		//	jQuery.sap.clearDelayedCall(_timeout);
 
			if (oEvent.getParameter("cancelPressed")) {
				MessageToast.show("The operation has been cancelled");
			} else {
				//MessageToast.show("The operation has been completed");
			}
		}	,
		
		_onBindingChange : function (oEvent) {
			// No data for the binding
			if (!this.getView().getBindingContext()) {
				this.getRouter().getTargets().display("notFound");
			}
		},
		
		onSelectTab:function(event){
		var key =	event.getParameter("key");
		if(key === "mailcomposeTab"){ 
			view.getModel("currentState").setProperty("/isMailTab",true); 
			view.getModel("currentState").setProperty("/isMailCompose",true); 
		return;}
		view.getModel("currentState").setProperty("/isMailTab",false);
		view.getModel("currentState").setProperty("/isMailCompose",false);
		},
		
		onEditCancelButtonPress:function(oEvent){
			var currentState = view.getModel("currentState"),
			isEditMode = !currentState.getProperty("/isEditMode");

		if (isEditMode) {
			DetailControllerHelper.toggleEdit(true,this);
		} else {
			if (DetailControllerHelper.isDirty(this)){
				 MessageBox.confirm("Changes have been made, are you sure you wish to discard them?", DetailControllerHelper.toggleEdit, "Confirm Cancel Edit");
			} else {
				DetailControllerHelper.toggleEdit(true,this);
			}
		}			
		},
		
		onNavBack:function(oEvent){
			var currentState = view.getModel("currentState");
		if (currentState.getProperty("/isEditMode")) {
			if (DetailControllerHelper.isDirty(this)){
				 MessageBox.confirm("Changes have been made, are you sure you wish to discard them?", this.onConfirmNavBack, "Confirm to go initial page");
			} else {
				this.onConfirmNavBack(oEvent);
			}
		}else{
			this.onConfirmNavBack(oEvent);	
		}									
		},
		onConfirmNavBack:function(oEvent){
			if(oEvent === "CANCEL"){ return;}
			DetailControllerHelper.resetData(view.getController());
			var oHistory, sPreviousHash, oRouter;
			// in some cases we could display a certain target when the back button is pressed
			if (view.getController()._oData && view.getController()._oData.fromTarget) {
				view.getController().getRouter().getTargets().display(view.getController()._oData.fromTarget);
				delete view.getController()._oData.fromTarget;
				return;
			}
			// call the parent"s onNavBack
			BaseController.prototype.onNavBack.apply(view.getController(), arguments);			
			
			
		},
		
		onSaveNwActivityItems:function(oEvent){
			var NwId = view.getModel("currentData").getProperty("/Network");
			var ActvtytId = view.getModel("currentData").getProperty("/Activity");
			DetailControllerHelper.create_NwActivityItems_into_SAP("CREATE",this,view.getModel(),NwId,ActvtytId,true);	
		},
		
		onDeleteLineItems:function(oEvent){
			var NwId = view.getModel("currentData").getProperty("/Network");
			var ActvtytId = view.getModel("currentData").getProperty("/Activity");
			DetailControllerHelper.delete_NwActivityItems_from_SAP("DELETE_LINES",this,view.getModel(),NwId,ActvtytId,true);	
		},
		
		onPartIDHelp:function(oEvent){
			DetailControllerHelper.valueHelper.partId(oEvent,this);	
		},
		
		onMaterialSearch:function(oEvent){
			DetailControllerHelper.valueHelper.onSearchMaterial(oEvent,this);		
		},
		
		onChangePartID:function(oEvent){
			DetailControllerHelper.handleChangePartID(oEvent.getSource())	;
		},
		onEmailMasterData:function(oEvent){
			DetailControllerHelper.emailHelper.emailMasterData(oEvent,this.getView() );	
			DetailControllerHelper.toggleEdit(true,this);
		},
		onCancelImportErrorDialog:function(oEvent){
			this._errorImportDilaog.close( );	
			DetailControllerHelper.toggleEdit(true,this);
		},
		
		OnSelectLine:function(oEvent){
			 var lineItems    = view.getModel("lineItems").getData();
			 var currentState = view.getModel("currentState");
			 var deleteEnable = _.find(lineItems, function(line){ return (!!line.Selected); });  
			 if(deleteEnable){currentState.setProperty("/deleteEnable",true);return;}
			 currentState.setProperty("/deleteEnable",false);
		},
		onSelectAllLines:function(oEvent){
		 var source = oEvent.getSource();
		 var deleteEnable;
		 var lineItems = view.getModel("lineItems").getData();
		     if(source.getSelected( )){
		    	 lineItems.forEach(function(line){
		    		 if(!(line.Db && line.Deletion)){deleteEnable = line.Selected = true;}
		    	 }); 
		     }else{
		    	 lineItems.forEach(function(line){
		    		 if(!(line.Db && line.Deletion)){deleteEnable = line.Selected = false;}
		    	 }); 	 
		     }
		     view.getModel("lineItems").setData(lineItems);
		     if(deleteEnable !== undefined ){view.getModel("currentState").setProperty("/deleteEnable",deleteEnable);}
		},
		
		
onSelectBroughtIn:function(oEvent){

	    var source   = oEvent.getSource(),
		    binding  = source.getBinding("selected"),
		    context  = binding.getContext(),							
		    selected = source.getSelected(),			
	        model    = binding.getModel(),
	        row      = model.getProperty(context.getPath());	
	   if(selected){row.Procind = "PEV";}else{row.Procind = "PFS";}  
        model.setProperty(context.getPath(), row);		
		},
		
 onChangeCustomer:function(oEvent){	
			DetailControllerHelper.validate_customer(oEvent);	
		},

		
// --- Quick View code : Customer Info		
  handleQuickView:function(oEvent){
	  var that = this;
	 if(!this.getView().getModel("currentState").getProperty("/anyErrors")){
	  var key = this.getView().byId("CustomerValueID").getValue( );
      if(Boolean(key)){	        
   		DetailControllerHelper.read_customerInfo_from_SAP(that,key,false).done(function(data){
			}).fail(function(msg){				
			}).always(function(){});	
   		that.openQuickView(oEvent,sap.ui.getCore().getModel("customerAddress"));		
	      
      }else{
	//
      }
	 }	
		},
  openQuickView: function (oEvent, oModel) {
			this.createPopover();
 
			this._oQuickView.setModel(oModel);
 
			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(100, this, function () {
				this._oQuickView.openBy(oButton);
			});
		},
  createPopover: function() {
			if (!this._oQuickView) {
				this._oQuickView = sap.ui.xmlfragment("gdt.ui.ps.networkcomp.fragment.CustomerQuickView", this);
				this.getView().addDependent(this._oQuickView);
			}
		},	

		onAfterRendering: function () {
			var oButton = this.getView().byId("showQuickView");
			oButton.$().attr("aria-haspopup", true);

		},		
		
		onExit: function () {
			if (this._oQuickView) {
				this._oQuickView.destroy();
			}},		
// -- End of Quick View code 
		
        handleExportErrorPartIDs:function(event){
        	DetailControllerHelper.exportFileHelper.exportErrorPartIDs(event,this);	 //exportErrorPartIDs
        },
        
        onChangeDeliveryDate:function(event){
        	var oSource = event.getSource();
        	var oValue  = oSource.getValue();
        	    oValue  = view.getModel("currentData").getProperty("/ReqDate");
        	var lineItemsModel = view.getModel("lineItems");
        	var lineItemsData  = lineItemsModel.getData();
        	_.each(lineItemsData,function(line){ if(!(line.Db || line.Deletion)){ line.ReqDate = (oValue)? new Date(oValue) : null  ; }});
        },
        
		handleSuggestUom:function(event){
			DetailControllerHelper.valueHelper.suggestUom(event,this);			
	    },
	    
	    handleChangeUom:function(event) {
	    	DetailControllerHelper.valueHelper.changeUom(event,this);	
	    },

		handleSuggestMaterialType:function(event){
			DetailControllerHelper.valueHelper.suggestMaterialType(event,this);		
	    },
	    
	    handleChangeMaterialType:function(event) {
	    	DetailControllerHelper.valueHelper.changeMaterialType(event,this);	
	    },		
	    
		handleSuggestMaterialGroup:function(event){
			DetailControllerHelper.valueHelper.suggestMaterialGroup(event,this);			
	    },
	    
	    handleChangeMaterialGroup:function(event) {
	    	DetailControllerHelper.valueHelper.changeMaterialGroup(event,this);	
	    },		    

		handleSuggestCountry:function(event){
			DetailControllerHelper.valueHelper.suggestCountry(event,this);			
	    },
	    
	    handleChangeCountry:function(event) {
	    	DetailControllerHelper.valueHelper.changeCountry(event,this);	
	    },		    

		handleSuggestRegion:function(event){
			DetailControllerHelper.valueHelper.suggestRegion(event,this);			
	    },
	    
	    handleChangeRegion:function(event) {
	    	DetailControllerHelper.valueHelper.changeRegion(event,this);	
	    },		    
     
	    
	    handleSuggestMfr:function(event) {
			DetailControllerHelper.valueHelper.suggestMfr(event,this);
		},
		
		handleChangeMfrID:function(event) {
			DetailControllerHelper.valueHelper.changeMfr(event,this);		
		},		
		
		handleSuggestTitle:function(event) {
			DetailControllerHelper.valueHelper.suggestTitle(event,this);
		},
		
		handleChangeTitle:function(event) {
			DetailControllerHelper.valueHelper.changeTitle(event,this);
		},
		handleSuggestLanguage:function(event) {
			DetailControllerHelper.valueHelper.suggestLanguage(event,this);
		},		
		handleChangeLanguage:function(event) {
			DetailControllerHelper.valueHelper.changeLanguage(event,this);
		},		
		
		handleGetDeliveryAddress:function(event){
			DetailControllerHelper.read_delivery_address_for_item(event,this);
		},
		
		handleConfirmDeliveryAddrDialog:function(event){
				var isHeader = view.isHeader = (event.getSource().getParent( ).getParent( ).sId === "DialogDeliveryAddressH")?true:false;	
			
				if(isHeader){
				 var data     = view.getModel("currentData").getData();
				 var dataCopy = core.getModel("currentDataCopy").getData();
				}else{
				 var data     = view.getModel("lineItem").getData();
				 var dataCopy = core.getModel("lineItemCopy").getData();					
				}
				
				var that = this;
            	if(_.isEqual(dataCopy.DeliveryAddress,data.DeliveryAddress)){   
            		if(isHeader){this._deliveryAddressH.close();}else{this._deliveryAddress.close();}
            		return;
            	}


               DetailControllerHelper.check_address_in_SAP(data.DeliveryAddress,this).done(function(outData) {
            	if(!isHeader){ dataCopy.Customer = data.Customer;}
   				dataCopy.AddrNo              = data.AddrNo;
   				dataCopy.AddrNo2             = data.AddrNo2;
   				dataCopy.DeliveryAddress     = data.DeliveryAddress;
   				dataCopy.DeliveryAddressFlag = data.DeliveryAddressFlag;
   				dataCopy.IsAddrCopyFromItem  = data.IsAddrCopyFromItem;
   				if(isHeader){
   					that._deliveryAddressH.close();
   					that._updateAllItemsDeliveryAddress(data,isHeader);
   					data.IsAddressCopiedToItem = true;
   					view.getModel("currentData").setData(data);
   				}else{
   					that._deliveryAddress.close();}
   				    if(dataCopy.IsAddrCopyFromItem){that._updateAllItemsDeliveryAddress(dataCopy,isHeader);}
            	   
				}).fail(function(msg) {
					if(msg.search("No unique jurisdiction code") > 1){
						DetailControllerHelper.valueHelper.showTaxJurisdiction(event,that,data.DeliveryAddress,DetailControllerHelper.taxjurisdictionPopup(view));	
					}else{
					sap.m.MessageBox.show((msg) ? msg : "Error in Data.Please correct errors", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "SAP Error",
						actions: sap.m.MessageBox.Action.OK,
						onClose: null});
					}
				});

               
                
		},

		 _updateAllItemsDeliveryAddress:function(dataTobeCopied,isHeader){
			 var lineItemsdata = view.getModel("lineItems").getData(),
			     data;
			 _.each(lineItemsdata,function(lineItemData){
				 data = jQuery.extend(true, {},dataTobeCopied);
			 if(!lineItemData.Db){
				 lineItemData.IsAddrCopyFromHeader=  isHeader;
				 lineItemData.IsAddrCopyFromItem  = !isHeader ;
				 lineItemData.CopiedAddrComponent = (isHeader)?"000000000000000":data.Component; // "000000000000000" as header Notation
				 lineItemData.Customer            = (isHeader)?data.DeliveryAddress.Customer:data.Customer;
				 lineItemData.AddrNo              = data.AddrNo;
				 lineItemData.AddrNo2             = data.AddrNo2;
				 lineItemData.DeliveryAddress     = data.DeliveryAddress;
				 lineItemData.DeliveryAddressFlag = data.DeliveryAddressFlag;
				 } 
			 });
			
			 if(isHeader){			  
				    data.IsAddressCopiedToItem = true;
					view.getModel("currentData").setData(data);
			 }
			 view.getModel("lineItems").setData(lineItemsdata);
		   },		
		
		

       handleCancelDeliveryAddrDialog:function(event){
    	   var data,dataCopy,
    	       isHeader = (event.getSource().getParent( ).getParent( ).sId === "DialogDeliveryAddressH")?true:false;
    	   if(isHeader){
    		data     = view.getModel("currentData").getData();
   			dataCopy = core.getModel("currentDataCopy").getData();   
    	   }else{
			data     = view.getModel("lineItem").getData();
			dataCopy = core.getModel("lineItemCopy").getData();
    	   }
        	if(!_.isEqual(dataCopy.DeliveryAddress,data.DeliveryAddress)){
        		 core.vc = [ this,isHeader ] ;
        		 MessageBox.confirm("Changes have been made, are you sure you wish to discard them?",this._closeAddrDialog, "Confirm to exit");
        		return;
        	}
        	if(isHeader){
        	this._deliveryAddressH.close();	}
        	else{
        		this._deliveryAddress.close();	
        	}
		},
		
		_closeAddrDialog:function(action){
			var core = sap.ui.getCore();
			if(action === "OK"){
				if(core.vc[1]){
			    view.getModel("currentData").setData(core.getModel("currentDataCopy").getData());
				core.vc[0]._deliveryAddressH.close();}
			    else{
			     core.vc[0]._deliveryAddress.close();}	}
			delete core.vc;
		},
	
		handleCreateNewDeliveryAddress:function(event){
		var	data= (event.getSource().getParent( ).getParent( ).sId === "DialogDeliveryAddressH")?view.getModel("currentData").getData():view.getModel("lineItem").getData();
		data.DeliveryAddressFlag="C";			
		data.AddrNo="";	
		data.AddrNo2="";
		data.DeliveryAddress = jQuery.extend(true, {},core.getModel("blankAddressLine").getData()); 
    	if(event.getSource().getParent( ).getParent( ).sId === "DialogDeliveryAddressH"){
    		view.getModel("currentData").setData(data);
    	}else{
    		data.Customer="";	
    		view.getModel("lineItem").setData(data);}
		},
		
        handleCopyCreateDeliveryAddress:function(event){
        	
    	var	data= (event.getSource().getParent( ).getParent( ).sId === "DialogDeliveryAddressH")?view.getModel("currentData").getData():view.getModel("lineItem").getData();
    	    data.DeliveryAddressFlag="C";
    	    data.DeliveryAddress.Addrnumber = "0000000000";   	   
    	    data.AddrNo   ="";	
    	    data.AddrNo2  ="";
    	if(event.getSource().getParent( ).getParent( ).sId === "DialogDeliveryAddressH"){
    		data.DeliveryAddress.Customer ="";	
    		view.getModel("currentData").setData(data);
    	}else{
    		 data.Customer ="";	
    		view.getModel("lineItem").setData(data);
    		
    	}
    	
		},
		handleCloseDeliveryAddrDialog:function(event){
			if(event.getSource().getParent( ).getParent( ).sId == "DialogDeliveryAddressH"){
				this._deliveryAddressH.close();		
			}else{
				this._deliveryAddress.close();	
			}
				
		 		
		},
		handleChangeCustomerID:function(event){
			DetailControllerHelper.getAddressForCustomerOrAddrNumber(event,this,"Customer");	
		},
		handleChangeAddress:function(event){
			DetailControllerHelper.getAddressForCustomerOrAddrNumber(event,this,"AddrNumber");	
		},
		
		handleAddressSearchHelp:function(event){
			DetailControllerHelper.valueHelper.addressHelp(event,this,DetailControllerHelper.getAddressSearchPopup(view));	
		},
		
		handleAddressSearchHelpSearch:function(event){
			DetailControllerHelper.valueHelper.searchAddress(event,this,true);
		},
		handleCustomerSearchHelp:function(event){
			DetailControllerHelper.valueHelper.customerHelp(event,this,DetailControllerHelper.getCustomerSearchPopup(view));	
		},
		
		handleCustomerSearchHelpSearch:function(event){
			DetailControllerHelper.valueHelper.searchCustomer(event,this,true);
		},
		
		handleEditCustomerShipTo:function(event){
			DetailControllerHelper.read_delivery_address_for_header(event,this);
			
			

//			 call_Modify_ShipTo(event) // As per initial requirement // Disabled as per new requirement
		},
		
       call_Modify_ShipTo:function(event){
			var Customer = view.getModel("currentData").getProperty("/Customer");
			DetailControllerHelper.datacontext.deliveryAddress.get({"Customer":Customer,"Addrnumber":""}).done(function(data){
				view.getModel("customerShipToAddress").setData(data);							
				}).fail(function (msg) {
				}).always(function () {
					view.getModel("currentState").setProperty("/isCustCreate",false);	
					DetailControllerHelper.getCustomerCreateEditPopup(view).open();
				});			
		},		
		
		
		handleCreateCustomerShipTo:function(event){
			view.getModel("currentState").setProperty("/isCustCreate",true);
			view.getModel("customerShipToAddress").setData(jQuery.extend(true, {},core.getModel("blankAddressLine").getData()));
			DetailControllerHelper.getCustomerCreateEditPopup(view).open();	
		},
		
		handleCancelCustomerShipToCreate:function(event){
			DetailControllerHelper.getCustomerCreateEditPopup(view).close();		
		},

		handleCustomerShipToCreate:function(event){
			DetailControllerHelper.customerShipToCreate(event,this);	
		},
		
		handleSaveCustomerShipTo:function(event){
			DetailControllerHelper.customerShipToUpdate(event,this);
		},		
		handleOnChangeCustomerShipToName1:function(event){
			var source = event.getSource(),
			    value  = source.getValue();
				DetailControllerHelper.checkExistance(value,"","CustomerShipToName").done(function(data){
				if(!data.checkExistance.Error){
	        		source.setValueState("Warning");
	        		source.setValueStateText("Same Name already Exist");
	        		sap.ui.getCore().getElementById("NameWaringID").setValue("Same Name already Exist");
				}else{
					source.setValueState("None");
	        		source.setValueStateText("");
	        		sap.ui.getCore().getElementById("NameWaringID").setValue("");
				}
			}).fail(function(msg){
			// 	
			});			
		},

		handleChangeCountryforCustomerShipTo:function(event){
			DetailControllerHelper.valueHelper.changeCountry(event,this);	
			var source = event.getSource(),
		    value  = source.getValue();
			DetailControllerHelper.checkExistance(value,"","CustomerShipToCountry").done(function(data){
			if(data.checkExistance.Error){
        		source.setValueState("Error");
        		source.setValueStateText("Transportation Zone not defined for " + value);
        		sap.ui.getCore().getElementById("CustomerShipToCountryID").setValue("( Transportation Zone not defined for " + value+" )");
			}else{
				source.setValueState("None");
        		source.setValueStateText("");
        		sap.ui.getCore().getElementById("CustomerShipToCountryID").setValue("");
			}
		}).fail(function(msg){
		 //	
		})	;		
	},	
     handleMailCompose:function(event){
    	 view.getModel("currentState").setProperty("/isMailCompose",true); 
     },
     handleAddDetailLine:function(event){
    	 DetailControllerHelper.handleAddDetailLine(event);
     }
/*     ,
	 onExit: function(event) {
	
	   }*/		
	   
   });
});