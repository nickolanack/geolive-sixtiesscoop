console.log('custon media');

var el=new Element('span',{
    "class":"media-container empty"
});

item.getVideos(function(videos){
    
    if(videos.length){
        var yt=el.appendChild(new Element('span',{
            styles:{
                'background-image':'url('+videos[0].poster+')'
            },
            "class":"video",
            html:'<svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%"><path class="ytp-large-play-button-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path><path d="M 45,24 27,14 27,34" fill="#fff"></path></svg>'
        }));
        
        yt.appendChild(new Element('h2',{ html:videos[0].youtube.title }));
        
        el.removeClass('empty');
        el.addClass('has-video');
        
        yt.addEvent('click', function(){
           
           console.log(videos[0]) 
            
        });
        
        yt.appendChild(new Element('div',{"class":"toggle-display-mode", events:{click:function(){
            var p=el.parentNode;
            if(p.hasClass('small-video')){
                p.removeClass('small-video');
                return;
            }
            p.addClass('small-video')
        }}}))
        
    }
    
    
});
item.getImages(function(images){
    
    if(images.length){
        el.appendChild(new Element('span',{
            styles:{
                'background-image':'url('+images[0].url+')'
            },
            "class":"image"
        }));
        
        el.removeClass('empty');
        el.addClass('has-img');
    }
    
    
});

return el;