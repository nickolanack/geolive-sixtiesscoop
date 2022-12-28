var UIDispersionData = (function(){

	/**
	 * this class should be used as a singleton. use static UIDispersionData.Get or UIDispersionData.GetData 
	 */

	var UIDispersionData = new Class_({
		Implements:[Events],
		initialize:function(){

			var me=this;

			(new AjaxControlQuery(CoreAjaxUrlRoot, "get_dispersion_graph", {
				"plugin": "MapStory"
			})).addEvent("success", function(resp) {

				me._data=resp.results;




				var _name=function(data){
			       if(me.getCountry(data.geocode)==='Canada'){
			          me.getProvince(data.geocode);
			       }
			    };
		
			    me._data.forEach(function(res){
			       
			       _name(res.locationData);
			       _name(res.nextLocationData);
			      
			    });





				me._loaded=true;
				me.fireEvent('load');

			}).execute();

			this._options={};


			this._initStyles();


		},
		setOptions:function(options){
			this._options=ObjectAppend_(this._options, options);
		},
		getOptions:function(){
			return this._options;
		},
		_initStyles: function() {
			var me = this;

			me._lineData = {};

			me._getProvinceCodes().forEach(function(code, i) {

				me._lineData[code] = {
					"lineColor": me._getColor(i)
				};

			})



			me._styles = {};

			me._getProvinceCodes().forEach(function(code) {
				me._styles[code] = {
					"background-color": me._lineData[code].lineColor
				}
			});

		},
		runOnceOnLoad:function(cb){

			if(this._loaded){
				cb(this);
				return;
			}

			var me=this;
			this.once('load', function(){
				cb(me);
			});

		},
		getLineData:function(code){
			return this._lineData[code];
		},
		getData:function(cb){

			if(cb){

				this.runOnceOnLoad(function(me){
					cb(me._data, me);
				})
			}

			if(!this._data){
				throw 'UIDispersionData not ready, pass callback to this method for async'
			}

			return this._data
		},

		getCode: function(result) {
			return this._getCode(result);
		},

		getCountry:function(locationData){
			return locationData.address_components.filter(function(comp){
	            return comp.types.indexOf('country')>=0
	        }).shift().long_name;
		},

		getProvinceCode:function(locationData){
			return locationData.address_components.filter(function(comp){
	            return comp.types.indexOf('administrative_area_level_1')>=0
	        }).shift().long_name;
		},
		
		getProvince:function(locationData){
			var p= locationData.address_components.filter(function(comp){
	            return comp.types.indexOf('administrative_area_level_1')>=0
	        }).shift();

	        if(!this._provinces){
				this._provinces={}
			}
	       
	       this._provinces[p.long_name]=p.short_name;
	       
	       return p.long_name;
		},

		_getCode: function(result) {
			var me = this;
			var provinceCodes = me._getProvinceCodes();
			var componenets = result.locationData.geocode.address_components;
			for (var i = 0; i < componenets.length; i++) {

				if (provinceCodes.indexOf(componenets[i].short_name) >= 0) {
					return componenets[i].short_name;
				}
			}
			throw 'Not found: '+code;

		},

		getProvinceCodes: function() {
			return this._getProvinceCodes();
		},


		_getProvinces: function() {

			return [

				"BC",
				"AB",
				"SK",
				"MB",
				"YT",
				"NT",
				"NU",

				"NS",

				"PE",
				"NB",
				"NL",
				"QC",
				"ON"

			];

		},
		

		_getProvinceCodes: function() {

			return [

				"BC",
				"AB",
				"SK",
				"MB",
				"YT",
				"NT",
				"NU",

				"NS",

				"PE",
				"NB",
				"NL",
				"QC",
				"ON"

			];

		},
		_getColor: function(i) {
			return this._getColors()[i];
		},
		_getColors: function() {

			return [


				'#a50026',
				'#f46d43',
				'#4575b4',
				'#313695',
				'#762a83',
				'#1b7837',
				'#de77ae',
				'#8c510a',
				'#35978f',
				'#fee391',
				'#bdbdbd',
				'#737373',
				'#9e9ac8'
				// ,


				// "#006d2c",
				// "#31a354",
				// "#74c476",

				// "#bae4b3",

				// "#fd8d3c",
				// "#fc4e2a",
				// "#e31a1c",
				// "#bd0026",
				// "#800026",

				// "#dd1c77",
				// "#df65b0",
				// "#c994c7",

				// "#d4b9da"

			];

		},
		getProviceCodeItems: function() {
			var dispersion = this;
			return dispersion._getProvinceCodes().map(function(code) {
				return new (new Class_({
					formatChart: function(chart, callback) {

						chart.view.colors[0] = dispersion.getColor(code);
						chart.title(this.getTitle());
						var el = $(chart.view.el);
						el.addEvent('click', function() {

							
						});

						var opts=dispersion.getOptions().chartOptions||{};

						if(opts.height){
							chart.height(opts.height);
						}

						this.getCount(function(number) {
							callback({ result: number });
						});

					},
					getTitle: function() {
						return code;
					},
					getCount: function(callback) {

						if(typeof this._lastCount!='number'){
							 this._lastCount=0;
						}

						


						if (callback) {

							var me=this;
							dispersion.getData(function(results){
								
								me._lastCount=results.filter(function(result){
									return dispersion._getCode(result)===code;
								}).length;

								callback(me._lastCount);
							});

						
						}

						return this._lastCount
					}
				}))
			})
		},


		getProvinceCodeForName:function(fullName){

			if(this._provinces&&this._provinces[fullName]){
				return this._provinces[fullName];
			}
			return fullName;

		},

		getProvinceNameForCode:function(code){

			if(this._provinces){

				var fullNames=Object.keys(this._provinces).filter(function(fullName){
					return this._provinces[fullName]===code;
				});

				if(fullNames.length>0){
					return fullNames.shift();
				}
			}
			return code;

		},


		getCordDiagramMatrix:function(){

			var dispersion=this;

			return new (new Class_({

				getData:function(cb){


					var me=this;


					 UIDispersionData.GetData(function(results){
                        
        			    var sources=[];
        			    var dests=[];


        			    var provinces={};
        			    dispersion._provinces=provinces;

        			    var countries={};
        			        
        			    /*
        			     * deprecated functions: use dispersion.getCountry, dispersion.getProvinceCode, dispersion.getProvince
        			     */

        			    var _country=function(geo){
        			       return geo.address_components.filter(function(comp){
        			            return comp.types.indexOf('country')>=0
        			        }).shift().long_name;
        			    }
        			    
        			    var _provinceCode=function(geo){
        			       return geo.address_components.filter(function(comp){
        			            return comp.types.indexOf('administrative_area_level_1')>=0
        			        }).shift().long_name;
        			    }

        			    var _province=function(geo){
        			       var p= geo.address_components.filter(function(comp){
        			            return comp.types.indexOf('administrative_area_level_1')>=0
        			        }).shift();
        			       
        			       provinces[p.long_name]=p.short_name;
        			       
        			       return p.long_name;
        			    }
        			    
        			    var _name=function(data){
        			        var name=_country(data.geocode);
        			       if(name==='Canada'){
        			           name=_province(data.geocode);
        			       }
        			       return name;
        			    }
        			     
        			    var _matrix=[];
        			    
        			    //var results=resp.results;//.slice(0,2);
        			    
        			    results.forEach(function(res){
        			       
        			       var sourceName=_name(res.locationData);
        			       
        			       if(sources.indexOf(sourceName)==-1){
        			           sources.push(sourceName);
        			       }
        			       
        			       
        			       var destName=_name(res.nextLocationData);
        			      
        			       
        			       if(dests.indexOf(destName)==-1){
        			           dests.push(destName);
        			       }
        			       
        			     
        			        
        			    });
        			    
        			    
        			   

                    	var colorMap=function(name, d, i){

                    		if(provinces[name]){
                    			return dispersion.getColor(provinces[name]);
                    		}
                    		return null;
                    	};
        			    
        			    sources=sources.sort().reverse();
        			    dests=dests.sort(function(a,b){


        			    	if(provinces[a]&&!provinces[b]){
        			    		return -1;
        			    	}
        			    	if(provinces[b]&&!provinces[a]){
        			    		return 1;
        			    	}

        			    	return a.localeCompare(b);
        			    });
        			    
        			    
                    				
        			    
        			    
        			    var _Names=dests.concat([""], sources, [""]);
        			    
        			    _Names.forEach(function(name, si){
        			        
        			           _matrix[si]=[];
        			           for(var i=0;i<_Names.length;i++){
        			               _matrix[si].push(0);
        			           }
        			        
        			    });
        			    
        			    var _respondents = 0
        			    results.forEach(function(res){
        			        var sourceName=_name(res.locationData);
        			        var destName=_name(res.nextLocationData);
        			        
        			       var si=sources.indexOf(sourceName)+dests.length+1;
        			       var di=dests.indexOf(destName)//+sources.length+1;
        			       _matrix[si][di]++;
        			       _matrix[di][si]++
        			       _respondents++;
        			        
        			    });
        			    
        			    
        		         
                        
                    
                    
                        var Names = _Names;
                        
                        var respondents = _respondents;//95, //Total number of respondents (i.e. the number that makes up the total group)
                       
                        	
                        var matrix = _matrix;


                        cb({

                        	sources:sources,
                        	dests:dests,

                        	matrix:matrix,
                        	Names:Names,
                        	total:respondents,

                        	arcColor:colorMap,
                        	cordColor:colorMap,

                        	defaultCordColor:"#C4C4C4",
                        	defaultArcColor:"#555555",
                        	click:function(d, i){

                        		console.log(d);

                        	}

                        });


                    })
	
	


				}
			}));



		},

		getColor:function(code){
			return  this._lineData[code].lineColor;
		}

	});


	var shared=null;

	UIDispersionData.Get=function(cb, options){


		if(!shared){
			shared=new UIDispersionData();
		}

		
		 if(cb){
		 	shared.runOnceOnLoad(function(){
		 		if(options){
					shared.setOptions(options);
				}
		 		cb(shared);
		 	});
		 }
		 if(options){
			shared.setOptions(options);
		}
		 return shared;

	};

	UIDispersionData.GetData=function(cb, options){

		if(cb){
			UIDispersionData.Get(function(udata){
				if(options){
					udata.setOptions(options);
				}
				udata.getData(cb);
			});
			return;
		}


		if(!shared){
			throw 'UIDispersionData not ready, ass callback to this method for async'
		}

		if(options){
			shared.setOptions(options);
		}

		return shared.getData();

	}


	return UIDispersionData;


})();


