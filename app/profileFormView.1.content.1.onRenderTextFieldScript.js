inputElement.disabled=true;

try{
     
    if(item.options.metadata.username==item.options.metadata.email){
        module.getElement().addClass('hidden');
    }
}catch(e){
    console.warn(e);
     module.getElement().addClass('hidden');
}