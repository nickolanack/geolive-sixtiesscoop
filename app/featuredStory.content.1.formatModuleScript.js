if(item.isBirthStory&&item.isBirthStory()){
    module.getElement().addClass('birth-card');
    return;
}

if(item.isRepatriationStory&&item.isRepatriationStory()){
    module.getElement().addClass('repatriation-card');
    return;
}



module.getElement().addClass('journey-card');