(new AjaxControlQuery(CoreAjaxUrlRoot, "get_story_with_item", {
                    "plugin": "MapStory",
                    "item": parseInt(document.location.pathname.split('story/').pop().split('/').shift())
                })).addEvent("success", function(resp) {
                  
                   callback((new StoryUser(resp)).getRealCardsSync());
                
                }).execute();