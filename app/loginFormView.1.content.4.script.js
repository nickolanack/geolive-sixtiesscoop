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
         
         
    new ModalFormButtonModule(application, AppClient, {
             
                label: "Forgot Password",
                formName: "forgotPassowrdFormView",
                "class": "secondary-btn forgot-pwd",
                "style":"margin-left: calc( 50% - 40px );",
                formOptions: {template:"form"}
        
         }).addEvent("show",function(newWizard){
             wizard.close();
         })
         
         
         
         
    ];