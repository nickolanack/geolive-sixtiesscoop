var links= [
    new MockDataTypeItem({name:"Share", "className":"share", 
        click:function(){
        
        },
        formatModule:function(module){
            module.getElement().appendChild(new Element('a',{"class":"fb-share", html:"Share on facebook"}));
            module.getElement().appendChild(new Element('a',{"class":"fb-share", html:"Share on twitter"}));
        }
        
    }), 
    new MockDataTypeItem({name:"Contact", "className":"contact", click:function(){
        
    }}), 
   
];


if(AppClient.getUserType()!=="guest"){
        

 
 if(AppClient.getUserType()=="admin"){
    links.push(new MockDataTypeItem({name:"Edit story", "className":"edit", click:function(){
       
       
       
       (new UIModalDialog(
												application, 
												AppClient, 
												{
													"formName": 'combinedForm',
													"formOptions": {
														template: "form",
														labelForCancel:"Cancel",
														labelForSave:"Save",
														viewerOptions:{
													    	"className":"test"
														}
													}
												}
											)).show(function(){


											}).on('complete', function(item){
											    
											   
											    
											});
       
       
       
       
    }}));
 }
 
 
    
}


return links;