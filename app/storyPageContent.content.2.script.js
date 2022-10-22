console.log('custon media');

var el=new Element('span',{
    "class":"media-container empty"
});

item.getVideos();
item.getImages(function(images){
    
    if(images.length){
        el.appendChild(new Element('span',{
            styles:{
                'bacground-image':'url('+images[0].url+')'
            }
        }));
        
        el.removeClass('empty');
        el.addClass('has-img');
    }
    
    
});

return el;