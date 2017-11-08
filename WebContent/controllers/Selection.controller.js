sap.ui.define([
   "gdt/ui/ps/networkcomp/controllers/BaseController",
   "sap/m/MessageToast",
   "sap/m/MessageBox",
   "sap/ui/model/json/JSONModel",
   "sap/ui/model/resource/ResourceModel",
   "gdt/ui/ps/networkcomp/util/ValueHelper"
], function (BaseController,MessageToast,MessageBox,JSONModel,ResourceModel,ValueHelper){
   "use strict";
   return BaseController.extend("gdt.ui.ps.networkcomp.controllers.Selection",{
	   
	   onInit : function(event){
		 var  view = this.getView();
          view.setModel(sap.ui.getCore().getModel("inputData"), "inputData" );
          view.setModel(sap.ui.getCore().getModel("ProjectNetworks"), "ProjectNetworks" );
          var sysinfo = sap.ui.getCore().getModel("systemInfo").getData();
          if(sysinfo.Uname==="SXVASAMSETTI" && sysinfo.Sysid==="HED"){ //it works only for User SXVASAMSETTI and in Development.
         
/*          view.byId("info").addStyleClass("Heading");
          view.byId("info").setVisible(true); */
          
          view.byId("info1").addStyleClass("infoText"); //changed from "selection" //infoText
          view.byId("info1").setVisible(true);
          }
          else{
        	  view.byId("info1").addStyleClass("infoText");
              view.byId("info1").setVisible(true);  
          }	  
	   },
	   
	   onFetchData:function(event){
		    var that = this;
		    var NetworkId = sap.ui.getCore().getModel("inputData").getProperty("/Network");
		    var ActivityId = sap.ui.getCore().getModel("inputData").getProperty("/Activity");
		    var datafound = false;
		    if(NetworkId.length === 0){ this._error("Please enter valid Network Number"); return; }
		    if(ActivityId.length === 0){ this._error("Please enter valid Activity Number"); return; }
		    
    		var model = sap.ui.getCore().getModel();
    		model.callFunction("/checkExistance","GET", {Value1:NetworkId,Value2:ActivityId,Variables:"NetworkActivity"},null,
            	 function(data, response) { //success
            		if (response.statusCode >= 200 && response.statusCode <= 299) {
            			that._navigate(data.checkExistance.Error,NetworkId,ActivityId);
            		} else {
            			that._navigate(!false);	
            		}
            	},
			      function(data) { //error
            		that._navigate(!false);	
				},
				false  // Async
            );		   			   
	   },
	   
	   _error:function(msg){
		   var title = msg.substring(13,msg.length) + " Error";
	    MessageBox.show(msg, {
		    icon: sap.m.MessageBox.Icon.ERROR,
		    title: title,  
		    actions: sap.m.MessageBox.Action.OK,
		    onClose: null,
		    styleClass: "",
		    initialFocus: null,
		    textDirection: sap.ui.core.TextDirection.Inherit
		});
	   },
	   
	   onNetworkIDHelp:function(oEvent){
		   ValueHelper.NwId(oEvent,this);
	   },
	   onNetworkIDSearch:function(oEvent){
		   ValueHelper.onSearchNetworkID(oEvent,this);
	   }, 
	   onChangeNetworkID:function(oEvent){
		   ValueHelper.onSearchNetworkID(oEvent,this);
	   },	   	   
	   onChangeNetwork:function(oEvent){
		   var source = oEvent.getSource();
		   var value = source.getValue();
		   var model = sap.ui.getCore().getModel();
   		model.callFunction("/checkExistance","GET", {Value1:value,Value2:"",Variables:"Network"},null,
           	 function(data, response) { //success
           		if (response.statusCode >= 200 && response.statusCode <= 299) {
           			source.setValueState("None");
        			source.setValueStateText("");
           		} else {
           			source.setValueState("Error");
        			source.setValueStateText("Enter valid Network number");
           		}
           	},
			      function(data) { //error
           		source.setValueState("Error");
    			source.setValueStateText("Entered valid Network number");	
				},
				false  // Async
           );		    
	   },
	   _navigate:function(navigate,NetworkId,ActivityId){
			if(!navigate){ 		   
				   this.getRouter().navTo("detail", {
					    from:"home",			    
						params: NetworkId + "-" + ActivityId ,
						tab:"activityItemTab"
					});  
				    }else{
				    	this.onDisplayNotFound( );	
					}    
	   },
 
		onDisplayNotFound : function (oEvent) {
			//display the "notFound" target without changing the hash
			if(this.getRouter().getTargets()){
			this.getRouter().getTargets().display("notFound", {
				fromTarget : "home"
			});	
			}else{
				this.getRouter().navTo("notfound",{from:"home",fromTarget : "home"});  	
			}
			
			
			
			}
	   
	   
   });
});