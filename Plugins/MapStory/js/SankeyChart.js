var SankeyChart = (function() {



	var SankeyChart = new Class_({
		Implements: [Events],

		//dataProvider must implement getData((config)=>void)

		initialize: function(containerEl, dataProvider) {


			var me = this;
			me._containerEl = containerEl;
			me._dataProvider = dataProvider;

			document.head.appendChild(new Element("script", {
				"src": 'https://d3js.org/d3.v3.js',
				"type": "text/javascript",
				"__async": "async",
				"__defer": "defer",
				"onload": function() {

					me._init();
				}
			}));


		},
		getElement: function() {
			return this._containerEl;
		},
		_init: function() {


			var me = this;

			/**
				* From Nadieh Bremer’s tutorial http://bl.ocks.org/nbremer/c11409af47b5950f0289
				* https://stackoverflow.com/questions/28940517/d3-how-to-create-a-circular-flow-sankey-diagram-with-2-arcs
				*/


			var customChordLayout = function() {
				var ε = 1e-6,
					ε2 = ε * ε,
					π = Math.PI,
					τ = 2 * π,
					τε = τ - ε,
					halfπ = π / 2,
					d3_radians = π / 180,
					d3_degrees = 180 / π;
				var chord = {},
					chords, groups, matrix, n, padding = 0,
					sortGroups, sortSubgroups, sortChords;

				function relayout() {
					var subgroups = {},
						groupSums = [],
						groupIndex = d3.range(n),
						subgroupIndex = [],
						k, x, x0, i, j;
					chords = [];
					groups = [];
					k = 0, i = -1;
					while (++i < n) {
						x = 0, j = -1;
						while (++j < n) {
							x += matrix[i][j];
						}
						groupSums.push(x);
						subgroupIndex.push(d3.range(n).reverse());
						k += x;
					}
					if (sortGroups) {
						groupIndex.sort(function(a, b) {
							return sortGroups(groupSums[a], groupSums[b]);
						});
					}
					if (sortSubgroups) {
						subgroupIndex.forEach(function(d, i) {
							d.sort(function(a, b) {
								return sortSubgroups(matrix[i][a], matrix[i][b]);
							});
						});
					}
					k = (τ - padding * n) / k;
					x = 0, i = -1;
					while (++i < n) {
						x0 = x, j = -1;
						while (++j < n) {
							var di = groupIndex[i],
								dj = subgroupIndex[di][j],
								v = matrix[di][dj],
								a0 = x,
								a1 = x += v * k;
							subgroups[di + "-" + dj] = {
								index: di,
								subindex: dj,
								startAngle: a0,
								endAngle: a1,
								value: v
							};
						}
						groups[di] = {
							index: di,
							startAngle: x0,
							endAngle: x,
							value: (x - x0) / k
						};
						x += padding;
					}
					i = -1;
					while (++i < n) {
						j = i - 1;
						while (++j < n) {
							var source = subgroups[i + "-" + j],
								target = subgroups[j + "-" + i];
							if (source.value || target.value) {
								chords.push(source.value < target.value ? {
									source: target,
									target: source
								} : {
									source: source,
									target: target
								});
							}
						}
					}
					if (sortChords) resort();
				}

				function resort() {
					chords.sort(function(a, b) {
						return sortChords((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2);
					});
				}
				chord.matrix = function(x) {
					if (!arguments.length) return matrix;
					n = (matrix = x) && matrix.length;
					chords = groups = null;
					return chord;
				};
				chord.padding = function(x) {
					if (!arguments.length) return padding;
					padding = x;
					chords = groups = null;
					return chord;
				};
				chord.sortGroups = function(x) {
					if (!arguments.length) return sortGroups;
					sortGroups = x;
					chords = groups = null;
					return chord;
				};
				chord.sortSubgroups = function(x) {
					if (!arguments.length) return sortSubgroups;
					sortSubgroups = x;
					chords = null;
					return chord;
				};
				chord.sortChords = function(x) {
					if (!arguments.length) return sortChords;
					sortChords = x;
					if (chords) resort();
					return chord;
				};
				chord.chords = function() {
					if (!chords) relayout();
					return chords;
				};
				chord.groups = function() {
					if (!groups) relayout();
					return groups;
				};
				return chord;
			};
			//d3.stretched.chord.js#
			////////////////////////////////////////////////////////////
			/////////////// Custom Chord Function //////////////////////
			//////// Pulls the chords pullOutSize pixels apart /////////
			////////////////// along the x axis ////////////////////////
			////////////////////////////////////////////////////////////
			///////////// Created by Nadieh Bremer /////////////////////
			//////////////// VisualCinnamon.com ////////////////////////
			////////////////////////////////////////////////////////////
			//// Adjusted from the original d3.svg.chord() function ////
			///////////////// from the d3.js library ///////////////////
			//////////////// Created by Mike Bostock ///////////////////
			////////////////////////////////////////////////////////////

			var stretchedChord = function() {
				var source = d3_source,
					target = d3_target,
					radius = d3_svg_chordRadius,
					startAngle = d3_svg_arcStartAngle,
					endAngle = d3_svg_arcEndAngle,
					pullOutSize = 0;

				var π = Math.PI,
					halfπ = π / 2;

				function subgroup(self, f, d, i) {
					var subgroup = f.call(self, d, i),
						r = radius.call(self, subgroup, i),
						a0 = startAngle.call(self, subgroup, i) - halfπ,
						a1 = endAngle.call(self, subgroup, i) - halfπ;
					return {
						r: r,
						a0: [a0],
						a1: [a1],
						p0: [r * Math.cos(a0), r * Math.sin(a0)],
						p1: [r * Math.cos(a1), r * Math.sin(a1)]
					};
				}

				function arc(r, p, a) {
					var sign = (p[0] >= 0 ? 1 : -1);
					return "A" + r + "," + r + " 0 " + +(a > π) + ",1 " + (p[0] + sign * pullOutSize) + "," + p[1];
				}


				function curve(p1) {
					var sign = (p1[0] >= 0 ? 1 : -1);
					return "Q 0,0 " + (p1[0] + sign * pullOutSize) + "," + p1[1];
				}

				/*
				M = moveto
				M x,y
				Q = quadratic Bézier curve
				Q control-point-x,control-point-y end-point-x, end-point-y
				A = elliptical Arc
				A rx, ry x-axis-rotation large-arc-flag, sweep-flag  end-point-x, end-point-y
				Z = closepath
				                
				M251.5579641956022,87.98204731514328
				A266.5,266.5 0 0,1 244.49937503334525,106.02973926358392
				Q 0,0 -177.8355222451483,198.48621369706098
				A266.5,266.5 0 0,1 -191.78901944612068,185.0384338992728
				Q 0,0 251.5579641956022,87.98204731514328
				Z
				*/
				function chord(d, i) {
					var s = subgroup(this, source, d, i),
						t = subgroup(this, target, d, i);

					return "M" + (s.p0[0] + pullOutSize) + "," + s.p0[1] +
						arc(s.r, s.p1, s.a1 - s.a0) +
						curve(t.p0) +
						arc(t.r, t.p1, t.a1 - t.a0) +
						curve(s.p0) +
						"Z";
				} //chord

				chord.radius = function(v) {
					if (!arguments.length) return radius;
					radius = d3_functor(v);
					return chord;
				};
				chord.pullOutSize = function(v) {
					if (!arguments.length) return pullOutSize;
					pullOutSize = v;
					return chord;
				};
				chord.source = function(v) {
					if (!arguments.length) return source;
					source = d3_functor(v);
					return chord;
				};
				chord.target = function(v) {
					if (!arguments.length) return target;
					target = d3_functor(v);
					return chord;
				};
				chord.startAngle = function(v) {
					if (!arguments.length) return startAngle;
					startAngle = d3_functor(v);
					return chord;
				};
				chord.endAngle = function(v) {
					if (!arguments.length) return endAngle;
					endAngle = d3_functor(v);
					return chord;
				};


				function d3_svg_chordRadius(d) {
					return d.radius;
				}

				function d3_source(d) {
					return d.source;
				}

				function d3_target(d) {
					return d.target;
				}

				function d3_svg_arcStartAngle(d) {
					return d.startAngle;
				}

				function d3_svg_arcEndAngle(d) {
					return d.endAngle;
				}

				function d3_functor(v) {
					return typeof v === "function" ? v : function() {
						return v;
					};
				}

				return chord;

			}

			//stretchedChord
			//script.js#
			////////////////////////////////////////////////////////////
			//////////////////////// Set-up ////////////////////////////
			////////////////////////////////////////////////////////////
			var screenWidth = 1200,
				mobileScreen = (screenWidth > 400 ? false : true);

			var margin = {
					left: 50,
					top: 10,
					right: 50,
					bottom: 10
				},
				width = Math.min(screenWidth, 1200) - margin.left - margin.right,
				height = (mobileScreen ? 300 : Math.min(screenWidth, 800) * 5 / 6) - margin.top - margin.bottom;

			var svg = d3.select(me._containerEl).append("svg")
				.attr("width", (width + margin.left + margin.right))
				.attr("height", (height + margin.top + margin.bottom));


			me.svg = svg;

			var wrapper = svg.append("g").attr("class", "chordWrapper")
				.attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");;

			var outerRadius = Math.min(width, height) / 2 - (mobileScreen ? 80 : 100),
				innerRadius = outerRadius * 0.85,
				pullOutSize = (mobileScreen ? 20 : 50),
				opacityDefault = 0.7, //default opacity of chords
				opacityLow = 0.02; //hover opacity of those chords not hovered over

			////////////////////////////////////////////////////////////
			////////////////////////// Data ////////////////////////////
			////////////////////////////////////////////////////////////

			me._dataProvider.getData(function(config) {

				var sources = config.sources;
				var dests = config.dests;

				me._sources = sources;
				me._dests = dests;

				var matrix = config.matrix;
				var Names = config.Names;
				me._names = Names;
				var respondents = config.total;

				var makeColorMap = function(map, defaultColor) {
					return function(name) {

						if (name === "") {
							return "none";
						}

						if (typeof map == 'function') {
							var c = map.apply(null, arguments);
							if (!c) {
								c = defaultColor;
							}
							return c;
						}

						if (!map[name]) {
							return defaultColor;
						}

						return map[name];

					}
				}

				var _arcColorMap = makeColorMap(
					config.arcColor || config.colorMap,
					config.defaultArcColor || config.defaultColor || "#C4C4C4"
				);
				var _cordColorMap = makeColorMap(
					config.cordColor || config.colorMap,
					config.defaultCordColor || config.defaultColor || "#A4A4A4"
				);



				var clickFn = config.click ? function(d, i) {

					var type = 'source';
					if (i < dests.length) {
						type = 'dest'
					}

					config.click.apply(null, ([Names[i], type]).concat(arguments));

					me.fireEvent('select', [i]);


				} : false;



				(function() {
					/**
						* Selection Behavior
						*/

					var selection = [];

					me._clearSelection = function() {

						if (selection.length) {
							selection = [];
							me.fireEvent('selectionChanged', [selection.slice(0)]);
						}

					};

					me.on('select', function(i) {

						var index = selection.indexOf(i);
						if (index == -1) {
							selection.push(i);
							me.fireEvent('selectionChanged', [selection.slice(0)]);
							return;
						}

						selection.splice(index, 1);
						me.fireEvent('selectionChanged', [selection.slice(0)]);

					});

				})();



				me.on("selectionChanged", function(indexes) {


					if (indexes.length === 0) {

						me.allCords()
							.style('fill', function(d, i) {
								return _cordColorMap(me.getNameAt(d.target.index), d, i);
							});


						me.allArcs()
							.style('opacity', function(d, i) {
								return 1;
							})


						return;
					}


					me.allCords().style('fill', function(d, i) {
						if (me.cordIsIn(d, indexes)) {
							return _cordColorMap(me.getNameAt(d.target.index), d, i);
						}

						if (me.cordIsNotIn(d, indexes)) {
							return "#C4C4C4";
						}

					});

					me.allArcs()
						.style('opacity', function(d, i) {

							if (me.indexIsIn(i, indexes)) {
								return 1;
							}
							if (me.indexIsNotIn(i, indexes)) {
								return 0.2;
							}
						})



				});


				var emptyPerc = 0.4; //What % of the circle should become empty
				var emptyStroke = Math.round(respondents * emptyPerc);

				matrix[dests.length][Names.length - 1] = emptyStroke;
				matrix[Names.length - 1][dests.length] = emptyStroke;


				// [
				// 	[0,0,0,0,10,5,15,0], //X
				// 	[0,0,0,0,5,15,20,0], //Y
				// 	[0,0,0,0,15,5,5,0], //Z
				// 	[0,0,0,0,0,0,0,emptyStroke], //Dummy stroke
				// 	[10,5,15,0,0,0,0,0], //C
				// 	[5,15,5,0,0,0,0,0], //B
				// 	[15,20,5,0,0,0,0,0], //A
				// 	[0,0,0,emptyStroke,0,0,0,0] //Dummy stroke
				// ];
				//Calculate how far the Chord Diagram needs to be rotated clockwise to make the dummy
				//invisible chord center vertically
				var offset = (2 * Math.PI) * (emptyStroke / (respondents + emptyStroke)) / 4;

				//Custom sort function of the chords to keep them in the original order
				function customSort(a, b) {
					return 1;
				};

				//Custom sort function of the chords to keep them in the original order
				var chord = customChordLayout() //d3.layout.chord()//Custom sort function of the chords to keep them in the original order
					.padding(.02)
					.sortChords(d3.descending) //which chord should be shown on top when chords cross. Now the biggest chord is at the bottom
					.matrix(matrix);

				var arc = d3.svg.arc()
					.innerRadius(innerRadius)
					.outerRadius(function() {

						return outerRadius;

					})
					.startAngle(startAngle) //startAngle and endAngle now include the offset in degrees
					.endAngle(endAngle);

				var path = stretchedChord()
					.radius(innerRadius)
					.startAngle(startAngle)
					.endAngle(endAngle)
					.pullOutSize(pullOutSize);

				////////////////////////////////////////////////////////////
				//////////////////// Draw outer Arcs ///////////////////////
				////////////////////////////////////////////////////////////

				var g = wrapper.selectAll("g.group")
					.data(chord.groups)
					.enter().append("g")
					.attr("class", "group")
					.on("mouseover", me._createFadeFn(opacityLow))
					.on("mouseout", me._createFadeFn(opacityDefault));

				if (clickFn) {
					g.on("click", clickFn);
					g.attr("class", "group clickable");
				}



				g.append("path")
					.style("stroke", function(d, i) {

						return _arcColorMap(Names[i], d, i);

					})
					.style("fill", function(d, i) {

						return _arcColorMap(Names[i], d, i);

					})
					.style("pointer-events", function(d, i) {
						return (Names[i] === "" ? "none" : "auto");
					})
					.attr("d", arc)
					.attr("transform", function(d, i) { //Pull the two slices apart
						d.pullOutSize = pullOutSize * (d.startAngle + 0.001 > Math.PI ? -1 : 1);
						return "translate(" + d.pullOutSize + ',' + 0 + ")";
					});


				////////////////////////////////////////////////////////////
				////////////////////// Append Names ////////////////////////
				////////////////////////////////////////////////////////////

				//The text also needs to be displaced in the horizontal directions
				//And also rotated with the offset in the clockwise direction
				g.append("text")
					.each(function(d) {
						d.angle = ((d.startAngle + d.endAngle) / 2) + offset;
					})
					.attr("dy", ".35em")
					.attr("class", "titles")
					.attr("text-anchor", function(d) {
						return d.angle > Math.PI ? "end" : null;
					})
					.attr("transform", function(d, i) {
						var c = arc.centroid(d);
						return "translate(" + (c[0] + d.pullOutSize) + "," + c[1] + ")" +
							"rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
							"translate(" + 55 + ",0)" +
							(d.angle > Math.PI ? "rotate(180)" : "")
					})
					.text(function(d, i) {
						return Names[i];
					});

				////////////////////////////////////////////////////////////
				//////////////////// Draw inner chords /////////////////////
				////////////////////////////////////////////////////////////

				var chords = wrapper.selectAll("path.chord")
					.data(chord.chords)
					.enter().append("path")
					.attr("class", "chord")
					.style("stroke", "none")
					.style("fill", function(d) {

						return _cordColorMap(me.getNameAt(d.target.index), d, i);


					})
					.style("opacity", function(d) {
						return (Names[d.source.index] === "" ? 0 : opacityDefault);
					}) //Make the dummy strokes have a zero opacity (invisible)
					.style("pointer-events", function(d, i) {
						return (Names[d.source.index] === "" ? "none" : "auto");
					}) //Remove pointer events from dummy strokes
					.attr("d", path);

				////////////////////////////////////////////////////////////
				///////////////////////// Tooltip //////////////////////////
				////////////////////////////////////////////////////////////

				//Arcs
				g.append("title")
					.text(function(d, i) {
						return Math.round(d.value) + " people in " + Names[i];
					});

				//Chords
				chords.append("title")
					.text(function(d) {
						return [Math.round(d.source.value), " people from ", Names[d.target.index], " to ", Names[d.source.index]].join("");
					});



				////////////////////////////////////////////////////////////
				////////////////// Extra Functions /////////////////////////
				////////////////////////////////////////////////////////////

				//Include the offset in de start and end angle to rotate the Chord diagram clockwise
				function startAngle(d) {
					return d.startAngle + offset;
				}

				function endAngle(d) {
					return d.endAngle + offset;
				}



			});

		},


		clearSelection: function() {

			if (this._clearSelection) {
				this._clearSelection();
				return;
			}

			console.warn('selection behavior not active');

		},


		getNameAt: function(i) {
			return this._names[i];
		},



		allCords: function() {
			return this.svg.selectAll("path.chord");
		},

		allArcs: function() {
			return this.svg.selectAll("g.group path");
		},


		cordIsIn: function(d, indexes) {
			return (indexes.indexOf(d.source.index) >= 0 || indexes.indexOf(d.target.index) >= 0) && this.getNameAt(d.source.index) !== "";
		},

		cordIsNotIn: function(d, indexes) {
			return (indexes.indexOf(d.source.index) == -1 && indexes.indexOf(d.target.index) == -1) && this.getNameAt(d.source.index) !== "";
		},


		indexIsIn(i, indexes) {
			return indexes.indexOf(i) >= 0 && this.getNameAt(i) !== "";
		},
		indexIsNotIn(i, indexes) {
			return indexes.indexOf(i) == -1 && this.getNameAt(i) !== "";
		},


		isSource: function(index) {
			return !this.isDest(index);
		},

		isDest: function(index) {
			return this._dests.length > index;
		},


		_createFadeFn: function(opacity) {
			var me = this;
			return function(d, i) {
				me.svg.selectAll("path.chord")
					.filter(function(d) {
						return d.source.index !== i && d.target.index !== i && me.getNameAt(d.source.index) !== "";
					})
					.transition("fadeOnArc")
					.style("opacity", opacity);
			};
		}



	});


	SankeyChart.FilterLabelFromUrl = function() {

		var sources=window.location.pathname.split('source-').pop().split('/').shift().split('-').filter(function(a){ return a&&a!=''; });
		var dests=window.location.pathname.split('dest-').pop().split('/').shift().split('-').filter(function(a){ return a&&a!=''; });
		
		if(sources.length==0&&dests.length==0){
			return null;
		}


		var el=new Element('span');


		UIDispersionData.Get(function(){


			var filterLabels=[];


			if(sources.length>0){

				sources=sources.map(function(code){
					return UIDispersionData.Get().getProvinceNameForCode(code);
				});

				if(sources.length>1){
					sources.push('or '+sources.pop());
				}

				filterLabels.push(''+sources.join(', ')+' as the origin location');
			}

			if(dests.length>0){

				dests=dests.map(function(code){
					return UIDispersionData.Get().getProvinceNameForCode(code);
				});

				if(dests.length>1){
					dests.push('or '+dests.pop());
				}

				filterLabels.push(''+dests.join(', ')+' as the destination');

			}

			el.innerHTML='Showing filter results for stories with '+filterLabels.join('; or ')

		});

		return el;

	};


	SankeyChart.AddFilterLinks = function(sankey) {


		var chart = sankey.getElement();

		var resultsLink = null;
		var reset = chart.appendChild(new Element('button', {
			"class": "btn reset hidden",
			html: "Reset",
			events: {
				click: function() {
					sankey.clearSelection()
				}
			}
		}));


		var mapLink='';
		var resultsLink='';


		var viewIndex = chart.appendChild(new Element('button', {
			"class": "btn view-list hidden",
			html: "View Results",
			events: {
				click: function() {
					window.location=resultsLink;
				}
			}
		}));


		var viewMap = chart.appendChild(new Element('button', {
			"class": "btn view-map hidden",
			html: "View Map",
			events: {
				click: function() {
					window.location=mapLink;
				}
			}
		}));

		sankey.on('selectionChanged', function(selection) {



			if (resultsLink && selection.length == 0) {
				resultsLink.parentNode.removeChild(resultsLink);
				resultsLink = null;
				reset.addClass("hidden");
				viewIndex.addClass("hidden");
				viewMap.addClass("hidden");
				return;
			}

			reset.removeClass("hidden");
			viewIndex.removeClass("hidden");
			viewMap.removeClass("hidden");

			if (!resultsLink) {
				resultsLink = chart.appendChild(new Element('span', {
					"class": "markdown template-content"
				}));
			}


			var sources = selection.filter(function(i) {
				return sankey.isSource(i);
			}).map(function(i) {
				return sankey.getNameAt(i);
			})

			var dests = selection.filter(function(i) {
				return sankey.isDest(i);
			}).map(function(i) {
				return sankey.getNameAt(i);
			});


			var toStrong = function(name) {
				return '<strong>' + name + '</strong>';
			};

			var toCodes = function(name) {
				return UIDispersionData.Get().getProvinceCodeForName(name).split(' ').join('_');
			};

			var toCodeStubs = function(prefix, names) {
				return names.length == 0 ? '' : prefix + names.map(toCodes).join('-').toLowerCase();
			};

			var str = [];
			if (sources.length > 0) {
				str.push("Selected origin province" + (sources.length === 1 ? "" : "s") + ": " + sources.map(toStrong).join(", ") + "");
			}

			if (dests.length > 0) {
				str.push("Selected destination province" + (dests.length === 1 ? "" : "s") + ": " + dests.map(toStrong).join(", ") + "");
			}

			mapLink='/map/filter-any' + toCodeStubs('/source-', sources) + toCodeStubs('/dest-', dests);
			resultsLink='/story-index/filter-any' + toCodeStubs('/source-', sources) + toCodeStubs('/dest-', dests);

			resultsLink.innerHTML = '<p>' + str.join("; ") + '<br/>' +
				'<a href="' + mapLink + '"><strong>View selection on the map</strong></a>' +
				'<br/>' +
				'<a href="' + resultsLink + '"><strong>List stories</strong></a></p>';

		});

	};


	return SankeyChart;

})();