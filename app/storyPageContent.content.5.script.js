
var el=new Element('button',{"class":"featured-link", "click":function(){
    
    
    
    
}});
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
	        return;
	    }
	    
	    
	}).execute();

return el;