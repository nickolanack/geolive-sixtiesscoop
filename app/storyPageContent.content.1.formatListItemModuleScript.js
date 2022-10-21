var storyItem=child
var attrs=storyItem._config.attributes;



if(attrs.isBirthStory===true){
    childView.getElement().addClass('birth-card');
    return;
}

if(attrs.isRepatriationStory===true){
    childView.getElement().addClass('repatriation-card');
    return;
}


childView.getElement().addClass('journey-card');


if(attrs.isAdoptionStory===true){
    childView.getElement().addClass('adoption-card');

}


