
var itemList=[]

try{
    itemList.push(item.getAdoptionStory());
}catch(e){
    
}

try{
    itemList.concat(item.getJourneyStories());
}catch(e){
    
}

if(itemList.length>0){
    callback(itemList);
    return;
}

callback([new MockDataTypeItem({
       name:"",
       description:"",
       address:"",
       mutable:true
    })])