var links= [
    new MockDataTypeItem({name:"Share", "className":"share", 
        click:function(){
        
            if(this.hasClass('active')){
                 this.removeClass('active');
                 return;
            }
            
            this.addClass('active');
           
        },
        formatModule:function(module){
            
            (new SocialLinks()).linkElement(
                module.getElement().appendChild(
                    new Element('a',{"class":"fb-share", html:"Share on facebook", dataset:{
                        'share':"facebook"
                        
                    }})),
                {});
            
            (new SocialLinks()).linkElement(
                module.getElement().appendChild(
                    new Element('a',{"class":"fb-share", html:"Share on twitter", dataset:{
                        'share':"twitter"
                    }})),
                {});
            
            var _deactivate=null;
            var deactivate=function(){
                
                _deactivate=setTimeout(function(){
                    _deactivate=null;
                    module.getElement().removeClass('active');
                    
                }, 2000);
                
            }
            
            
            module.getElement().addEvent('mouseover',function(){
                if(_deactivate){
                    clearTimeout(_deactivate);
                }
            });
            
            module.getElement().addEvent('mouseout',function(){
                deactivate();
            });
            
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