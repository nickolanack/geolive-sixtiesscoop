var card=child.getCard(); //index;
var storyItem=child.getResp().story[card];

if(storyItem.attributes.isBirthStory===true){
    childView.getElement().addClass('birth-card');
    return;
}

if(item.isRepatriationStory===true){
    childView.getElement().addClass('repatriation-card');
    return;
}


childView.getElement().addClass('journey-card');


if(item.isAdoptionStory===true){
    childView.getElement().addClass('adoption-card');

}