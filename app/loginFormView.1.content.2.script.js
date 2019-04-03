return new ModalFormButtonModule(application, AppClient, {
             
                label: "Register",
                formName: "registerFormView",
                "class": "inline-btn register"
    
        
         }).addEvent("show",function(newWizard){
             wizard.close();
         })