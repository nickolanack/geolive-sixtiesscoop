var query;

var isClientsStory=document.location.pathname.split('/').pop()==='me'||document.location.pathname.split('/').pop()==='edit'&&document.location.pathname.indexOf('me/edit')>0;

if(isClientsStory){
    
    query=new AjaxControlQuery(CoreAjaxUrlRoot, "get_story", {
        "plugin": "MapStory"
    }); 
    
    
}else{
   
    query=new AjaxControlQuery(CoreAjaxUrlRoot, "get_story_with_item", {
        "plugin": "MapStory",
        "item": parseInt(document.location.pathname.split('story/').pop().split('/').shift())
    }); 
    
}






query.addEvent("success", function(storyResp) {
                  
                  //callback(new StoryUser(storyResp));
                   
                   
                   
                    (new AjaxControlQuery(CoreAjaxUrlRoot, "get_attribute_value_list", {
                        "plugin": "Attributes",
                        "itemId":isClientsStory?AppClient.getId():storyResp.features[0].uid,
                        "itemType":"user"
                    })).on("success", function(userResp) {
                        
                        if(!userResp.success){
                             callback(new StoryUser(storyResp));
                             return;
                        }
                      
                       callback(new StoryUser(ObjectAppend_(storyResp, {
                            user:userResp.values[0].entries[0]
                        })));
                       
                    
                    }).on('error',function(){
                       
                       callback(new StoryUser(storyResp));
                       
                       
                    }).execute();
                   
                
                }).execute();
                
                
                
