console.log('custon media');

var el=new Element('span',{
    "class":"media-container empty"
});

item.getVideos(function(videos){
    
    if(videos.length){
        el.appendChild(new Element('span',{
            styles:{
                'background-image':'url('+videos[0].poster+')'
            },
            "class":"video"
        }));
        
        el.removeClass('empty');
        el.addClass('has-video');
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