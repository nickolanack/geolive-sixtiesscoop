var links= [
    new MockDataTypeItem({name:"Home", click:function(){
        window.location.href="/"
    }}), 
    new MockDataTypeItem({name:"Map", click:function(){
        window.location.href="/map"
    }}), 
    new MockDataTypeItem({name:"Search", click:function(){
        window.location.href="/search"
    }}), 
    new MockDataTypeItem({name:"Help"}), 
    new MockDataTypeItem({name:"About"}), 
    new MockDataTypeItem({name:"Sign in", click:function(){
        
        
                                             (new UIModalDialog(
												application, 
												AppClient, 
												{
													"formName": 'loginFormView',
													"formOptions": {
														template: "form"
													}
												}
											)).show(function(){

					            			

											}).on('complete', function(item){
											    
											    
											    
											});
        
        
        
        
    }})
];


if(AppClient.getUserType()!=="guest"){
        
    links.pop();
    links.push(new MockDataTypeItem({name:"Sign out", click:function(){
        
        
        
                                            (new UIModalDialog(
												application, 
												new MockDataTypeItem({
												    mutable:true,
												    mergeFieldValues:true,
												    // appendFieldObject:false, //is false by default if mergeFieldValues. must have toObject method
												    updateField:"data", 
												    data:{}, 
												    "stepOptions":{
												        width:700
												    },
												    parameters:[
												        {
								                	      "name": "heading",
								                	      "description": "",
								                	      "fieldType": "heading",
								                	      "defaultValue": "Are you sure?",
								                	      "options": {}
								                	    }
												    ]
												}), 
												{
													"formName": 'genericParametersForm',
													"formOptions": {
														template: "form",
														"className": "alert-view",
                        								"showCancel":true,
                        								"labelForSubmit":"Yes, log me out",
                        								"labelForCancel":"Cancel",
                        								"closable":true
													}
												}
											)).show(function(yes){
                                                
                                                if(yes){ 
                                                    AppClient.logout(); 
                                                    
                                                }
                                                
											});
        
        
    }}))
    
}


return links;