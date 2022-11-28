
(new UIFormViewBehavior(module, 'profile'))
    .addDataFormatter(function(data, item){
        return ObjectAppend_({}, item.toObject(), data);
    })
