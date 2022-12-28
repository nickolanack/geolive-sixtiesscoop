callback([]);

                 var filter=(new StoryFilter()).fromUrl();

                 (new AjaxControlQuery(CoreAjaxUrlRoot, "list_stories", {
                        "plugin": "MapStory",
                        "limit":filter.hasFilter?null:limit
                    })).on("success", function(resp) {
                        
                       filter.filterList(resp.results, function(list){
                           
                           callback(list.map(function(item, i){
                           
                            if(!item.features){
                                return new MockDataTypeItem(item);
                            }
                           
                            return new StoryGroup({
                               type:item.features[0].name,
                               description:"",
                               cards:[],
                               id:item.features[0].id
                               
                           });
                       }))
                           
                       });
                        
                        
                       
                    
                    }).on('error',function(){
                       

                       
                    }).execute();