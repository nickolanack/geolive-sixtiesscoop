inputElement.disabled=true;

try{
    if(item.options.metadata.username==item.options.metadata.email){
        module.getElement().addClass('hidden');
    }
}catch(e){
    console.error(e);
     module.getElement().addClass('hidden');
}