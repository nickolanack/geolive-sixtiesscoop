if(window.location.href.indexOf('/tutorial')>0){
    
    application.getNamedValue('tutorial', function(tut){
        setTimeout(function(){
             tut.start();
        }, 1000);
       
    })
    
    return;
}


if(window.location.href.indexOf('/register')>0){
    
     ScoopStories.getApp().getNamedValue('registerBtn', function(btn){
        btn.runOnceOnLoad(function(){
            btn.button.show();
        })
       
    })
    
    return;
}
