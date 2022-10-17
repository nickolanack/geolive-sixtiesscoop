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