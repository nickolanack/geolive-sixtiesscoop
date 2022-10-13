return [
    new MockDataTypeItem({name:"Home", click:function(){
        window.location.href="/"
    }}), 
    new MockDataTypeItem({name:"Map", click:function(){
        window.location.href="/map"
    }}), 
    new MockDataTypeItem({name:"Help"}), 
    new MockDataTypeItem({name:"About"}), 
    new MockDataTypeItem({name:"Sign in", click:function(){
        
            (new UIModalDialog(
				application, 
				new MockDatatypeItem({
				    parameters:[
				        {
                	      "name": "heading",
                	      "description": "",
                	      "fieldType": "heading",
                	      "defaultValue": "Hello world",
                	      "options": {}
                	    },   
                	    {
                	      "name": "content",
                	      "description": "",
                	      "fieldType": "text",
                	      "defaultValue": ""
                	    }
				    ]
				}), 
				{
					"formName": 'genericParametersForm',
					"formOptions": {
						template: "form" 
					}
				}
			)).show();
        
    }}), 