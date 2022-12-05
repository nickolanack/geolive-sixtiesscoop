var StoryFilter=(function(){



	var isBoolAttributeTrue=function(attr){
		return attr===true||attr==="true";
	}

	var locationDataAttributeContainsCode=function(attr, code){

		if(typeof attr=='string'&&attr[0]==='{'){
			attr=JSON.parse(attr);
		}

		if(!(attr.geocode&&attr.geocode.address_components)){
			return false;
		}


		/**
		{
		    "address_components": [
		       ...
		        {
		            "long_name": "Canada",
		            "short_name": "CA",
		            "types": [
		                "country",
		                "political"
		            ]
		        },
		        ...
		    ],
		    ...
		}
		 */
		
		return attr.geocode.address_components.filter(function(address){

			if(address.short_name.toLowerCase()===code.toLowerCase()){
				return true;
			}

			if(address.long_name.toLowerCase().split(' ').join('_')===code.toLowerCase().split(' ').join('_')){
				return true;
			}

			return false;

		}).length>0;


	};

	var StoryFilter=new Class_({

		initialize:function(){

			this._filter=function(){
				return true;
			};
			this._initFilter=function(cb){
				cb();
			};
			this._hasFilter=false;

		},

		fromUrl:function(){

			var filter=document.location.pathname.split('/filter').pop();
			var stubs=filter.split('/');

			if(stubs.length<2){
				return this;
			}


			var union=stubs.shift().indexOf('any')>=0;

			var sources=[];
			var dests=[];

			stubs.forEach(function(filter){

				if(filter.indexOf('source-')===0){
					sources=sources.concat(filter.split('source-').pop().split('-'));
				}

				if(filter.indexOf('dest-')===0){
					dests=dests.concat(filter.split('dest-').pop().split('-'));
				}


			});


			if(sources.length>0||dests.length>0){
				this._hasFilter=true;

				var storyUsers=[];

				this._initFilter=function(cb){


					(new AjaxControlQuery(CoreAjaxUrlRoot, "get_filter_results", {
						"plugin": "MapStory",
						filter:{
							sources:sources,
							dests:dests
						}
					})).addEvent("success", function(resp) {

						storyUsers=resp.results;
						cb();

					}).addEvent("failure", function(resp) {

						cb();

					}).execute();


				};



				this._filter=function(result){

					if(!(result.features&&result.features.length>0)){
						return false;
					}

					return result.features.filter(function(feature){

						return storyUsers.indexOf(parseInt(feature.uid))>=0;

					}).length>0; //if any feature in story passes filter, return story

					
				}
			}
			return this;
		},
		hasFilter:function(){
			return this._hasFilter;
		},
		filterList:function(list, cb){


			if(this._filter){


				this._initFilter(function(){
					cb(list.filter(this._filter));
				})

				return;
			}

			cb(list);
		}


	});


	return StoryFilter


})();