callback([]);



                 (new AjaxControlQuery(CoreAjaxUrlRoot, "list_stories", {
                        "plugin": "MapStory",
                    })).on("success", function(resp) {
                        
                       callback(resp.results.map(function(item){
                           return new MockDataTypeItem(item);
                       }))
                    
                    }).on('error',function(){
                       

                       
                    }).execute();