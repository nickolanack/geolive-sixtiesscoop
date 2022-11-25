 try{
 return item.options.metadata.username;
 }catch(e){
     console.warn(e);
     return 'unknown';
 }