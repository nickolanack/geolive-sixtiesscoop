var ScoopStories={
        getCurrentCards:function(callback){
            
            callback([
                new OriginCard({}),  
                //new StoryCard({}),
                new AddCard({})
            ]);
            
        }
    }

    var StoryCard=new Class({
        Extends: DataTypeObject,
		Implements: [Events],
		initialize: function(config) {
		    var me=this;
		    me.type = "Route.card";
			me._id = config.id||-1;
			me._config=JSON.parse(JSON.stringify(config));
			
			me.getConfig=function(){
			    return JSON.parse(JSON.stringify(me._config));
			};
			me.getAddress=function(){
			    return me.getLatlng();
			};
			
    		(["name", "description", "latlng"]).forEach(function(k){
    		    me["_"+k]=config[k]||"{"+k+"}";
    		    me["set"+k.capitalize()]=function(v){
    		         me["_"+k]=v;
    		    };
    		    me["get"+k.capitalize()]=function(){
    		         return me["_"+k];
    		    }
    		    
    		});
			
		}
    
     
    });
    
    var OriginCard=new Class({
        Extends: StoryCard
    });
    
    var AddCard=new Class({
       Extends: MockDataTypeItem,
       getAddress:function(){return false;}
    });
    
 
    
    
