/* global _:true */
/* global gdt:true */
jQuery.sap.declare("gdt.ui.ps.networkcomp.util.ClipboardHelper");

$.sap.require("sap.ui.core.Core");
//$.sap.require("gdt.ui.ps.networkcomp.lib.clipboard-min");
$.sap.require("gdt.ui.ps.networkcomp.util.Formatter");

gdt.ui.ps.networkcomp.util.ClipboardHelper = (function($, core, _,view,data){

var	copyToClipboard=function(copiedText,vc){
		data = copiedText;
	    view = vc.getView();
	   
	    document.addEventListener("copy",_raiseCopy);
	    	 
   },	

_raiseCopy=function(e){
	 var isIe = (navigator.userAgent.toLowerCase().indexOf("msie") !== -1 
	            || navigator.userAgent.toLowerCase().indexOf("trident") !== -1);
    var textToPutOnClipboard = data;
    if (isIe) {
    	try{
        window.clipboardData.setData("Text", textToPutOnClipboard); 
        sap.m.MessageToast.show(textToPutOnClipboard +" is copied successfully");
        document.removeEventListener("copy",_raiseCopy);
    	}catch(err){
    		sap.m.MessageToast.show("Copy is failed")	;
    	}
    } else {
    	try{
    		e.clipboardData.setData("text/plain", textToPutOnClipboard);
            sap.m.MessageToast.show(textToPutOnClipboard +" is copied successfully");
            document.removeEventListener("copy",_raiseCopy);
        	}catch(err){
        		sap.m.MessageToast.show("Copy is failed")	;
        	}	        	
        
    }
    e.preventDefault();	
},   
   
   
 executeCopy=function(){
   document.execCommand("copy");	    
 },   
   
   executeCopyToClipboard=function(text) {
       if (window.clipboardData && window.clipboardData.setData) {
           // IE specific code path to prevent textarea being shown while dialog is visible.
           return window.clipboardData.setData("Text", text); 

       } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
           var textarea = document.createElement("textarea");
           textarea.textContent    = text;
           textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
           document.body.appendChild(textarea);          
               try {
            	   textarea.select();
            	   return  document.execCommand("copy");  // Security exception may be thrown by some browsers.
                   
               } catch (ex) {
                   console.warn("Copy to clipboard failed.", ex);
                   return false;
               } finally {
                   document.body.removeChild(textarea);
               }				


       }
   };	    
    

return {
	copyToClipboard:copyToClipboard,
	executeCopy:executeCopy,
	executeCopyToClipboard:executeCopyToClipboard
};
	
})($, sap.ui.getCore(), _);