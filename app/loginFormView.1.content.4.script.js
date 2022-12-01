

var LoginItem=new Class({
    Extends:DataTypeObject,
    Implements:Events,
    setSendMagicLink:function(){
        var me=this;
        me._task="send_magic_link";
    },
    setSendReset:function(){
        var me=this;
        me._task="send_reset";
        
    },
    setEmail:function(e){
        var me=this;
        me._email=e;
    },
    save:function(cb){
        
        var me=this;
        
        (new AjaxControlQuery(CoreAjaxUrlRoot, me._task, {
		  'plugin': "Users",
		  'email':me._email
		})).addEvent('success',function(){
		    cb(true);
		}).execute(); 
		
		

    }
})


return [
    
    
    new ModalFormButtonModule(application, AppClient, {
             
                label: "Register",
                formName: "registerFormView",
                "class": "secondary-btn register",
                "style":"margin-left: calc( 50% - 40px );",
                formOptions: {template:"form"}
        
         }).addEvent("show",function(newWizard){
             wizard.close();
         }),
         
         
    new ModalFormButtonModule(application, new LoginItem(), {
             
                label: "Forgot Password",
                formName: "forgotPasswordForm",
                "class": "secondary-btn forgot-pwd",
                "style":"margin-left: calc( 50% - 40px );",
                formOptions: {template:"form"}
        
         }).addEvent("show",function(newWizard){
             wizard.close();
         })
         
         
         
         
    ];