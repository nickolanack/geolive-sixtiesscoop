

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
	           if(list.filter(function(item){
	               return !!item;
	           }).length==3){
	               callback(list);
	           }
	       };
	       
	    
	       ([{id:369, card:2}, {id:312, card:1}, {id:62, card:1}]).forEach(function(featured, i){
	           
	           //if(data.name){
	           //    data.name='##'+data.name;
	           //}
	           
	           var item = new MockDataTypeItem(ObjectAppend_({mutable:true, name:"##Item "+i, story:null, cards:null}, featured));
	           
	            (new AjaxControlQuery(CoreAjaxUrlRoot, "get_story_with_item", {
                    "plugin": "MapStory",
                    "item": featured.id
                })).addEvent("success", function(resp) {
                  
                    var story=new StoryUser(resp);
                    item.setStory(story);
                    
                    story.getCards(function(cards){
                        item.setCards(cards);
                        list[i]=item; //cards[featured.card];
                        check();
                        
                    });
                    
                    
                }).execute();
                
	       });
	       
           
	       
	    
        //callback(list.concat(defaultList).slice(0,3));
        
	}).execute();




