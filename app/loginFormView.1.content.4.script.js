return new ModalFormButtonModule(application, AppClient, {
             
                label: "Register",
                formName: "registerFormView",
                "class": "secondary-btn register"
    
        
         }).addEvent("show",function(newWizard){
             wizard.close();
         })