/* global _:true */
/* global gdt:true */
jQuery.sap.declare("gdt.ui.ps.networkcomp.util.EmailHelper");
$.sap.require("sap.ui.core.Core");
$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");
$.sap.require("gdt.ui.ps.networkcomp.data.DataContext");

gdt.ui.ps.networkcomp.util.EmailHelper = (function($, core, _, datacontext, view) {

	var emailMasterData = function(event, v) {
			view = v;
			var dialog = event.getSource().getParent().getParent(),
				isMailTab = (event.getSource().getId().search("mailComposeSendMail") < 0) ? false : true,
				model = (isMailTab) ? "mailComposeLines" : "importErrors",
				material = view.getModel(model).getData(),
				extNotes = (isMailTab) ? view.byId("ExtNotesM").getValue() : core.byId("ExtNotes").getValue(),
				body = "",
				i = 0,
				l = 0;

			l = (Boolean(material)) ? material.length : 0;

			for (i = 0; i < l; i++) {
				if (material[i].Mfrpn.length === 0) {
					continue;
				}
				if (material[i].LongMatlDesc === undefined) {
					material[i].LongMatlDesc = "";
				}
				body += "No #:" + material[i].ItemNumber;
				body += "MFRPN:" + material[i].Mfrpn;
				body += "MATNR:" + material[i].Material;
				body += "STEXT:" + material[i].MatlDesc;
				body += "MEINS:" + material[i].BaseUom;
				body += "LTEXT:" + material[i].LongMatlDesc;
				body += "MFRNR:" + material[i].Manufacturerno;
				body += "MTART:" + material[i].MatlType;
				body += "MATKL:" + material[i].MatlGroup + "\n";
			}

			if (body.length === 0) {
				sap.m.MessageToast.show("No Manufacturer Parts found. Please enter Part IDs");
				return;
			}

			if ((extNotes) && extNotes.length !== 0) {
				body += "Note:\n";
				body += extNotes;
			}
			if (!isMailTab) {
				dialog.close();
			}

			//sap.m.URLHelper.triggerEmail("masterdata@gdt.com","Missing Material",body); 
			//var emailUri = sap.m.URLHelper.normalizeEmail("masterdata@gdt.com","Missing Material",body); 
			//var urlHelper = window.open(emailUri, body);
			//var urlHelper = window.open(emailUri);
			//urlHelper.close();

			_sendMailFromSAP(body, true);
			if (isMailTab) {
				view.getModel("currentState").setProperty("/isMailCompose", false);
				material.length = 0;
				view.getModel(model).setData(material);
			}
		},

		_sendMailFromSAP = function(MailBodyContent, refresh) {
			var deferred = $.Deferred(function(defer) {
				datacontext.EmailNotification.send(MailBodyContent, refresh).done(function(data) {
					defer.resolve();
				}).fail(function(msg) {
					defer.reject(msg);
				});
			}).done(function() {
				sap.m.MessageToast.show("Mail has been sent successfully");
			}).fail();

			return deferred;
		};

	return {
		emailMasterData: emailMasterData
	};

})($, sap.ui.getCore(), _, gdt.ui.ps.networkcomp.data.DataContext);