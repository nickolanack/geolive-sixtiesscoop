//module.once('display', function(){
    setTimeout(function(){
        
        var list=module.getDetailViews().reverse();
        var rate=100;
        var item=null;
        var animate=function(list){
            if(item){
                item.getElement().removeClass('anim');
            }
            if(list.length){
                item=list.shift();   
                item.getElement().addClass('anim');
                setTimeout(function(){
                    animate(list);
                }, rate);
            }
        }
        animate(list);
        
    }, 1000);  
//})