

    if(lastItems&&lastItems.length>=6){
         callback(lastItems);
         return;
    }

    // var defaultList=[
    //     new MockDataTypeItem({name:"##Example 1"}), 
    //     new MockDataTypeItem({name:"##Example 2"}), 
    //     new MockDataTypeItem({name:"##Example 2"})
    // ];

    console.log('cache');

	(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "featuredStoriesItems",
		'field': "featured"
	})).addEvent('success',function(response){
	    
	       var list=[];
	       var count=0;
	       var check=function(){
	           if(list.filter(function(item){
	               return !!item;
	           }).length==count){
	               callback(list);
	           }
	       };
	       
	       
	       var limit=listModule.options.maxItems;
	    
	      response.value.slice(0,limit).forEach(function(featured, i){
	           
	           //if(data.name){
	           //    data.name='##'+data.name;
	           //}
	           
	           featured.card=featured.card||1;
	           count++;
	           
                (new AjaxControlQuery(CoreAjaxUrlRoot, "get_story_with_item", {
                    "plugin": "MapStory",
                    "item": featured.id
                })).addEvent("success", function(resp) {
                  
                    var item = new MockDataTypeItem(ObjectAppend_(
                         {mutable:true, name:"##Item "+i, story:null, cards:null}, 
                         featured,
                         {resp:resp}
                    ));
	           
    	             list[i]=item;
    	             check();
                
                 
                    
                }).execute();
	           
	          
	       });
	       
	       
	       response.value.slice(limit).forEach(function(featured, i){
	           
	           i=i+3;
	           
	           //if(data.name){
	           //    data.name='##'+data.name;
	           //}
	           
	           count++;
	           
	           var item = new MockDataTypeItem(ObjectAppend_(
                         {mutable:true, name:"##Item "+i, story:null, cards:null}, 
                         featured,
                         {resp:null}
                    ));
	           
    	       list[i]=item;
    	       check();
	           setTimeout(function(){
	               
	           
                    (new AjaxControlQuery(CoreAjaxUrlRoot, "get_story_with_item", {
                        "plugin": "MapStory",
                        "item": featured.id
                    })).addEvent("success", function(resp) {
                        item.setResp(resp);
                    }).execute();
                    
	           }, Math.round(500+Math.random()*1000));
	           
	          
	       });
	       
           
	       
	    
        //callback(list.concat(defaultList).slice(0,3));
        
	}).execute();




