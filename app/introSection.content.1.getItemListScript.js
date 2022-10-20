
(new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
		'widget': "primaryLinkItems",
		'field': "links"
	})).addEvent('success',function(response){




var configEdit = (new ConfigEdit(application, 'primaryLinkItems')).withTemplate(function(field, index){
       return [
												        {
								                	      "name": "heading",
								                	      "description": "",
								                	      "fieldType": "heading",
								                	      "defaultValue": "Edit Primary Link",
								                	      "options": {}
								                	    },   
								                	    {
								                	      "name": "Markdown Content",
								                	      "description": "",
								                	      "fieldType": "text",
								                	      "defaultValue": response.value[index].content,
								                	      "options": {
								                	          "parameterName":"content"
								                	      }
								                	    }
	    ]; 
    
}, 'genericParametersForm', {});



    callback( [
        new MockDataTypeItem({
            
            click:function(){
                document.location=document.location.origin+'/search'
            },
            edit:function(){
                configEdit.editIndex('links', 0);
            },
            name:"##Search\n Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "className":"search"
            
        }), 
        new MockDataTypeItem({
             click:function(){
                document.location=document.location.origin+'/share'
            },
            edit:function(){
                configEdit.editIndex('links', 1);
            },
            name:"##Share\n Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "className":"view"
            
        }), 
        new MockDataTypeItem({
             click:function(){
                document.location=document.location.origin+'/explore'
            },
            edit:function(){
                configEdit.editIndex('links', 2);
            },
            name:"##Explore\n Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "className":"browse"
            
        })
    
    ]);
    
    
}).execute();
