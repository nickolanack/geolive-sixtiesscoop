setTimeout(function(){
callback(
    
        
           {"result": [
               
               ([60, 61, 62, 63, 64, 65, 66]).map(function(yr){
                  
                  return  {"value": 
                      item.getProviceCodeItems().map(function(item){
                          return {"province": item.getTitle(), "result": Math.floor(Math.random() * Math.floor(50))};
                      }), 
               "timeframe": {"start": (1900+yr)+"-01-01T00:00:00.000Z", "end": (1900+yr+1)+"-01-01T00:00:00.000Z"}};
                   
               })
               
               ]}
          
        
    
);
}, 100);

