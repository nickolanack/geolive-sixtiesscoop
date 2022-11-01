

if(item._storyData.length>0){

    module.getElement().href="/map/story/"+item._storyData[0].id;
    module.getElement().addEvent('click',function(){
        window.location.href="/map/story/"+item._storyData[0].id
    })
    
    return;

}


 module.getElement().addClass('empty-story');
 return 'This user does not have a story';