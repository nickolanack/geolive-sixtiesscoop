(new UIFormListBehavior(module)).setNewItemFn(function(){
    
    return new MockDataTypeItem({
       name:"",
       description:"",
       address:"",
       mutable:true
    });
}).addDataFormatter(function(data, item){
    
    return ObjectAppend_({}, item.toObject(), data);
    
})
    .setUpdateField('stories')
    .setEmptyFn(function(data){
        return !((data.id&&data.id>0)||(typeof data.address=='string')&&data.address.length>0);
    })
    .enableDragOrdering();