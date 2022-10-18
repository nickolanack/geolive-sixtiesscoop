

    var defaultList=[
        new MockDataTypeItem({name:"##Example 1"}), 
        new MockDataTypeItem({name:"##Example 2"}), 
        new MockDataTypeItem({name:"##Example 2"})
    ];



	(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "featuredStoriesItems",
		'field': "featured"
	})).addEvent('success',function(response){
        callback(defaultList);
	}).execute();




