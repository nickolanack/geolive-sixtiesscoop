 try{
 return item.options.metadata.username;
 }catch(e){
     console.error(e);
     return 'unknown';
 }