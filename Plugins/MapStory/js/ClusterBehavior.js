
var ClusterBehavior = new Class({

	initialize: function(application) {


		var config = {}
		var renderers = {};

		var colors = {
			"https://sixtiesscoop.geoforms.ca/php-core-app/users_files/user_files_1/Uploads/VE4_dUd_[G]_bgL_[ImAgE].png?thumb=>48>48": '#fd8209',
			"https://sixtiesscoop.geoforms.ca/php-core-app/users_files/user_files_1/Uploads/shv_[ImAgE]_d3r_[G]_g3M.png?thumb=>48>48": '#ffcc02',
			"https://sixtiesscoop.geoforms.ca/php-core-app/users_files/user_files_1/Uploads/7pW_da6_[ImAgE]_[G]_noG.png?thumb=>48>48": '#5daeeb',
		};
		var resolveMapitemType = function(id) {

			var marker=resolveMapitem(id);
			var type = resolveMapitem(id).getIcon();

			//var colorTypes=Object.keys(colors);

			if(typeof colors[type] !='undefined'){
				return type;
			}

			var info=marker.getNamedValue('info')
			if(info&&typeof info['icon']!="undefined"&&typeof colors[info['icon']] !='undefined'){
				return info['icon'];
			}

			return '';


		}

		var resolveMapitem = function(id) {

			return application.getLayerManager().filterMapitemById(id);
		}


		var rendererResolver = function(marker, clusterer) {

			var type = resolveMapitemType(marker._markerid);
			if (!renderers[type]) {
				renderers[type] = clusterer.addRenderer();

				google.maps.event.addListener(renderers[type], 'clusterclick', function(clusterer, markers) {

					var markers=markers.map(function(marker){
						return  marker._markerid;
					});


					(new AjaxControlQuery(CoreAjaxUrlRoot, 'get_stories_with_items', {
						'plugin': 'MapStory',
						'items': markers
					})).addEvent('success', function(resp) {

						//me.setResponse(resp);
						ScoopStories.setCardGroup((new AdvancedStorySearch({
							"shouldPadCards":false,
							"backNavigationLabel":"Back to selected items"
						})).setResponse(resp), function() {});

					}).execute();


					//ScoopStories.setCardGroup((new AdvancedStorySearch({})).setResponse(aggregator.getLastResponse()), function() {});

				});
			}
			return renderers[type];

		};
		application.setClusterRendererResolver(rendererResolver);

		application.getLayerManager().getLayers().forEach(function(layer) {
			layer.hide();
			layer.getRenderer().setMarkerRendererResolverFn(
				function(marker, renderer) {
					return rendererResolver(marker, layer.getRenderer());
				});
			layer.show();
			//layer.show();
		});


		if (window.Cluster) {
			window.Cluster.Symbol = ClusterSymbol;
			window.ClusterSymbol.IconScale = function(sum) {
				return 20 + (5 * Math.log(sum) / Math.log(2));
			};
			window.ClusterSymbol.IconStyle = function(name) {
				//expect to be bound to ClusterSymbol object

				var color = "rgb(0, 160, 80)";
				var cluster = this.cluster_;
				if (cluster && cluster.markers_ && cluster.markers_.length) {
					var type = resolveMapitemType(cluster.markers_[0]._markerid);

					if (Object.keys(colors).indexOf(type) >= 0) {
						color = colors[type];
					} else {
						console.log(type);
					}
				}

				return {
					path: google.maps.SymbolPath.CIRCLE,
					fillColor: color,
					fillOpacity: 0.7,
					strokeWeight: 1.5,
					strokeColor: color,
					labelOrigin: google.maps.Point(0, 0)
				};

			};

		}

	}


});
