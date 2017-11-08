sap.ui.define([
	"sap/m/Button"
], function(Button) {
	"use strict";
	return Button.extend("gdt.ui.ps.networkcomp.controls.HoverButton", {
		metadata : {
			events: {
	              "hover" : {},  // this Button has also a "hover" event, in addition to "press" of the normal Button
	              "mouseenter":{},
	              "mouseup":{},
	              "mouseover":{}
	          }			
		},
		

     onmouseover : function(evt) {   // is called when the Button is hovered - no event registration required
    	 var model = sap.ui.getCore().getModel(); 
    	 var customer = sap.ui.getCore().getModel('currentData').getProperty('/Customer'),
    	     view = this.getParent( ).getParent( ).getParent( ).getParent( ).getParent( ).getParent( ).getParent( ),
    	     customerEle = view.byId("CustomerValueID"),
    	     customer = customerEle.getValue( );

    	 var that = this;
 		 model.callFunction("/checkExistance",'GET', {Value1:customer,Value2:'',Variables:'Customer'},null,
 	        	 function(data, response) { //success
 	        		if (response.statusCode >= 200 && response.statusCode <= 299 && !data.checkExistance.Error) {
 	        			that.setEnabled(true);
 	        			customerEle.setValueState('None');
 	        			customerEle.setValueStateText('');
 	        			that.fireHover();
 	        			that.fireMouseenter( ); 
 	        			that.fireMouseup( );
 	        			that.fireMouseover( );
	        		}else{
	        		 that.setEnabled(false);
	        		 customerEle.setValueState('Error');
	        		 customerEle.setValueStateText('Please enter Valid Customer Ship-to ID');
	        		}
 	        	},
 			      function(data) { //error
                  that.setEnabled(false);
 				},
 				true  // Async
 	        );  
 		  
 		evt.preventDefault();
 		evt.stopPropagation();   	 
                },	

       
		renderer : {}
			


})
	
});
