
var el=new Element('button',{"class":"featured-link", "click":function(){
    
}});
(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "featuredStoriesItems",
		'field': "featured"
	})).addEvent('success',function(response){
	    
	    console.log(response);
	    console.log(item);
	    
	}).execute();

return el;