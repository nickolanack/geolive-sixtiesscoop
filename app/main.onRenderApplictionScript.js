GetWidget("mainStyle")->display($targetInstance);
GetWidget("registerFormView")->display($targetInstance);
GetWidget("loginFormView")->display($targetInstance);
GetWidget("profileFormView")->display($targetInstance);


IncludeJSBlock('

    var StoryCard=new Class({
        Extends: DataTypeObject,
		Implements: [Events],
		initialize: function(config) {
		    var me=this;
		    me.type = "Route.card";
			me._id = config.id||-1
			
    		(["name", "description", "latlng"]).forEach(function(k){
    		    me["_"+k]=config[k]||"{"+k+"}";
    		    me["set"+k.capitalize()]=function(v){
    		         me["_"+k]=v;
    		    };
    		    me["get"+k.capitalize()]=function(){
    		         return me["_"+k];
    		    }
    		    
    		})
			
		}
    
     
    });



');


HtmlDocument()->META(HtmlDocument()->website(), 'base');




