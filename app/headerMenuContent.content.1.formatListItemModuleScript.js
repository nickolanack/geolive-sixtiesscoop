if(child.getLink){
    childView.getElement().href=child.getLink();

}

if(child.getHidden&&child.getHidden()===true){
    //hidden menu, visible to bots
    childView.getElement().addClass('hidden');
}