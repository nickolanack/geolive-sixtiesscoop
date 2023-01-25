
callback(StoryGroup.BestCard(new StoryUser(item.getResp())));
return;
                  
                    var story=new StoryUser(item.getResp());
                
                    
                    story.getCards(function(cards){
                        
                        var index=-1;
                        var length=-1;
                        
                        cards.forEach(function(c,i){
                            var l=c.getDescription().length;
                            if(l>length){
                               length=l;
                               index=i;
                            }
                        })
                        
                        callback(cards[index]);
                    });
                    
                 
               


