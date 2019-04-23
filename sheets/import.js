
function importData(){

  request('export_json', {
    "widget":WidgetTarget,
  },function(err, result){

  	if(err){
  		console.log(err);
  		//SpreadsheetApp.getUi().alert(err);
  		return;
  	}

  	//console.log('succes');
  	//SpreadsheetApp.getUi().alert('success');



  	result.results.forEach(function(record){

  		var compare={
  			"id":record.id,
  			"type":record.type
  		};
  		//console.log(JSON.stringify(compare));

  		var row=getNewRowOrRowWith(compare);

  		Object.keys(record).forEach(function(key){
  			var col=getColumn(key);
  			var value=record[key];
  			var currentValue=valueAt(row, col);
  			if(currentValue!=value){
  				console.log(JSON.stringify(compare)+" ("+row+", "+col+") key: "+key+" "+value);
  				setValueAt(row, col, value);
  			}
  		});



  	})

  });

}
