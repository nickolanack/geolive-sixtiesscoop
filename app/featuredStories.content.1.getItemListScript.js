

    var defaultList=[
        new MockDataTypeItem({name:"##Example 1"}), 
        new MockDataTypeItem({name:"##Example 2"}), 
        new MockDataTypeItem({name:"##Example 2"})
    ];



	(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "featuredStoriesItems",
		'field': "featured"
	})).addEvent('success',function(response){
	    
	       var list=response.value.map(function(data, i){
	           
	           if(data.name){
	               data.name='##'+data.name;
	           }
	           
	           return new MockDataTypeItem(ObjectAppend_({name:"##Item "+i}, data));
	       });
	    
        callback(list.concat(defaultList).slice(0,3));
        
	}).execute();




