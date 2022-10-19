

    var defaultList=[
        new MockDataTypeItem({name:"##Example 1"}), 
        new MockDataTypeItem({name:"##Example 2"}), 
        new MockDataTypeItem({name:"##Example 2"})
    ];



	(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "featuredStoriesItems",
		'field': "featured"
	})).addEvent('success',function(response){
	    
	       var list;
	       var check=function(){
	           
	       };
	    
	       list=response.value.map(function(data, i){
	           
	           if(data.name){
	               data.name='##'+data.name;
	           }
	           
	           var item = new MockDataTypeItem(ObjectAppend_({mutable:true, name:"##Item "+i, story:null}, data));
	           
	           (new AjaxControlQuery(CoreAjaxUrlRoot, "get_story_with_item", {
                    "plugin": "MapStory",
                    "item": 335
                })).addEvent("success", function(resp) {
                  
                    item.setStory(new StoryUser(resp));
                    check();
                    
                }).execute();
                
	           
	           return item;
	       });
	       
           
	       
	    
        callback(list.concat(defaultList).slice(0,3));
        
	}).execute();




