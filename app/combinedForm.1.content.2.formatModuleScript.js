
(new UIFormViewBehavior(module, 'publishing'))
    .addDataFormatter(function(data, item){
        return ObjectAppend_({}, item.toObject(), data);
    })
