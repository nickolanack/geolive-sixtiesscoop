return new ModalFormButtonModule(application, AppClient, {
             
                label: "Register",
                formName: "registerFormView",
                "class": "secondary-btn register",
                "style":"margin-left: calc( 50% - 40px );",
                formOptions: {template:"form"}
        
         }).addEvent("show",function(newWizard){
             wizard.close();
         })