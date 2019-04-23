



function getColumnName(col) {

	return SpreadsheetApp.getActiveSheet().getRange(1, col).getValue();

}


function getColumn(name) {

	var sheet = SpreadsheetApp.getActiveSheet();

	var lastColumn = sheet.getLastColumn();
	for (var column = 1; column <= lastColumn; column++) {
		if(getColumnName(column)===name){
			return column
		}
	}

	throw 'Invalid column name: '+name;
}


function valueAt(row, col) {
	
	var value= SpreadsheetApp.getActiveSheet().getRange(row, col).getValue();
	
	return value;
}

function setValueAt(row, col, value) {
	
	SpreadsheetApp.getActiveSheet().getRange(row, col).setValue(value);

}


function getNewRowOrRowWith(object) {

	var lastRow = SpreadsheetApp.getActiveSheet().getLastRow();
	var resultRow=lastRow+1;
	getRowWith(object, function(err, row){
		if(err){
			return;
		}
		resultRow=row;

	});
	return resultRow;

}

function getRowWith(object, callback) {
	var sheet = SpreadsheetApp.getActiveSheet();

	var lastRow = sheet.getLastRow();

	var keys=Object.keys(object);
	var cols=keys.map(function(k){
		return getColumn(k);
	});

	for (var row = 1; row <= lastRow; row++) {

		var count=0;

		keys.forEach(function(k, i){

			var value=object[k];
			var theValue=valueAt(row, cols[i]);
			//console.log('valueAt: '+row+":"+cols[i]+' => '+theValue+' == '+value);
			if(theValue==value){
				count++;
			}

		});

		//console.log('count: '+count+":"+keys.length);
		if(count===keys.length){
			if(callback){
				callback(null, row);
			}
			return row;
		}

	}

	if(callback){
		callback('Row not found: '+JSON.stringify(object));
		return
	}

	throw 'Row not found: '+JSON.stringify(object);
}