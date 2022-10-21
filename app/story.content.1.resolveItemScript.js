(new AjaxControlQuery(CoreAjaxUrlRoot, "get_story_with_item", {
                    "plugin": "MapStory",
                    "item": parseInt(document.location.pathname.split('story/').pop().split('/').shift())
                })).addEvent("success", function(resp) {
                  
                  //callback(new StoryUser(resp));
                   
                   
                   
                    (new AjaxControlQuery(CoreAjaxUrlRoot, "get_attribute_value_list", {
                        "plugin": "Attributes",
                        "itemId":resp.features[0].uid,
                        "itemType":"user"
                    })).on("success", function(resp) {
                      
                       callback(new StoryUser(ObjectAppend_(resp, {
                            user:resp.values.entries[0]
                        })));
                       
                    
                    }).on('error',function(){
                       
                       callback(new StoryUser(resp));
                       
                       
                    }).execute();
                   
                
                }).execute();
                
                
                
