sap.ui.define([
"gdt/ui/ps/networkcomp/controllers/BaseController"

], function (BaseController) {
   "use strict";
   return BaseController.extend("gdt.ui.ps.networkcomp.controllers.NotFound", {
      onInit: function () {
    	  var oRouter, oTarget;
			oRouter = this.getRouter();
			//oTarget = oRouter.getTarget("notFound");
			if(oRouter.getTargets( )){
				oTarget = oRouter.getTargets( )._mTargets.notFound;
			    oTarget.attachDisplay(function (oEvent) {
				this._oData = oEvent.getParameter("data"); //store the data
			}, this);
		}
      },
		// override the parent's onNavBack (inherited from BaseController)
		onNavBack : function (oEvent){
			var oHistory, sPreviousHash, oRouter;
			// in some cases we could display a certain target when the back button is pressed
			if (this._oData && this._oData.fromTarget) {
				this.getRouter().getTargets().display(this._oData.fromTarget);
				delete this._oData.fromTarget;
				return;
			}
			// call the parent's onNavBack
			BaseController.prototype.onNavBack.apply(this, arguments);
		}    	  

   });
});