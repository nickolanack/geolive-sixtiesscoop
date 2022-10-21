(new AjaxControlQuery(CoreAjaxUrlRoot, "get_story_with_item", {
                    "plugin": "MapStory",
                    "item": parseInt(document.location.pathname.split('story/').pop().split('/').shift())
                })).addEvent("success", function(resp) {
                  
                   callback(new StoryUser(resp));
                   
                   
                   
                    (new AjaxControlQuery(CoreAjaxUrlRoot, "get_attribute_value_list", {
                        "plugin": "Attributes",
                        "itemId":resp.features[0].uid,
                        "itemType":"User"
                    })).addEvent("success", function(resp) {
                      
                       
                    
                    }).execute();
                   
                
                }).execute();
                
                
                
