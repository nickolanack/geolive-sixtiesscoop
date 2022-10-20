
(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "gettingStartedItems",
		'field': "links"
	})).addEvent('success',function(response){




var configEdit = (new ConfigEdit(application, 'gettingStartedItems')).withTemplate(function(field, index){
       return [
												        {
								                	      "name": "heading",
								                	      "description": "",
								                	      "fieldType": "heading",
								                	      "defaultValue": "Edit Getting Started Item",
								                	      "options": {}
								                	    },   
								                	    {
								                	      "name": "Markdown Content",
								                	      "description": "",
								                	      "fieldType": "text",
								                	      "defaultValue": response.value[index].content,
								                	      "options": {
								                	          "parameterName":"content",
								                	            "className":"markdown-field"
								                	      }
								                	    }
	    ]; 
    
}, 'genericParametersForm', {
    
    "labelForSubmit":"Save",
    "showCancel":false
    
});



    callback( [
        new MockDataTypeItem({
            
            click:function(){
                document.location=document.location.origin+'/register'
            },
            edit:function(){
                configEdit.editIndex('links', 0);
            },
            name:response.value[0].content,
            "className":"register"
            
        }), 
        new MockDataTypeItem({
             click:function(){
                document.location=document.location.origin+'/create'
            },
            edit:function(){
                configEdit.editIndex('links', 1);
            },
            name:response.value[1].content,
            "className":"add"
            
        }), 
        new MockDataTypeItem({
             click:function(){
                document.location=document.location.origin+'/edit'
            },
            edit:function(){
                configEdit.editIndex('links', 2);
            },
            name:response.value[2].content,
            "className":"edit"
            
        })
    
    ]);
    
    
}).execute();