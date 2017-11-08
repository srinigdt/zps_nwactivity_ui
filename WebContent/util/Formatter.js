/* global _:true */
/* global gdt:true */
jQuery.sap.declare("gdt.ui.ps.networkcomp.util.Formatter");

$.sap.require("sap.ui.core.Core");
$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");
$.sap.require("sap.ui.core.format.DateFormat");
$.sap.require("gdt.ui.ps.networkcomp.data.DataLoader");

gdt.ui.ps.networkcomp.util.Formatter = (function($, core, _) {

	var BroughtIn = function(value) {

			if (value === "PEV" || value === "ZE") {
				return true;
			}
			return false;
		},

		mfrName = function(value) {
			var core = sap.ui.getCore(),
				mfrs = core.getModel("Manufacturers").getData() || [],
				mfr = $.grep(mfrs, function(n, i) {
					return n.Manufacturerid && n.Manufacturerid === value;
				});

			return (mfr[0] && mfr[0].Manufacturername) ? mfr[0].Manufacturername : (((value) && value.length === 0) ? "" : value);
		},

		date = function(value) {
			if (!value) {
				return "";
			}
			return value;
		},
		elementType = function(value) {

			switch (value) {
				case "text":
					return sap.m.QuickViewGroupElementType.text;

				case "pageLink":
					return sap.m.QuickViewGroupElementType.pageLink;

				case "mobile":
					return sap.m.QuickViewGroupElementType.mobile;

				case "phone":
					return sap.m.QuickViewGroupElementType.phone;

				case "email":
					return sap.m.QuickViewGroupElementType.email;

				case "link":
					return sap.m.QuickViewGroupElementType.link;

				default:
					return sap.m.QuickViewGroupElementType.text;
			}

		},

		baseUomName = function(value) {
			//return value;
			var Uoms = core.getModel("Uom").getData().results || [],
				Uom = $.grep(Uoms, function(n, i) {
					return n.Msehi && n.Msehi === value;
				});
			return (Uom[0] && Uom[0].Msehi) ? Uom[0].Msehl : (((value) && value.length === 0) ? "" : value);
		},

		countryName = function(value) {
			var Countries = core.getModel("Countries").getData() || [],
				Country = $.grep(Countries, function(n, i) {
					return n.Value && n.Value === value;
				});
			return (Country[0] && Country[0].Value) ? Country[0].Text : (((value) && value.length === 0) ? "" : value);

		},

		regionName = function(value, event) {
			var Region,
				Regions = core.getModel("Regions").getData() || [],
				Address = core.getModel("lineItem").getData().DeliveryAddress || core.getModel("customerShipToAddress").getData();
			if (Address === undefined || Address.Country === "" || Address.Country === undefined) {
				Region = $.grep(Regions, function(n, i) {
					return n.Bland && n.Bland === value;
				});
				if (Region.length > 1) {
					Regions = $.grep(Region, function(n, i) {
						return (n.Bland && n.Bland === value && n.Land1 === "US");
					});
				}
				if (Regions.length === 1) {
					Region = Regions;
				}
			} else {
				Region = $.grep(Regions, function(n, i) {
					return n.Bland && n.Bland === value && n.Land1 === Address.Country;
				});

			}
			return (Region[0] && Region[0].Bland) ? Region[0].Bezei : (((value) && value.length === 0) ? "" : value);

		},

		MatlTypeName = function(value) {
			var core = sap.ui.getCore(),
				MaterialTypes = core.getModel("MaterialType").getData() || [],
				MaterialType = $.grep(MaterialTypes, function(n, i) {
					return n.Value && n.Value === value;
				});

			return (MaterialType[0] && MaterialType[0].Value) ? MaterialType[0].Text : (((value) && value.length === 0) ? "" : value);
		},

		MatlGroupName = function(value) {
			var core = sap.ui.getCore(),
				MaterialGroups = core.getModel("MaterialGroup").getData() || [],
				MaterialGroup = $.grep(MaterialGroups, function(n, i) {
					return n.Value && n.Value === value;
				});

			return (MaterialGroup[0] && MaterialGroup[0].Value) ? MaterialGroup[0].Text : (((value) && value.length === 0) ? "" : value);
		},

		DeliveryAddressEditable = function(value) {
			if (value === "C" || value === "U") {
				return true;
			}
			return false;
		},

		TitleName = function(value) {
			var core = sap.ui.getCore(),
				titles = core.getModel("titleList").getData() || [],
				title = $.grep(titles, function(n, i) {
					return n.key === value;
				});

			return (title[0]) ? title[0].Name : (((value) && value.length === 0) ? "" : value);
		},

		languageText = function(value) {
			var core = sap.ui.getCore(),
				Languages = core.getModel("Languages").getData() || [],
				Language = $.grep(Languages, function(n, i) {
					return n.Value && n.Value === value;
				});

			return (Language[0] && Language[0].Value) ? Language[0].Text : (((value) && value.length === 0) ? "" : value);
		};

	return {
		BroughtIn: BroughtIn,
		mfrName: mfrName,
		date: date,
		elementType: elementType,
		baseUomName: baseUomName,
		countryName: countryName,
		regionName: regionName,
		MatlTypeName: MatlTypeName,
		MatlGroupName: MatlGroupName,
		TitleName: TitleName,
		languageText: languageText,
		DeliveryAddressEditable: DeliveryAddressEditable

	};

})($, sap.ui.getCore(), _, gdt.ui.ps.networkcomp.data.DataLoader);