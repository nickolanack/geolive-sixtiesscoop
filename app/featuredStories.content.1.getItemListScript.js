

    // var defaultList=[
    //     new MockDataTypeItem({name:"##Example 1"}), 
    //     new MockDataTypeItem({name:"##Example 2"}), 
    //     new MockDataTypeItem({name:"##Example 2"})
    // ];



	(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "featuredStoriesItems",
		'field': "featured"
	})).addEvent('success',function(response){
	    
	       var list=[];
	       var check=function(){
	           if(list.length==3){
	               callback(list);
	           }
	       };
	       
	    
	       ([335, 312, 307]).forEach(function(id, i){
	           
	           //if(data.name){
	           //    data.name='##'+data.name;
	           //}
	           
	           var data = {};
	
	           
	           var item = new MockDataTypeItem(ObjectAppend_({mutable:true, name:"##Item "+i, story:null}, data));
	           
	            (new AjaxControlQuery(CoreAjaxUrlRoot, "get_story_with_item", {
                    "plugin": "MapStory",
                    "item": id
                })).addEvent("success", function(resp) {
                  
                    var story=new StoryUser(resp);
                    item.setStory(story);
                    
                    story.getCards(function(cards){
                        
                        list.push(cards[2]);
                        check();
                        
                    });
                    
                    
                }).execute();
                
	       });
	       
           
	       
	    
        //callback(list.concat(defaultList).slice(0,3));
        
	}).execute();




