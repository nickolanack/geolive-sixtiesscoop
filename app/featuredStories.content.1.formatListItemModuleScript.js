var card=child.getCard(); //index;
//var storyItem=child.getResp().story[card-1];
//var attrs=storyItem.attributes;


childView.getElement().addEvent('click', function(){
    document.location=document.location.origin+'/story/'+child.getId()
});



// if(attrs.isBirthStory===true){
//     childView.getElement().addClass('birth-card');
//     return;
// }

// if(attrs.isRepatriationStory===true){
//     childView.getElement().addClass('repatriation-card');
//     return;
// }


// childView.getElement().addClass('journey-card');


// if(attrs.isAdoptionStory===true){
//     childView.getElement().addClass('adoption-card');

// }

var attrs=StoryGroup.BestCard(new StoryUser(item.getResp()))._config.attributes;

StoryCard.AddAttributeClass(attrs , childView.getElement());