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
			}

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
				this._filter=function(result){

					return result.features.filter(function(feature){

						if(!isBoolAttributeTrue(feature.attributes.movesOutOfProvince)){
							return false;
						}


						if(sources.length>0){
							if(sources.filter(function(source){

								return locationDataAttributeContainsCode(feature.attributes.locationData, source);

							}).length>0){
								return true;
							}
						}

						if(dests.length>0){
							if(dests.filter(function(dest){

								return locationDataAttributeContainsCode(feature.attributes.locationDataNext, dest);

							}).length>0){
								return true;
							}
						}


					}).length>0; //if any feature in story passes filter, return story

					
				}
			}
			return this;
		},
		filterList:function(list, cb){


			if(this._filter){
				cb(list.filter(this._filter));
				return;
			}

			cb(list);
		}


	});


	return StoryFilter


})();