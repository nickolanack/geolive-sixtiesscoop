callback([]);



                 (new AjaxControlQuery(CoreAjaxUrlRoot, "list_stories", {
                        "plugin": "MapStory",
                    })).on("success", function(resp) {
                        
                       callback(resp.results.map(function(item){
                           return new StoryGroup({
                               type:item.features[0].name,
                               description:"",
                               cards:[]
                               
                           });
                       }))
                    
                    }).on('error',function(){
                       

                       
                    }).execute();