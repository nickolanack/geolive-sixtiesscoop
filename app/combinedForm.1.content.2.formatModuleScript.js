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
    .setUpdateField('templatesData')
    .enableDragOrdering();