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
                    new Element('a',{"class":"social-share fb-share", html:"Share on facebook", dataset:{
                        'share':"facebook"
                        
                    }})),
                {});
            
            (new SocialLinks()).linkElement(
                module.getElement().appendChild(
                    new Element('a',{"class":"social-share twitter-share", html:"Share on twitter", dataset:{
                        'share':"twitter"
                    }})),
                {});
                
                
           
                module.getElement().appendChild(
                    new Element('a',{"class":"social-share email-share", html:"Share via email", 
                        'target':"_blank",
                        'href':"mailto:?subject="+
                            encodeURIComponent('Check out '+listModule.getListItem().getUsersName()+'\'s story on the sixties-scoop network')+"&body="+
                            encodeURIComponent('\n\n'+document.location.origin+'/story/69\n\n'),
                        dataset:{
                            'share':"email",
                        }
                        }));
               
            
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
        
        if(AppClient.getUserType()==="guest"){
            (new UIModalDialog(application, AppClient, {
                formName: "loginFormView",
                formOptions:{
                    closable:true,
					template: "form"
				}
            })).show();
            return;
        }
     
        
        (new UIModalDialog(
			application, 
			new UserContact(item), 
			{
				"formName": 'contactUserForm',
				"formOptions": {
					template: "form",
					closable:true,
					labelForCancel:"Cancel",
					labelForSave:"Send",
					viewerOptions:{
				    	"className":"test"
					}
				}
			}
		)).show(function(){


		}).on('complete', function(item){
		    
		   
		    
		});
        
        
        
    }}), 
   
];


if(AppClient.getUserType()==="guest"){
    return links;
}

 
if(!(AppClient.getUserType()=="admin"||item.getUserId()==AppClient.getId())){
    return links; 
}
    
    
    var displayEditForm=function(){
        
        (new UIModalDialog(
			application, 
			item,//user,//AppClient, 
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
		    
		   var dialog=this;
		   var wizard=dialog.getWizard();
		   var data=wizard.getData();
		   console.log(data);
		   
		    (new AjaxControlQuery(CoreAjaxUrlRoot, "save_story", {
		       'plugin':"MapStory",
		       'user':item.getUserId(),
               'storyData':data
            })).addEvent("success", function(resp) {
               
                console.log('redraw');
               
            }).execute();
		   
		    
		});
        
    } 
     
    if(document.location.pathname.split('/').pop()==='edit'){
            displayEditForm()
    }
     
     
    links.push(new MockDataTypeItem({name:"Edit story", "className":"edit", click:function(){
       
        console.log(item);
        displayEditForm();
       
    }}));
 
 
 
    



return links;