setTimeout(function(){
    
         var data={"result": [
               
               ([60, 61, 62]).map(function(yr){
                  
                  return  {"value": 
                      item.getProviceCodeItems().slice(0,4).map(function(item){
                          return {"product.name": item.getTitle(), "result": Math.floor(Math.random() * Math.floor(10))};
                      }), 
               "timeframe": {"start": (1900+yr)+"-01-01T00:00:00.000Z", "end": (1900+yr+1)+"-01-01T00:00:00.000Z"}};
                   
               })
               
               ]}
    
callback(data);
}, 100);

