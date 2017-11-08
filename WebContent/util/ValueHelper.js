/* global _:true */
/* global gdt:true */
/* global getAddressForCustomerOrAddrNumber:true */
jQuery.sap.declare("gdt.ui.ps.networkcomp.util.ValueHelper");
$.sap.require("sap.ui.core.Core");
$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");
//$.sap.require("sap.ui.core.format.DateFormat");
$.sap.require("gdt.ui.ps.networkcomp.data.DataContext");
//$.sap.require("gdt.ui.ps.networkcomp.data.DataLoader"); 


gdt.ui.ps.networkcomp.util.ValueHelper = (function($, core, _,datacontext,copies,view,source,binding,model,busy,saveRow) {
	
var	partId = function (event,viewController) {
    	    view = viewController.getView( );
		var dialog,
			source  = event.getSource(),
			binding = source.getBinding("value"),
			context = binding.getContext(),								
			manufacturerPartID = source.getValue().toUpperCase();			
		    model   = binding.getModel();
		    var searchFn = null;
		    
		   var row     = model.getProperty(context.getPath());	
		    saveRow = jQuery.extend(true, {}, row);
		// instantiate dialog
		_instantiate_dialogs(viewController);
		dialog = viewController._PartSearchDialog[0];
		busy = viewController._PartSearchDialog[1];
		// open dialog
		jQuery.sap.syncStyleClass("sapUiSizeCompact", view, dialog);
		//viewController._PartSearchDialog[0].open();		
		

	//	dialog.attachEventOnce("search",  null, _onSearchMaterial);
	//	dialog.attachEventOnce("change",  null, _onSearchMaterial);
		dialog.attachEventOnce("confirm", null, _onConfirmMaterial);
		dialog.attachEventOnce("cancel",  null, _onCancelMaterial);
		
		event.getParameters().value = manufacturerPartID;

		_onSearchMaterial(event,viewController);

		dialog.open(manufacturerPartID);	
		
		},
	
   _instantiate_dialogs=function(viewController){
		if (!viewController._PartSearchDialog) {
			viewController._PartSearchDialog = sap.ui.xmlfragment("gdt.ui.ps.networkcomp.fragment.Details_LinePartSearchDialog", viewController);
			view.addDependent(viewController._dialog);
		}	   
   },		
	_onCancelMaterial = function(evt){
		model.setProperty(context.getPath(), saveRow);	
	},

	_onConfirmMaterial=function(evt){
//		var mfrPartID = evt.getParameter("selectedItem").getCells()[2].getText();
//		source.setValue(mfrPartID);	
		saveRow.Mfrpn = evt.getParameter("selectedItem").getCells()[2].getText();
		saveRow.Material = evt.getParameter("selectedItem").getCells()[0].getText();
		saveRow.MatlDesc = evt.getParameter("selectedItem").getCells()[3].getText();
		saveRow.BaseUom  = evt.getParameter("selectedItem").getCells()[5].getText();
		saveRow.MatlType  = evt.getParameter("selectedItem").getCells()[6].getText();
		saveRow.MatlTypeText   = evt.getParameter("selectedItem").getCells()[7].getText();
		saveRow.MatlGroup      = evt.getParameter("selectedItem").getCells()[8].getText();
		saveRow.MatlGroupText  = evt.getParameter("selectedItem").getCells()[9].getText();
	//	saveRow.Manufacturerno = evt.getParameter("selectedItem").getCells()[1].getText();
		saveRow.Manufacturerno = _.findWhere(core.getModel("Manufacturers").getData(),{Manufacturername:evt.getParameter("selectedItem").getCells()[1].getText()}).Manufacturerid;
		if(evt.getParameter("selectedItem").getCells()[4].getText().toString()==="true"){saveRow.Procind ="WE";}
		model.setProperty(context.getPath(), saveRow);	
	},
	
	
	_onSearchMaterial = function(evt,viewController) {
		view = viewController.getView();
		var value = evt.getParameter("value");

		value = value.toUpperCase();
        if(!busy){_instantiate_dialogs(viewController); busy = viewController._PartSearchDialog[1];}
		busy.open();
		setTimeout(function () {
			core.getModel().read("/MaterialsSet?$filter=Manufacturerpartid eq'" + value + "'and All eq 'S'",  {
				success: function(data, response) {
					var materialModel = view.getModel("materials");
				//	data.results.unshift({MfrpartId: "", Description: "", ManufacturerNo: ""});
					materialModel.setData(data.results);
					setTimeout(function () {
						busy.close();
					});
				},
				error: function(data, response){
					setTimeout(function () {
						busy.close();
					});
				}

			});
		});

		
	},	
	
// Network ID search Help
	NwId = function (event,viewController) {
 	    view = viewController.getView( );
		var NetworkSearchDialog,
			source  = event.getSource(),
			binding = source.getBinding("value"),
			context = binding.getContext(),							
			searchParam = source.getValue().toUpperCase();			
		    model   = binding.getModel();
		    
/*		   var row     = model.getProperty(context.getPath());	
		    saveRow    = jQuery.extend(true, {}, row);*/
		// instantiate dialog
		if (!viewController._NetworkSearchDialog) {
			viewController._NetworkSearchDialog = sap.ui.xmlfragment("gdt.ui.ps.networkcomp.fragment.Selection_NetworkIDSearchDialog", viewController);
			view.addDependent(viewController._NetworkSearchDialog[0]);
			view.addDependent(viewController._NetworkSearchDialog[1]);
		}
		NetworkSearchDialog = viewController._NetworkSearchDialog[0];
		busy = viewController._NetworkSearchDialog[1];
		// open dialog
		jQuery.sap.syncStyleClass("sapUiSizeCompact", view, NetworkSearchDialog);
		//viewController._PartSearchDialog[0].open();		
		
		NetworkSearchDialog.attachEventOnce("confirm", null, _onConfirmNetworkID);
		NetworkSearchDialog.attachEventOnce("cancel",  null, _onCancelNetworkID);
		
		event.getParameters().value = searchParam;

		_onSearchNetworkID(event,viewController);

		NetworkSearchDialog.open(searchParam);	
		
		},	
		
		_onSearchNetworkID = function(evt,viewController) {
			view = viewController.getView( );
			var value = evt.getParameter("value");

			value = value.toUpperCase();
             if(!busy){_instantiate_dialogs(viewController); busy = viewController._PartSearchDialog[1];}
			busy.open();
			setTimeout(function () {				
	    		var coreModel = core.getModel();
	    		var noData = [];
	    		var ProjectNetworkModel = view.getModel("ProjectNetworks");
	    		coreModel.callFunction("/GetProjNwValues","GET", {SearchParameter:value},null,
	            	 function(data, response) { //success
	            		if (response.statusCode >= 200 && response.statusCode <= 299) {
	            			ProjectNetworkModel.setData(data.results);
	            		} else {
	            			ProjectNetworkModel.setData(noData);
	            		}
	            		
	            		setTimeout(function () {
							busy.close();
						});
	            	},
				      function(data) { //error
	            		ProjectNetworkModel.setData(noData);
	            		setTimeout(function () {
							busy.close();
						});
					},
					false  // Async
	            );						
			});

			
		},		

		_onCancelNetworkID = function(evt){
		//	model.setProperty(context.getPath(), saveRow);	
		},

		_onConfirmNetworkID=function(evt){
			var NetworkID = evt.getParameter("selectedItem").getCells()[2].getText();
			var ActivityID = evt.getParameter("selectedItem").getCells()[4].getText();
			model.setProperty("/Network", NetworkID);	
			model.setProperty("/Activity", ActivityID);	
		},		
		
		suggestMfr=function(event,viewController){
			var term = event.getParameter("suggestValue"),
			source = event.getSource(),
			mfrs = core.getModel("Manufacturers").getData() || [],
			suggestions = [];

		suggestions = $.grep(mfrs, function(n){
		  return n.Manufacturername.match(new RegExp(term, "i"));
		});

		source.destroySuggestionItems();
		for (var i = 0, len = (Boolean(suggestions)) ? suggestions.length : 0; i < len; i++) {
			source.addSuggestionItem(new sap.ui.core.Item({
				text: suggestions[i].Manufacturername
			}));
		}			
		},
		
		suggestUom=function(event,viewConroller){
			var term = event.getParameter("suggestValue"),
			source = event.getSource(),
			Uom = core.getModel("Uom").getData().results || [],
			suggestions = [];

		suggestions = $.grep(Uom, function(n){
		  return n.Msehl.match(new RegExp(term, "i"));
		});

		source.destroySuggestionItems();
		for (var i = 0, len = (Boolean(suggestions)) ? suggestions.length : 0; i < len; i++) {
			source.addSuggestionItem(new sap.ui.core.Item({
				text: suggestions[i].Msehi + "-"+suggestions[i].Msehl
			}));
		}			
			
		},	
		
		
		
		changeUom=function(event,viewConroller){
			var source = event.getSource(),
			uom = source.getValue(),
			binding = source.getBinding("value"),
			context = binding.getContext(),
			model = binding.getModel(),
			row = (context) ? model.getProperty(context.getPath()) : model.getData(),
			saveRow = $.extend(true, {}, row),
			uoms = core.getModel("Uom").getData().results || [],
			found = false;

		if (uom){
			source.setValueState(sap.ui.core.ValueState.None);
		var	results = $.grep(uoms, function(n){
				return ( ( n.Msehi.toLowerCase() === uom.toLowerCase()) || ( n.Msehi.toLowerCase()+"-"+n.Msehl.toLowerCase() === uom.toLowerCase()) );
			});
			if (!results || results.length === 0) {
				results = $.grep(uoms, function(n){
					return n.Msehl.toLowerCase() === uom.toLowerCase();
				});
			}
			if (!!results && results.length === 1) {
					row.BaseUom = results[0].Msehi;
				if (source.getValueState() === sap.ui.core.ValueState.Error) {
					source.setValueState(sap.ui.core.ValueState.None);
					source.setTooltip();
				}
					model.setProperty(context.getPath(),row);
				found = true;
			}

			if (!found) {
				source.setTooltip( "Entered Unit of Measure(" + uom + ") is not in Master Data.  If this is the correct name, please contact Master Data Management.");
				source.setValueState(sap.ui.core.ValueState.Error);
				return false;
			}
		} else {
			row.BaseUom="";
			source.setTooltip("Uom is a required field, please enter.");
			source.setValueState(sap.ui.core.ValueState.Error);
			return false;
		}			
		},
		
  changeMfr=function(event,viewcontroller){
			var source = event.getSource(),
			manufacturerName = source.getValue(),
			binding = source.getBinding("value"),
			context = binding.getContext(),
			model = binding.getModel(),
			row = (context) ? model.getProperty(context.getPath()) : model.getData(),
			saveRow = $.extend(true, {}, row),
			mfrs = core.getModel("Manufacturers").getData() || [],
			isMailCompose = core.getModel("currentState").getProperty("/isMailCompose") ,
			results = [],
			found = false;


		if (manufacturerName) {
			source.setValueState(sap.ui.core.ValueState.None);
			results = $.grep(mfrs, function(n){
				return n.Manufacturername.toLowerCase() === manufacturerName.toLowerCase();
			});
			if (!results || results.length === 0) {
				results = $.grep(mfrs, function(n){
					return n.Manufacturerno === manufacturerName;
				});
			}
			if (!!results && results.length === 1) {
					row.Manufacturerno = results[0].Manufacturerid;
				if (source.getValueState() === sap.ui.core.ValueState.Error) {
					source.setValueState(sap.ui.core.ValueState.None);
					source.setTooltip();
				}
					model.setProperty(context.getPath(),row);

				found = true;
			}

			if (!found) {
				source.setTooltip("Manufacturer(" + manufacturerName + ") is not in Master Data.  If this is the correct name, please contact Master Data Management.");
				source.setValueState(sap.ui.core.ValueState.Error);
				return false;
			}
		} else {
				row.Manufacturerno = 0;
			source.setTooltip("Manufacturer is a required field, please enter.");
			source.setValueState(sap.ui.core.ValueState.Error);
			return false;
		}			
		},
		
		suggestMaterialType=function(event,viewConroller){
			var term = event.getParameter("suggestValue"),
			source = event.getSource(),
			MaterialTypes = core.getModel("MaterialType").getData() || [],
			suggestions = [];

		suggestions = $.grep(MaterialTypes, function(n){
		  return n.Text.match(new RegExp(term, "i"));
		});

		source.destroySuggestionItems();
		for (var i = 0, len = (Boolean(suggestions)) ? suggestions.length : 0; i < len; i++) {
			source.addSuggestionItem(new sap.ui.core.Item({
				text: suggestions[i].Value + "-"+suggestions[i].Text
			}));
		}			
			
		},
		
		changeMaterialType=function(event,viewConroller){
			var source = event.getSource(),
			materialType = source.getValue(),
			binding = source.getBinding("value"),
			context = binding.getContext(),
			model = binding.getModel(),
			row = (context) ? model.getProperty(context.getPath()) : model.getData(),
			saveRow = $.extend(true, {}, row),
			materialTypes = core.getModel("MaterialType").getData() || [],
			found = false;

		if (materialTypes){
			source.setValueState(sap.ui.core.ValueState.None);
			var results = $.grep(materialTypes, function(n){
				return ( ( n.Value.toLowerCase() === materialType.toLowerCase()) || ( n.Value.toLowerCase()+"-"+n.Text.toLowerCase() === materialType.toLowerCase()) );
			});
			if (!results || results.length === 0) {
				results = $.grep(materialTypes, function(n){
					return n.Text.toLowerCase() === materialType.toLowerCase();
				});
			}
			if (!!results && results.length === 1) {
					row.MatlType = results[0].Value;
				if (source.getValueState() === sap.ui.core.ValueState.Error) {
					source.setValueState(sap.ui.core.ValueState.None);
					source.setTooltip();
				}
			    model.setProperty(context.getPath(),row);
			    source.destroySuggestionItems();
				found = true;
			}

			if (!found) {
				source.setTooltip( "Entered MaterialType(" + materialType + ") is not in Master Data.  If this is the correct name, please contact Master Data Management.");
				source.setValueState(sap.ui.core.ValueState.Error);
				return false;
			}
		} else {
			row.MatlType="";
			source.setTooltip( "materialType is a required field, please enter.");
			source.setValueState(sap.ui.core.ValueState.Error);
			return false;
		}			
		},
		
		suggestMaterialGroup=function(event,viewConroller){
			var term = event.getParameter("suggestValue"),
			source = event.getSource(),
			MaterialGroups = core.getModel("MaterialGroup").getData() || [],
			suggestions = [];

		suggestions = $.grep(MaterialGroups, function(n){
		  return n.Text.match(new RegExp(term, "i"));
		});

		source.destroySuggestionItems();
		for (var i = 0, len = (Boolean(suggestions)) ? suggestions.length : 0; i < len; i++) {
			source.addSuggestionItem(new sap.ui.core.Item({
				text: suggestions[i].Value + "-"+suggestions[i].Text
			}));
		}			
			
		},
		
		changeMaterialGroup=function(event,viewConroller){
			var source = event.getSource(),
			materialGroup = source.getValue(),
			binding = source.getBinding("value"),
			context = binding.getContext(),
			model = binding.getModel(),
			row = (context) ? model.getProperty(context.getPath()) : model.getData(),
			saveRow = $.extend(true, {}, row),
			materialGroups = core.getModel("MaterialGroup").getData() || [],
			found = false;

		if (materialGroups){
			source.setValueState(sap.ui.core.ValueState.None);
			var results = $.grep(materialGroups, function(n){
				return ( ( n.Value.toLowerCase() === materialGroup.toLowerCase()) || ( n.Value.toLowerCase()+"-"+n.Text.toLowerCase() === materialGroup.toLowerCase()) );
			});
			if (!results || results.length === 0) {
				results = $.grep(materialGroups, function(n){
					return n.Text.toLowerCase() === materialGroup.toLowerCase();
				});
			}
			if (!!results && results.length === 1) {
					row.MatlGroup = results[0].Value;
				if (source.getValueState() === sap.ui.core.ValueState.Error) {
					source.setValueState(sap.ui.core.ValueState.None);
					source.setTooltip();
				}
			    model.setProperty(context.getPath(),row);
				found = true;
			}

			if (!found) {
				source.setTooltip("Entered MaterialGroup(" + materialGroup + ") is not in Master Data.  If this is the correct name, please contact Master Data Management.");
				source.setValueState(sap.ui.core.ValueState.Error);
				return false;
			}
		} else {
			row.MatlGroup="";
			source.setTooltip( "material Group is a required field, please enter.");
			source.setValueState(sap.ui.core.ValueState.Error);
			return false;
		}			
		},		

		
//******************************End*********************************************************
//******************  D E L I V E R Y   A D D R E S S  D I A L O G  ************************
//***************************** Value Helps*************************************************		
   suggestTitle=function(event,viewConroller){
		var term = event.getParameter("suggestValue"),
		source = event.getSource(),
		titles = core.getModel("titleList").getData() || [],
		suggestions = [];

	suggestions = $.grep(titles, function(n){
	  return n.Name.match(new RegExp(term, "i"));
	});

	source.destroySuggestionItems();
	for (var i = 0, len = (Boolean(suggestions)) ? suggestions.length : 0; i < len; i++) {
		source.addSuggestionItem(new sap.ui.core.Item({
			text: (suggestions[i].key)?suggestions[i].key + "-"+suggestions[i].Name:""
		}));
	}			
		
	},

	   changeTitle=function(event,viewConroller){
			var source = event.getSource(),
			title = source.getValue(),
			binding = source.getBinding("value"),
			context = binding.getContext(),
			model = binding.getModel(),
			row = (context) ? model.getProperty(context.getPath()) : model.getData(),
			saveRow = $.extend(true, {}, row),
			titles = core.getModel("titleList").getData() || [],
			found = false;

		if (titles){
			source.setValueState(sap.ui.core.ValueState.None);
			var results = $.grep(titles, function(n){
				return ( ( n.key.toLowerCase() === title.toLowerCase()) || ( n.key.toLowerCase()+"-"+n.Name.toLowerCase() === title.toLowerCase()) );
			});
			if (!results || results.length === 0) {
				results = $.grep(titles, function(n){
					return n.Name.toLowerCase() === title.toLowerCase();
				});
			}
			if (!!results && results.length === 1) {
					row.DeliveryAddress.Title = results[0].key;
				if (source.getValueState() === sap.ui.core.ValueState.Error) {
					source.setValueState(sap.ui.core.ValueState.None);
					source.setTooltip();
				}
			    model.setProperty((context) ? context.getPath() : binding.getPath( ),(context) ? row :row.DeliveryAddress.Title);
				found = true;
			}

			if (!found) {
				source.setTooltip( "Entered Title(" + title + ") is not in Master Data.  If this is the correct name, please contact Master Data Management.");
				source.setValueState(sap.ui.core.ValueState.Error);
				return false;
			}
		} else {
			row.DeliveryAddress.Title="";
			source.setTooltip("");
			source.setValueState(sap.ui.core.ValueState.None);
			return false;
		}			
		},		
	
		   suggestLanguage=function(event,viewConroller){
				var term = event.getParameter("suggestValue"),
				source = event.getSource(),
				languages = core.getModel("Languages").getData() || [],
				suggestions = [];

			suggestions = $.grep(languages, function(n){
			  return n.Text.match(new RegExp(term, "i"));
			});

			source.destroySuggestionItems();
			for (var i = 0, len = (Boolean(suggestions)) ? suggestions.length : 0; i < len; i++) {
				source.addSuggestionItem(new sap.ui.core.Item({
					text: suggestions[i].Value + "-"+suggestions[i].Text
				}));
			}			
				
			},	

			 changeLanguage=function(event,viewConroller){
					var source = event.getSource(),
					langauge = source.getValue(),
					binding = source.getBinding("value"),
					context = binding.getContext(),
					model = binding.getModel(),
					row = (context) ? model.getProperty(context.getPath()) : model.getData(),
					saveRow = $.extend(true, {}, row),
					languages = core.getModel("Languages").getData() || [],
					found = false;

				if (languages){
					source.setValueState(sap.ui.core.ValueState.None);
					var results = $.grep(languages, function(n){
						return ( ( n.Value.toLowerCase() === langauge.toLowerCase()) || ( n.Value.toLowerCase()+"-"+n.Text.toLowerCase() === langauge.toLowerCase()) );
					});
					if (!results || results.length === 0) {
						results = $.grep(languages, function(n){
							return n.Text.toLowerCase() === langauge.toLowerCase();
						});
					}
					if (!!results && results.length === 1) {
							row.Langu = results[0].Value;
						if (source.getValueState() === sap.ui.core.ValueState.Error) {
							source.setValueState(sap.ui.core.ValueState.None);
							source.setTooltip();
						}
					    model.setProperty((context) ? context.getPath() : binding.getPath( ),(context) ? row :row.Langu);
						found = true;
					}

					if (!found) {
						source.setTooltip( "Entered language key(" +langauge + ") is not in Master Data.  If this is the correct name, please contact Master Data Management.");
						source.setValueState(sap.ui.core.ValueState.Error);
						return false;
					}
				} else {
					row.Langu="";
					source.setTooltip("");
					source.setValueState(sap.ui.core.ValueState.None);
					return false;
				}			
				},				
							
			
			
   suggestCountry=function(event,viewConroller){
			var term = event.getParameter("suggestValue"),
			source = event.getSource(),
			countries = core.getModel("Countries").getData() || [],
			suggestions = [];

		suggestions = $.grep(countries, function(n){
		  return n.Text.match(new RegExp(term, "i"));
		});

		source.destroySuggestionItems();
		for (var i = 0, len = (Boolean(suggestions)) ? suggestions.length : 0; i < len; i++) {
			source.addSuggestionItem(new sap.ui.core.Item({
				text: suggestions[i].Value + "-"+suggestions[i].Text
			}));
		}			
			
		},
		
   changeCountry=function(event,viewConroller){
			var source = event.getSource(),
			country = source.getValue(),
			binding = source.getBinding("value"),
			context = binding.getContext(),
			model = binding.getModel(),
			row = (context) ? model.getProperty(context.getPath()) : model.getData(),
			saveRow = $.extend(true, {}, row),
			countries = core.getModel("Countries").getData() || [],
			found = false;

		if (countries){
			source.setValueState(sap.ui.core.ValueState.None);
			var results = $.grep(countries, function(n){
				return ( ( n.Value.toLowerCase() === country.toLowerCase()) || ( n.Value.toLowerCase()+"-"+n.Text.toLowerCase() === country.toLowerCase()) );
			});
			if (!results || results.length === 0) {
				results = $.grep(countries, function(n){
					return n.Text.toLowerCase() == country.toLowerCase();
				});
			}
			if (!!results && results.length === 1) {
					row.Country = results[0].Value;
				if (source.getValueState() === sap.ui.core.ValueState.Error) {
					source.setValueState(sap.ui.core.ValueState.None);
					source.setTooltip();
				}
			    model.setProperty((context) ? context.getPath() : binding.getPath( ),(context) ? row :row.Country);
				found = true;
			}

			if (!found) {
				source.setTooltip( "Entered Country(" + country + ") is not in Master Data.  If this is the correct name, please contact Master Data Management.");
				source.setValueState(sap.ui.core.ValueState.Error);
				return false;
			}
		} else {
			row.Country="";
			source.setTooltip( "Country is a required field, please enter.");
			source.setValueState(sap.ui.core.ValueState.Error);
			return false;
		}			
		},				
		

    suggestRegion=function(event,viewConroller){
				var term = event.getParameter("suggestValue"),
				source  = event.getSource(),
				binding = source.getBinding("value"),
				model   = binding.getModel(),
				country =  model.getProperty("/Country"),
				regions = (country)? _.filter(core.getModel("Regions").getData(),function(data){return data.Land1 === country;})|| []: core.getModel("Regions").getData() || [],
				suggestions = [];

			suggestions = $.grep(regions, function(n){
			  return n.Bezei.match(new RegExp(term, "i"));
			});

			source.destroySuggestionItems();
			for (var i = 0, len = (Boolean(suggestions)) ? suggestions.length : 0; i < len; i++) {
				source.addSuggestionItem(new sap.ui.core.Item({
					text: suggestions[i].Bland + "-"+suggestions[i].Bezei
				}));
			}			
				
			},
			
	   changeRegion=function(event,viewConroller){
				var source = event.getSource(),
				region = source.getValue(),
				binding = source.getBinding("value"),
				context = binding.getContext(),
				model = binding.getModel(),
				country =  model.getProperty("/Country"),
				row = (context) ? model.getProperty(context.getPath()) : model.getData(),
				saveRow = $.extend(true, {}, row),
				regions = (country)? _.filter(core.getModel("Regions").getData(),function(data){return data.Land1 === country;})|| []: core.getModel("Regions").getData() || [],
				found = false;

			if (regions){
				source.setValueState(sap.ui.core.ValueState.None);
				var results = $.grep(regions, function(n){
					return ( ( n.Bland.toLowerCase() === region.toLowerCase()) || ( n.Bland.toLowerCase()+"-"+n.Bezei.toLowerCase() === region.toLowerCase()) );
				});
				if (!results || results.length === 0) {
					results = $.grep(regions, function(n){
						return n.Bezei.toLowerCase() === region.toLowerCase();
					});
				}
				if (!!results && results.length === 1) {
						row.Region = results[0].Bland;
					if (source.getValueState() === sap.ui.core.ValueState.Warning) {
						source.setValueState(sap.ui.core.ValueState.None);
						source.setTooltip();
					}
				    model.setProperty((context) ? context.getPath() : binding.getPath( ),(context) ? row :row.Region);
					found = true;
				}

				if (!found) {
					source.setTooltip( "Entered Region(" + region + ") is not in Master Data.  If this is the correct name, please contact Master Data Management.");
					source.setValueState(sap.ui.core.ValueState.Error);
					return false;
				}
			} else {
				row.Region="";
				source.setTooltip("Please enter Valid Region");
				source.setValueState(sap.ui.core.ValueState.Warning);
				return false;
			}			
			},				
		
			addressHelp=function(event,viewController){
				_onSearchAddress(event,viewController);
			    
			},
			
			_onSearchAddress = function(event,viewController,noPopup) {
				view = viewController.getView( );
				var value = event.getParameter("value");
				if(value === undefined){value = event.getSource().getValue( ); event.getParameters().value = value ;}
				    value = value.toUpperCase();
                if(!busy) {
            		_instantiate_dialogs(viewController);
            		busy = viewController._PartSearchDialog[1];
                }
				busy.open();
				setTimeout(function () {				
		    		var model = core.getModel();
		    		var noData = [];
		    		var addressModel = view.getModel("Address");
		    		model.callFunction("/AddressSearch","GET", {SearchParameter:value},null,
		            	 function(data, response) { //success
		            		if (response.statusCode >= 200 && response.statusCode <= 299) {
		            			addressModel.setData(data.results);
		            		} else {
		            			addressModel.setData(noData);
		            		}
		            		
		            		setTimeout(function () {
								busy.close();
							});
		            	},
					      function(data) { //error
		            		addressModel.setData(noData);
		            		setTimeout(function () {
								busy.close();
							});
						},
						false  // Async
		            );	
		    		
				});
				
				if(!noPopup){
					if(event.getSource().sId === "DeliveryAddressIDH"){
						viewController._addressSearchDialog.attachEventOnce("confirm", null, _onConfirmAddressNumberH);	
					}else{
					viewController._addressSearchDialog.attachEventOnce("confirm", null, _onConfirmAddressNumber);
					}
				    viewController._addressSearchDialog.open(value);
				}
				
			},
			
			_onConfirmAddressNumber=function(event){
				var vc = view.getController() ;
				var addrNumber = event.getParameter("selectedItem").getCells()[0].getText();
				event.getSource( ).getParent( ).getModel("lineItem").setProperty("/AddrNo2",addrNumber);
				event.getSource( ).sId = "AddressNumberSearchForI";
				vc.DetailControllerHelper.getAddressForCustomerOrAddrNumber(event,this.getParent().getController(),"AddrNumber");
			},
			_onConfirmAddressNumberH=function(event){
				var vc = view.getController() ;
				var addrNumber = event.getParameter("selectedItem").getCells()[0].getText();
				event.getSource( ).getParent( ).getModel("currentData").setProperty("/AddrNo2",addrNumber);
				event.getSource( ).sId = "AddressNumberSearchForH";
				vc.DetailControllerHelper.getAddressForCustomerOrAddrNumber(event,this.getParent().getController(),"AddrNumber");
			},
/*            customerHelp=function(event,viewController){
            	getAddressForCustomerOrAddrNumber(event,this,"Customer");	
			};*/
			
            customerHelp=function(event,viewController){
            	_onSearchCustomer(event,viewController);	
			},

    		_onSearchCustomer = function(event,viewController,noPopup) {
				view = viewController.getView( );
				var value = event.getParameter("value");
				if(value === undefined){value = event.getSource().getValue( ); event.getParameters().value = value ;}
				    value = value.toUpperCase();
                if(!busy) {
            		_instantiate_dialogs(viewController);
            		busy = viewController._PartSearchDialog[1];
                }
				busy.open();
				setTimeout(function () {				
		    		var model = core.getModel();
		    		var noData = [];
		    		var customerSearchModel = view.getModel("Customers");
		    		model.callFunction("/CustomersSearch","GET", {SearchParameter:value},null,
		            	 function(data, response) { //success
		            		if (response.statusCode >= 200 && response.statusCode <= 299) {
		            			customerSearchModel.setData(data.results);
		            		} else {
		            			customerSearchModel.setData(noData);
		            		}
		            		
		            		setTimeout(function () {
								busy.close();
							});
		            	},
					      function(data) { //error
		            		customerSearchModel.setData(noData);
		            		setTimeout(function () {
								busy.close();
							});
						},
						false  // Async
		            );	
		    		
				});
				
				if(!noPopup){
					if(event.getSource().sId.search("CustomerValueID") > -1){
						viewController._customerSearchDialog.attachEventOnce("confirm", null, _onConfirmCustomerForHeader);	
					}else if(event.getSource().sId.search("customerShipToEditID") > -1){
						viewController._customerSearchDialog.attachEventOnce("confirm", null, _onConfirmCustomerForCustomerShipToEdit);	
					}else if(event.getSource().sId.search("CustomerDeliveryAddressIDH") > -1){
						viewController._customerSearchDialog.attachEventOnce("confirm", null, _onConfirmCustomerForDeliveryDilaogH)	;
					}					
					else{
					viewController._customerSearchDialog.attachEventOnce("confirm", null, _onConfirmCustomerForDeliveryDilaog);
					}
				    viewController._customerSearchDialog.open(value);
				}
				
			},
			
			_onConfirmCustomerForHeader=function(event){
				var customer = event.getParameter("selectedItem").getCells()[0].getText();
				event.getSource( ).getParent( ).getModel("currentData").setProperty("/Customer",customer);
				event.getSource( ).sId = "CustomersNumberSearchForTabH";
				core.getModel("currentState").setProperty("/anyErrors",false);
			//	getAddressForCustomerOrAddrNumber(event,this.getParent().getController(),"Customer");
			},
			_onConfirmCustomerForDeliveryDilaog=function(event){
				var vc = view.getController( );
				var customer = event.getParameter("selectedItem").getCells()[0].getText();
				event.getSource( ).getParent( ).getModel("lineItem").setProperty("/Customer",customer);
				event.getSource( ).sId = "CustomersNumberSearchForI";
				vc.DetailControllerHelper.getAddressForCustomerOrAddrNumber(event,this.getParent().getController(),"Customer");
			},
			_onConfirmCustomerForDeliveryDilaogH=function(event){
				var vc = view.getController( );
				var customer = event.getParameter("selectedItem").getCells()[0].getText();
				event.getSource( ).getParent( ).getModel("currentData").setProperty("/DeliveryAddress/Customer",customer);
				event.getSource( ).sId = "CustomersNumberSearchForH";
				vc.DetailControllerHelper.getAddressForCustomerOrAddrNumber(event,this.getParent().getController(),"Customer");
			},			
			
			
			
			_onConfirmCustomerForCustomerShipToEdit=function(event){
				var vc = view.getController( );
				var customer = event.getParameter("selectedItem").getCells()[0].getText();
				event.getSource( ).getParent( ).getModel("customerShipToAddress").setProperty("/Customer",customer);
				event.getSource( ).sId = "_customerShipToEditID";
				getAddressForCustomerOrAddrNumber(event,this.getParent().getController(),"Customer");
			},
  
			showTaxJurisdiction = function(event,viewController,deliveryAddress) {
				view = viewController.getView( );
                if(!busy) {
            		_instantiate_dialogs(viewController);
            		busy = viewController._PartSearchDialog[1];
                }
				busy.open();
				setTimeout(function () {				
		    		var model = core.getModel();
		    		var noData = [];
		    		var taxJurisdictionModel = view.getModel("TaxJurisdiction");
		    		model.callFunction("/GetTaxJurisdictionValues","GET", {Country:deliveryAddress.Country,Region:deliveryAddress.Region,PostCode:deliveryAddress.PostCode1},null,
		            	 function(data, response) { //success
		            		if (response.statusCode >= 200 && response.statusCode <= 299) {
		            			taxJurisdictionModel.setData(data.results);
		            			viewController._TaxjurisdictionDialog.open( );
		            		}		            		
		            		setTimeout(function () {
								busy.close();
							});
		            	},
					      function(data) { //error
		            		setTimeout(function () {
								busy.close();
							});
						},
						false  // Async
		            );	
		    		
				});
				
			
               viewController._TaxjurisdictionDialog.attachEventOnce("confirm", null, _onConfirmTaxJurisdiction);

				
			},				
			
			_onConfirmTaxJurisdiction=function(event){
				var city      = event.getParameter("selectedItem").getCells()[2].getText();
				var pocode    = event.getParameter("selectedItem").getCells()[3].getText();
				var txcode    = event.getParameter("selectedItem").getCells()[4].getText();
				var cntrlView = event.getSource( ).getParent( );
				var isHeader  = cntrlView.isHeader;
				var dataModel = (isHeader)? cntrlView.getModel("currentData") :cntrlView.getModel("lineItem");
				var data  = dataModel .getData();
				data.DeliveryAddress.City1       = city;
				data.DeliveryAddress.PostCode1  = pocode;
				data.DeliveryAddress.Taxjurcode = txcode;
				dataModel.setData(data);
				//lineItemModel.refresh(true);

			}	;
			
			
//******************************End*********************************************************
//******************  D E L I V E R Y   A D D R E S S  D I A L O G  ************************
//**************************** Value Helps**************************************************						
		
return {
	partId:partId,
	onSearchMaterial:_onSearchMaterial,
	NwId:NwId,
	onSearchNetworkID:_onSearchNetworkID,
	suggestUom:suggestUom,
	suggestMfr:suggestMfr,
	changeUom:changeUom,
	changeMfr:changeMfr,
	suggestMaterialType:suggestMaterialType,
	changeMaterialType:changeMaterialType,
	suggestMaterialGroup:suggestMaterialGroup,
	changeMaterialGroup:changeMaterialGroup,
	suggestTitle:suggestTitle,
	changeTitle: changeTitle,
	suggestCountry:suggestCountry,
	changeCountry:changeCountry,
	suggestRegion:suggestRegion,
	changeRegion:changeRegion,
	suggestLanguage:suggestLanguage,
	changeLanguage:changeLanguage,
	addressHelp:addressHelp,
	customerHelp:customerHelp,
	searchAddress:_onSearchAddress,
	searchCustomer:_onSearchCustomer,
	showTaxJurisdiction:showTaxJurisdiction

};

	
	
	
})($, sap.ui.getCore(), _,gdt.ui.ps.networkcomp.data.DataContext,sap.ui.getCore().getModel("copies"));