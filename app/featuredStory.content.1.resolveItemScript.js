

                  
                    var story=new StoryUser(item.getResp());
                
                    
                    story.getCards(function(cards){
                        callback(cards[item.getCard()]);
                    });
                    
                 
               


