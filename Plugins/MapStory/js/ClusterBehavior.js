
var ClusterBehavior = new Class({

	initialize: function(application) {


		var config = {}
		var renderers = {};

		var colors = {
			"https://sixtiesscoop.geoforms.ca/php-core-app/users_files/user_files_1/Uploads/VE4_dUd_[G]_bgL_[ImAgE].png?thumb=>48>48": '#fd8209',
			"https://sixtiesscoop.geoforms.ca/php-core-app/users_files/user_files_1/Uploads/shv_[ImAgE]_d3r_[G]_g3M.png?thumb=>48>48": '#ffcc02',
			"https://sixtiesscoop.geoforms.ca/php-core-app/users_files/user_files_1/Uploads/7pW_da6_[ImAgE]_[G]_noG.png?thumb=>48>48": '#5daeeb',
		};
		var resolveMapitemType = function(app, id) {

			var type = app.getLayerManager().filterMapitemById(id).getIcon();
			return type;
		}


		var rendererResolver = function(marker, clusterer) {

			var type = resolveMapitemType(application, marker._markerid);
			if (!renderers[type]) {
				renderers[type] = clusterer.addRenderer();
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
					var type = resolveMapitemType(application, cluster.markers_[0]._markerid);

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
