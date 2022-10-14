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
				new MockDataTypeItem({
				    mutable:true,
				    combineFieldValues:true,
				    updateField:"data",
				    data:{},
				    parameters:[
				        {
                	      "name": "heading",
                	      "description": "",
                	      "fieldType": "heading",
                	      "defaultValue": "Hello world",
                	      "options": {}
                	    },   
                	    {
                	      "name": "Field Label",
                	      "description": "",
                	      "fieldType": "text",
                	      "defaultValue": "",
                	      "options": {
                	          "parameterName":"content"
                	      }
                	    }
				    ]
				}), 
				{
					"formName": 'genericParametersForm',
					"formOptions": {
						template: "form" 
					}
				}
			)).show().on('complete', function(item){
			    
			    console.log(item.toObject());
			    
			});
        
    }})
];