(new AjaxControlQuery(CoreAjaxUrlRoot, "get_story_with_item", {
                    "plugin": "MapStory",
                    "item": parseInt(document.location.pathname.split('story/').pop().split('/').shift())
                })).addEvent("success", function(storyResp) {
                  
                  //callback(new StoryUser(storyResp));
                   
                   
                   
                    (new AjaxControlQuery(CoreAjaxUrlRoot, "get_attribute_value_list", {
                        "plugin": "Attributes",
                        "itemId":storyResp.features[0].uid,
                        "itemType":"user"
                    })).on("success", function(userResp) {
                      
                       callback(new StoryUser(ObjectAppend_(storyResp, {
                            user:userResp.values[0].entries[0]
                        })));
                       
                    
                    }).on('error',function(){
                       
                       callback(new StoryUser(storyResp));
                       
                       
                    }).execute();
                   
                
                }).execute();
                
                
                
