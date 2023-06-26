
var el=new Element('button',{"class":"featured-link"+(AppClient.getUserType()!=='admin'?' hidden':' clickable'), events:{"click":function(){
    
    if(AppClient.getUserType()!=='admin'){
        return;
    }
    
    (new AjaxControlQuery(CoreAjaxUrlRoot, "user_function", {
		'widget': "toggleFeatured",
		'item':item.id,
	})).addEvent('success',function(response){
	    console.log(response);
	}).execute(); 
    
    
}}});


var p = new UIPopover(el, {
        description:'This is a featured story',
        anchor:UIPopover.AnchorAuto()
    });

(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "featuredStoriesItems",
		'field': "featured"
	})).addEvent('success',function(response){
	    
	    console.log(response);
	    console.log(item);
	    
	    var ids=response.value.map(function(item){
	        return parseInt(item.id);
	    });
	    
	    if(item._storyData.filter(function(s){
	        return ids.indexOf(parseInt(s.id))>=0;
	    }).length){
	        
	        el.addClass('active');
	        el.removeClass('hidden');
	            
	        if(AppClient.getUserType()==='admin'){
	            p.setDescription('Remove from featured stories');
	        }
	        
	        return;
	    }
	    
	    if(AppClient.getUserType()==='admin'){
	        p.setDescription('Add to featured stories');
	    }
	    
	    
	}).execute();

return el;