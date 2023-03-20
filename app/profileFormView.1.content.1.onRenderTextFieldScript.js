inputElement.disabled=true;

try{
    
    if(item.getType()==='user'&&item.getId()==AppClient.getId()){
         return AppClient.options.metadata.username;
    }
     
    if(item.options.metadata.username==item.options.metadata.email){
        module.getElement().addClass('hidden');
    }
}catch(e){
    console.warn(e);
     module.getElement().addClass('hidden');
}