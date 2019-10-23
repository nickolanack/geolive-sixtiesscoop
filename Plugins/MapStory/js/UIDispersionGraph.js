var UIDispersionGraph = (function() {



	return new Class({
		Implements: [Events],
		initialize: function(map, tile, control) {

			var me = this;

			me._tile = tile;
			me._map = map;
			me._control = control;

			var active = false;


			me._initStyles()



			var legends = {};



			var getLineData = function(result, code) {

				var data = {
					coordinates: [result.locationData.coordinates, result.nextLocationData.coordinates],
					geodesic: true,
					lineColor: "#ff0000",
					lineWidth: 3
				};


				code = code || me._getCode(result);
				Object.append(data, me._lineData[code]);


				return data;
			};



			tile.addEvent('click', function() {

				map.resetView();
				me._emptyLayers();
				me._removeTiles();


				if (active) {
					active = false;
					me.forEachMapLayer(function(layer) {
						layer.show();
					});
					tile.deactivate();
					me.fireEvent('deactivate');
					return;
				}
				active = true;
				me.fireEvent('activate');
				tile.activate();

				me.forEachMapLayer(function(layer) {
					layer.hide();
				});

				me._getProvinceCodes().forEach(function(code){ me.addLegend(code); });

				(new AjaxControlQuery(CoreAjaxUrlRoot, "get_dispersion_graph", {
					"plugin": "MapStory"
				})).addEvent("success", function(resp) {


					resp.results.forEach(function(result) {

						if (!(result.locationData && result.nextLocationData)) {
							return;
						}

						var code = me._getCode(result);
						var data = getLineData(result, code);

						var line = new GeoliveLine(new google.maps.Polyline({
							strokeColor: data.lineColor || MapFactory.COLOR,
							strokeOpacity: data.lineOpacity || MapFactory.OPACITY,
							strokeWeight: data.lineWidth || MapFactory.WIDTH,
							clickable: !!(data.clickable || true),
							geodesic: !!(data.geodesic || false),
							path: data.coordinates.map(function(c) {
								return new google.maps.LatLng(c[0], c[1]);
							})
						}), data);


						
						line.setLayer(me.getLayer(code));
						me.addLegend(code);


					});


				}).execute();

			});



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

			Object.keys(me._legends).forEach(function(key){
				if(me._tile.hasTile(me._legends[key])){
					me._tile.removeTile(me._legends[key]);
				}
			});

		},

		focusLayers: function() {

			var me = this;
			var layers=me.getLayers().filter(function(l){
					return l.isVisible();
				});

			if(layers.length){
				var bounds=SpatialCalculator.calculateBounds(layers);
				if(bounds.south==Infinity){
					return;
				}
				me._map.fitBounds(bounds);
			}
			
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
				(layer||me.getLayer(code)).show();
				return;
			}

			layer=layer||me.getLayer(code);

			var subtile = new UIMapSubTileButton(me._tile, {
				"class": "province from-" + (code.toLowerCase()),
				toolTip: {
					description: code
				}
			});



			
			layer.addEvent('visibilityChanged',function(visible){
				if(visible){
					subtile.enable();
					return;
				}
				subtile.disable();
					
			});
			layer.addEvent('visibilityChanged',function(){
				me.focusLayers();
			});

			subtile.addEvent('click', function() {

				me.fireEvent('selectCode', [code]);

				if(layer.isVisible()){
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

		_getCode: function(result) {
			var me = this;
			var provinceCodes = me._getProvinceCodes();
			var componenets = result.locationData.geocode.address_components;
			for (var i = 0; i < componenets.length; i++) {

				if (provinceCodes.indexOf(componenets[i].short_name) >= 0) {
					return componenets[i].short_name;
				}
			}
			throw 'Not found';

		},
		getProviceCodeItems:function(){
			var me=this;
			return me._getProvinceCodes().map(function(code){
				return {
					getTitle:function(){ 
						return code;
					},
					getCount:function(){ 
						return me.getLayer(code).getItemsCount();
					}
				}
			})
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

				"#006d2c",
				"#31a354",
				"#74c476",

				"#bae4b3",

				"#fd8d3c",
				"#fc4e2a",
				"#e31a1c",
				"#bd0026",
				"#800026",

				"#dd1c77",
				"#df65b0",
				"#c994c7",

				"#d4b9da"

			];

		}


	});



})();