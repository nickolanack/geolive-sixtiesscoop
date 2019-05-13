tile.addEvent('click',function(){
    
    
    map.resetView();
    map.getLayerManager().getLayers().forEach(function(layer) {
        layer.hide();
    });
    
})


