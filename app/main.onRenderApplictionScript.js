GetWidget("mainStyle")->display($targetInstance);
GetWidget("registerFormView")->display($targetInstance);
GetWidget("loginFormView")->display($targetInstance);
GetWidget("profileFormView")->display($targetInstance);
GetWidget("addCardView")->display($targetInstance);
GetWidget("addStoryFormView")->display($targetInstance);



IncludeJSBlock('


    var ScoopStories={
        getCurrentCards:function(callback){
            
            callback([
                new OriginCard({}),  
                new StoryCard({}),
                new AddCard({}),
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
       Extends: MockDataTypeItem
    });
    
    
    



');


HtmlDocument()->META(HtmlDocument()->website(), 'base');




