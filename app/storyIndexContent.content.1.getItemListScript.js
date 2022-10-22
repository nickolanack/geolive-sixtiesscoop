callback([]);



                 (new AjaxControlQuery(CoreAjaxUrlRoot, "list_stories", {
                        "plugin": "MapStory",
                        "limit":limit
                    })).on("success", function(resp) {
                        
                       callback(resp.results.map(function(item){
                           return new StoryGroup({
                               type:item.features[0].name,
                               description:"",
                               cards:[],
                               id:item.id
                               
                           });
                       }))
                    
                    }).on('error',function(){
                       

                       
                    }).execute();