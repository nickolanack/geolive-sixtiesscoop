 
 
 try{
     return item.getBirthStory();
 }catch(e){
     console.error();
 }
 
 
 return new MockDataTypeItem({
       name:"",
       description:"",
       address:"",
       mutable:true,
       type:"MapStory.card"
    });