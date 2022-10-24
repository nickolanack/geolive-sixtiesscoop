return new Element('button', {'class':"inline-edit options-btn", html:"Advanced", "events":{
    "click":function(){
        
        if(this.hasClass('enabled')){
                
            this.removeClass('enabled');
            $$('.ui-view.search-content')[0].removeClass('enabled');
            
            return;
        }
        
        
        this.addClass('enabled');
        $$('.ui-view.search-content')[0].addClass('enabled');
        
    }
}});