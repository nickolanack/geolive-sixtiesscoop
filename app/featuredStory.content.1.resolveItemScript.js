

 (new AjaxControlQuery(CoreAjaxUrlRoot, "get_story_with_item", {
                    "plugin": "MapStory",
                    "item": item.getId()
                })).addEvent("success", function(resp) {
                  
                    var story=new StoryUser(resp);
                
                    
                    story.getCards(function(cards){
                        callback(cards[item.getCard()]);
                    });
                    
                 
                    
                }).execute();


