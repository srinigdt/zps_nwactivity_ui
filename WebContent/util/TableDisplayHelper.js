/* global _:true */
/* global gdt:true */
jQuery.sap.declare("gdt.ui.ps.networkcomp.util.TableDisplayHelper");
$.sap.require("sap.ui.core.Core");
$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");
$.sap.require("gdt.ui.ps.networkcomp.util.Formatter");

gdt.ui.ps.networkcomp.util.TableDisplayHelper = (function($, core, _, view) {

	var initialize = function(vc) {
			view = vc.getView();
			var table = view.byId("lineItemsTable"),
				oldTableOnAfterRendering = table.onAfterRendering;

			table.onAfterRendering = function() {
				var tmpResult = oldTableOnAfterRendering.apply(this, arguments);

				if (typeof onAfterTableOnAfterRendering === "function") {
					onAfterTableOnAfterRendering.apply(this, arguments);

				}

				return tmpResult;
			};

			if (sap.ui.version < "1.38") {
				table._oVSb.attachScroll(_.debounce(changeRowDisplay, 50), table);
			}
		},

		_setErrorInRowIndicator = function(tr, on, classname) {
			var $tr = $(tr);

			if (on) {
				if ($tr && !$tr.hasClass(classname)) {
					$tr.addClass(classname);
				}
			} else {
				if ($tr && $tr.hasClass(classname)) {
					$tr.removeClass(classname);
				}
			}
		},

		_findTrForRow = function(row) {
			var ui5tbl = view.byId("lineItemsTable"),
				data = view.getModel("lineItems").getData(),
				startRow = ui5tbl.getFirstVisibleRow(),
				lastRow = 0,
				//	numRows = (data) ? data.length : 0,
				tbl = $("#" + view.byId("lineItemsTable").getId()),
				//	data = view.getModel("lineItems").getData(),
				rowidx = _.findIndex((data) ? view.getModel("lineItems").getData() : [], {
					Component: row.Component
				});

			if (!tbl || rowidx < 0) {
				return null;
			}
			if (rowidx < startRow) {
				return null;
			}

			rowidx -= startRow;

			lastRow = $(tbl).find("tr:not(:has(th))").length - 1;

			if (rowidx > lastRow) {
				return null;
			}
			return $(tbl).find("tr:not(:has(th))")[rowidx];
		},

		changeRowDisplay = function(vc) {
			if (!view) {
				view = vc.getView();
			}
			var rows = view.getModel("lineItems").getData();
			for (var key in rows) {
				_setErrorInRowIndicator(_findTrForRow(rows[key]), (!!rows[key].Db && !!rows[key].Deletion), "markedAsDeleted");
			}
		},

		onAfterTableOnAfterRendering = function() {
			changeRowDisplay(view.getController());
			if(sap.ui.version >= "1.38"){   
                  	$("#"+this.getId()+"-vsb").scroll( function(){ 
                  		changeRowDisplay(view.getController());
                  	} );
                  }
		};

	return {
		initialize: initialize,
		changeRowDisplay: changeRowDisplay
	};

})($, sap.ui.getCore(), _);