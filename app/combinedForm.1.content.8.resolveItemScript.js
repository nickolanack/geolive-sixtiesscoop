  
 try{
     return item.getRepatriationStory();
 }catch(e){
     console.error(e);
 }
 
 
 
 return new MockDataTypeItem({
       name:"",
       description:"",
       address:"",
       mutable:true
    });