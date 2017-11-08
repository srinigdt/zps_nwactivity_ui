/* global _:true */
/* global gdt:true */
$.sap.declare("gdt.ui.ps.networkcomp.data.DataContext");
$.sap.require("gdt.ui.ps.networkcomp.data.DataService");
$.sap.require("sap.ui.core.Core");
$.sap.require("gdt.ui.ps.networkcomp.lib.underscore-min");

gdt.ui.ps.networkcomp.data.DataContext = (function($, core, _, dataservice) {
	    var entitySet = function(idname, foreignKey, nullKey, getFunction, loadFunction, getByForeignKeyFunction, updateFunction, createFunction, removeFunction, neverLocal,sendFunction) {
	        var _items = {},
				_failedGets = {},
	        	_requests = [],
	        	_emptySets = [],
	            _add = function(newObj, key) {
	        		if (!newObj && !key){ return;}
	        		if (!!nullKey && ($.type(idname) === "string") && !!newObj && (newObj[idname] === nullKey)){ return;}
					if (!key) {
						if ($.type(idname) === "string") {
							key = newObj[idname];
						} else {
							key = "";
							_.each(idname, function (part) {
								key += ((Boolean(newObj[part])) ? newObj[part] : "");
							});
						}
					}

					if (Boolean(newObj)) {
						_items[key] = newObj;
						_failedGets[key] = false;
					} else {
						_failedGets[key] = true;
					}
	            },
	            _remove = function(id) {
	            	var key = id;
	            	
	            	if (!key){ return;}
	            	if ($.type(id) !== "string") {
						if ($.type(idname) === "string") {
							key = id[idname];
						} else {
							key = "";
							_.each(idname, function(part) { key += ((Boolean(id[part])) ? id[part] : ""); });
						}
	            	}
	            	
	            	delete _items[key];
	            },
				isKnownBad = function(id) {
					var key = id;

					if (!key){ return false;}

					if ($.type(id) !== "string") {
						if ($.type(idname) === "string") {
							key = id[idname];
						} else {
							key = "";
							_.each(idname, function(part) { key += ((Boolean(id[part])) ? id[part] : ""); });
						}
					}
					return Boolean(_failedGets[key]) ? true : false;
				},
	            getLocal = function(id) {
					var key = id;

					if (!key){ return null;}

					if ($.type(id) !== "string") {
						if ($.type(idname) === "string") {
							key = id[idname];
						} else {
							key = "";
							_.each(idname, function(part) { key += ((Boolean(id[part])) ? id[part] : ""); });
						}
					}
	                return Boolean(_items[key]) ? jQuery.extend(true, {}, _items[key]) : null;
	            },
	            getLocalByForeignKey = function(key) {
	            	if (!key){ return [];}
	            	if (!foreignKey){ return [];}
	            	
	            	return _.map(_.filter(_items, function(item){ 
			            		return item[foreignKey] === key; 
			            	}), function (item) {
	            				return jQuery.extend(true, {}, item);
	            	});
	            },
	            getAllLocal = function() {
	                return _.toArray(_items);
	            },
	            get = function(id, forceRefresh) {
                    if (Boolean(neverLocal)){ forceRefresh = true;}
	                return $.Deferred(function(def) {
	                    var result = null,
							key = null,
	                    	req = null;

						if ($.type(idname) === "string") {
							key = id;
						} else {
							key = "";
							_.each(idname, function(part) {
								key += ((Boolean(id[part])) ? id[part] : "");
							});
						}

						result = getLocal(key);

						req = _requests[key];
	                    
	                    if (!!result && forceRefresh) {
	                    	_remove(result);
	                    	result = null;
	                    }
	                    
	                    if (Boolean(result)) {  // Not force refresh and result local so we"re done!
	                    	def.resolve(result);
	                    	return;
	                    }
	
	                    // The result isn"t local or we forced a refresh

	                    if (Boolean(req)) { // Already attempting to load this so resolve/reject based on that promise
	                    	req.done(function (res) {
	                    		def.resolve(res);
	                    	}).fail(function (response) {
	                    		def.reject(response);
	                    	});
	                    	return;
	                    }
	                    
	                    // Ok have to go get it...
	                    
	                    _requests[key] = def; // Queue the request so we don"t duplicate.
	                    
	                    
	                    if (!getFunction) {
	                    	def.reject("Get function not defined");
	                    	return;
	                    }
	                    
                        getFunction(id).done(function(data) {
                        		_add(data, key);
                                def.resolve(data);
                            }).fail(function(response) {
                                console.log(response);
                                def.reject(response);
                            }).always(function() {
								delete _requests[key];
							});
	                }).promise();
	            },
	            
     
	            getByForeignKey = function(key, forceRefresh) {
	                return $.Deferred(function(def) {
	                    var results = getLocalByForeignKey(key),
	                    	req = _requests[foreignKey+key];
	                    
	                    if (!!results && results.length > 0 && forceRefresh) {
	                    	_.each(results, function(result) { _remove(result); });
	                    	results = [];
	                    } else {
	                    	if (forceRefresh && !!_emptySets[foreignKey+key]) {
	                    		delete _emptySets[foreignKey+key];
	                    	}
	                    }
	                    
	                    if (!foreignKey) {
	                    	def.reject("Foreign key not defined");
	                    	return;
	                    }

	                    if (!!results && results.length > 0) {  // Not force refresh and result local so we"re done!
	                    	def.resolve(results);
	                    	return;
	                    }
	
	                    // The result isn"t local or we forced a refresh

	                    if (Boolean(req)) { // Already attempting to load this so resolve/reject based on that promise
	                    	req.done(function () {
	                    		def.resolve();
	                    	}).fail(function (response) {
	                    		def.reject(response);
	                    	});
	                    	return;
	                    }
	                    
	                    // Ok have to go get it...
	                    
	                    if (forceRefresh){ delete _emptySets[foreignKey+key];}
	                    
	                    if (Boolean(_emptySets[foreignKey+key])) {
	                    	def.resolve([]);
	                    	return;
	                    }
	                    
	                    _requests[foreignKey+key] = def; // Queue the request so we don"t duplicate.
	                    	                    
	                    if (!getByForeignKeyFunction) {
	                    	def.reject("Get by foreign key function not defined");
	                    	return;
	                    }
	                    
	                    getByForeignKeyFunction(key).done(function(data) {
	                    		if (!data || data.length === 0) {
// MG Disable for now, causes issues when we get a bad read attempt after saving
// 	                    			_emptySets[foreignKey+key] = true;
	                    		} 
                        		_.each(data, function(result) {
                        			_add(result);
                        			});
                                def.resolve();
                        		delete _requests[foreignKey+key];
                            }).fail(function(response) {
                                console.log(response);
                                def.reject(response);
							}).always(function() {
								delete _requests[foreignKey+key];
							});
                	}).promise();	            
                },
	            load = function(id) {
	                return $.Deferred(function(def) {
	                    if (!loadFunction) {
	                        console.error("Load function not defined");
	                        def.reject("Load function not defined");
	                        return;
	                    }
	
	                    loadFunction(id).done(function(results) {
	                    		_.each(results, function(result, idx) {
									var key = null;
									if (!!id && ($.type(id) !== "string")) {
										key = "";
										_.each(id[idx], function(part) { key += ((Boolean(part)) ? part : "");});
									}
		                    		_add(result, key);
	                    		});
	                            def.resolve();
	                        }).fail(function(response) {
	                            def.reject(response);
	                        });
	                }).promise();
	            },
	            update = function(updatedObj) {
	                return $.Deferred(function(def) {
	                    if (!updateFunction) {
	                        console.error("Update function not defined");
	                        def.reject("Update function not defined");
	                        return;
	                    }
	
	                    updateFunction(updatedObj).done(function(data) {
	                    		_add(data);
	                            def.resolve(data);
	                        }).fail(function(response) {
	                            console.log(response);
	                            def.reject(response);
	                        });
	                }).promise();
	            },
	            create = function(newObj) {
	                return $.Deferred(function(def) {
	                    if (!createFunction) {
	                        console.error("Create function not defined");
	                        def.reject("Create function not defined");
	                        return;
	                    }
	
	                    createFunction(newObj).done(function(data) {
	                            def.resolve(data);
	                        }).fail(function(response) {
	                            console.log(response);
	                            def.reject(response);
	                        });
	                }).promise();
	            },
	            remove = function(id) {
	                return $.Deferred(function(def) {
	                    if (!removeFunction) {
	                        console.error("Remove function not defined");
	                        def.reject("Remove function not defined");
	                        return;
	                    }
	
	                    removeFunction(id).done(function(data) {
	                    		_remove(id);
	                            def.resolve(data);
	                        }).fail(function(response) {
	                            console.log(response);
	                            def.reject(response);
	                        });
	                }).promise();
	            },
	            
	            send = function(content){
	            	return $.Deferred(function(def) {
	                    if (!sendFunction) {
	                        console.error("send function not defined");
	                        def.reject("send function not defined");
	                        return;
	                    }
	
	                    sendFunction(content).done(function(data) {
	                            def.resolve(data);
	                        }).fail(function(response) {
	                            console.log(response);
	                            def.reject(response);
	                        });
	                }).promise();	            	
	            	
	            	
	            };
	            
	            
	        return {
	            create: create,
				isKnownBad: isKnownBad,
	            getAllLocal: getAllLocal,
	            getLocal: getLocal,
	            getLocalByForeignKey: getLocalByForeignKey,
	            get: get,
	            getByForeignKey: getByForeignKey,
	            load: load,
	            remove: remove,
	            update: update,
	            send:send
	        };
	    },        
	    //----------------------------------
	    // Repositories
	    //----------------------------------

/*
		variant = new entitySet("VariantID","Vbtyp", null, dataservice.variant.get, dataservice.variant.load, null, dataservice.variant.update, dataservice.variant.create, dataservice.variant.remove, true,null),*/
	    EmailNotification = new entitySet("MailContent", null, null,null,null, null, null, null, null,null,dataservice.EmailNotification.send),
	    userprefs = new entitySet("UserID", null, null,null, dataservice.userprefs.load, null, null, null, null,null),
	    nwActivityCompH = new entitySet(["NetworkId", "ActivityId","ComponentId"],null, null, dataservice.activityHeader.get, dataservice.activityHeader.load, null, dataservice.activityHeader.update, dataservice.activityHeader.create, dataservice.activityHeader.remove, true,null),
        materials = new entitySet(["CustomerID", "ManufacturerID", "MaterialID", "MfrPartID"], null, null, dataservice.materials.get, dataservice.materials.load, null, null, null, null,null),		
        Customer = new entitySet("CustomerNo", null, null, dataservice.customerInfo.get, dataservice.customerInfo.load, null, null, null, null,null),
        deliveryAddress = new entitySet(["Customer", "Addrnumber"],null, null, dataservice.deliveryAddress.get, dataservice.deliveryAddress.load, null, dataservice.deliveryAddress.update, dataservice.deliveryAddress.create, dataservice.deliveryAddress.remove, true,null),
        
        
		datacontext = {
	    EmailNotification:EmailNotification,
	    userprefs: userprefs,
		nwactivitcomph:nwActivityCompH,
		materials:materials,
		customer:Customer,
		deliveryAddress:deliveryAddress
	};
	
	return datacontext;

})($,sap.ui.getCore(),_, gdt.ui.ps.networkcomp.data.DataService);