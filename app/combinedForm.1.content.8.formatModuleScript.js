
(new UIFormViewBehavior(module, 'repatriation'))
    .addDataFormatter(function(data, item){
        return ObjectAppend_({}, item.toObject(), data);
    })
