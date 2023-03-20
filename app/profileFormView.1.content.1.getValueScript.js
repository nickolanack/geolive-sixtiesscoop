 try{
         if(item.getType()==='user'&&item.getId()==AppClient.getId()){
         return AppClient.options.metadata.username;
    }
 return item.options.metadata.username;
 }catch(e){
     console.warn(e);
     return 'unknown';
 }