var UIDispersionGraph = (function() {






	/**
	 * TODO: decouple map, tile, control
	 */


	return new Class({
		Implements: [Events],
		initialize: function(map, tile, control) {

			var me = this;

			me._tile = tile;
			me._map = map;
			me._control = control;

			me._active = false;

			if(tile){
				tile.addEvent('click', me.toggle.bind(me));
			}

		},
		_getLineData: function(result, code) {

			var me=this;

			var data = {
				coordinates: [result.locationData.coordinates, result.nextLocationData.coordinates],
				geodesic: true,
				lineColor: "#ff0000",
				lineWidth: 3
			};

			try{
				code = code || UIDispersionData.Get().getCode(result);
				Object.append(data, UIDispersionData.Get().getLineData(code));
			}catch(e){
				//most likely out of canada 
			}

			return data;
		},
		isActive:function(){
			return this._active;
		},

		toggle: function() {

			var me=this;

			me._map.resetView();
			me._emptyLayers();
			me._removeTiles();


			if (me._active) {
				me._active = false;
				me.forEachMapLayer(function(layer) {
					layer.show();
				});
				me._tile.deactivate();
				me.fireEvent('deactivate');
				return;
			}
			me._active = true;
			me.fireEvent('activate');
			me._tile.activate();

			me.forEachMapLayer(function(layer) {
				layer.hide();
			});


			// me._getProvinceCodes().forEach(function(code){ me.addLegend(code); });
			// 
			


			UIDispersionData.GetData(function(results, dispersion){


				results.forEach(function(result) {

					if (!(result.locationData && result.nextLocationData)) {
						return;
					}

					try{
						var code = dispersion.getCode(result);
					}catch(e){
						console.error('skip item. out of canada?');
						return;
					}
					var data = me._getLineData(result)//, code);

					var lineSymbol = {
					  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
					};

					var line = new GeoliveLine(new google.maps.Polyline({
						strokeColor: data.lineColor || MapFactory.COLOR,
						strokeOpacity: data.lineOpacity || MapFactory.OPACITY,
						strokeWeight: data.lineWidth || MapFactory.WIDTH,
						clickable: !!(data.clickable || true),
						geodesic: !!(data.geodesic || false),
						path: data.coordinates.map(function(c) {
							return new google.maps.LatLng(c[0], c[1]);
						}),
						icons: [{
				            icon: lineSymbol,
				            offset: '100%'
				          }]
					}), data);



					line.setLayer(me.getLayer(code));

					// me.addLegend(code);

					me.fireEvent('addLine.' + code, [line, code]);


				});


			});

		},

		getProviceCodeItems: function() {
			var me = this;

			dispersion = UIDispersionData.Get();

			return dispersion.getProvinceCodes().map(function(code) {
				return new (new Class_({
					formatChart: function(chart, callback) {

						chart.view.colors[0] = dispersion.getColor(code);
						chart.title(this.getTitle());
						var el = $(chart.view.el);
						el.addEvent('click', function() {

							var layer = me.getLayer(code);
							if (layer.isVisible()) {
								el.addClass('layer-hidden');
								layer.hide();
								return;
							}
							el.removeClass('layer-hidden');
							layer.show();
						});

						this.getCount(function(number) {
							callback({ result: number });
						});

					},
					getTitle: function() {
						return code;
					},
					getCount: function(callback) {

						if (callback) {

							var updateCount = function() {

								if (me["_interval" + code]) {
									clearInterval(me["_interval" + code]);
									delete me["_interval" + code];
								}

								me["_interval" + code] = setTimeout(function() {
									delete me["_interval" + code];
									callback(me.getLayer(code).getItemsCount());
								}, 100);
							}
							updateCount();

							me.addEvent('addLine.' + code, updateCount);
							me.addEvent('deactivate:once', function() {
								me.removeEvent('addLine.' + code, updateCount);
							});

							return;
						}

						return me.getLayer(code).getItemsCount();
					}
				}))
			})
		},

		forEachMapLayer: function(cb) {
			var me = this;
			me._map.getLayerManager().getLayers().forEach(function(layer) {

				if (me.getLayers().indexOf(layer) >= 0) {
					return;
				}
				cb(layer);
			});
		},

		
		_emptyLayers: function() {
			var me = this;

			me.getLayers().forEach(function(layer) {
				layer.getItems().forEach(function(item) {
					layer.removeItem(item);
				});
			});
		},
		_removeTiles: function() {
			var me = this;

			if (!me._legends) {
				me._legends = {};
			}

			Object.keys(me._legends).forEach(function(key) {
				if (me._tile.hasTile(me._legends[key])) {
					me._tile.removeTile(me._legends[key]);
				}
			});

		},

		focusLayers: function() {

			var me = this;
			if (me._focusTimeout) {
				clearTimeout(me._focusTimeout);
				delete me._focusTimeout;
			}
			me._focusTimeout = setTimeout(function() {
				delete me._focusTimeout;
				var layers = me.getLayers().filter(function(l) {
					return l.isVisible();
				});

				if (layers.length) {
					var bounds = SpatialCalculator.calculateBounds(layers);
					if (bounds.south == Infinity) {
						return;
					}
					me._map.fitBounds(bounds);
				}

			}, 100);


		},

		getLayers: function() {

			var me = this;

			if (!me._adoptionLayers) {
				me._adoptionLayers = {};
			}

			var me = this;
			return Object.keys(me._adoptionLayers).map(function(k) {
				return me._adoptionLayers[k];
			});

		},

		getLayer: function(code) {

			var me = this;

			if (!me._adoptionLayers) {
				me._adoptionLayers = {};
			}

			if (!me._adoptionLayers[code]) {
				var layer = new BaseLayer(me._map.getLayerManager(), {
					name: code + ': Adoption Lines',
					id: 9999000 + (Object.keys(me._adoptionLayers).length)
				});
				me._map.getLayerManager().addLayer(layer);
				me._adoptionLayers[code] = layer;
			}

			return me._adoptionLayers[code];

		},

		addLegend: function(code, layer) {
			var me = this;

			if (!me._legends) {
				me._legends = {};
			}

			if (me._legends[code]) {
				me._tile.addTile(me._legends[code]);
				(layer || me.getLayer(code)).show();
				return;
			}

			layer = layer || me.getLayer(code);

			var subtile = new UIMapSubTileButton(me._tile, {
				"class": "province from-" + (code.toLowerCase()),
				toolTip: {
					description: code
				}
			});




			layer.addEvent('visibilityChanged', function(visible) {
				if (visible) {
					subtile.enable();
					return;
				}
				subtile.disable();

			});
			layer.addEvent('visibilityChanged', function() {
				me.focusLayers();
			});

			subtile.addEvent('click', function() {

				me.fireEvent('selectCode', [code]);

				if (layer.isVisible()) {
					layer.hide();
					return;
				}
				layer.show();
			})

			subtile.getElement().firstChild.setAttribute('data-province', code);
			if (me._styles[code]) {
				subtile.getElement().firstChild.setStyles(me._styles[code]);
			}

			me._legends[code] = subtile;
		},

		
		
		


	});



})();