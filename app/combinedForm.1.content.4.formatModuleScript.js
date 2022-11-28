
(new UIFormViewBehavior(module, 'birth'))
    .addDataFormatter(function(data, item){
        return ObjectAppend_({}, item.toObject(), data);
    })
