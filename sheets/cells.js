



var cacheTableData=null;
var cacheTableLastRow=-1;
var cacheTableLastCol=-1;


function getColumnName(col) {

	return valueAt(1, col);

}


function getColumnNamesSequence(colA, colB) {

	var sheet = SpreadsheetApp.getActiveSheet();
  
  

	var lastColumn = memLastColumn();
  
   if(colA>lastColumn||colB>lastColumn){
     throw "columns out of range "+JSON.stringify([colA, colB])+" "+lastColumn;
     
   }
  
   if(colA>colB){
      return getColumnNamesSequence(colB, colA).reverse();
   }
  
    var names=[];
	for (var column = colA; column <= colB; column++) {
		names.push(getColumnName(column));
	}

	return names;
}

function getColumnNamesSequenceFromNames(nameA, nameB) {
	return getColumnNamesSequence(getColumn(nameA), getColumn(nameB));
}

function getColumnNamesSequenceFromNamesStartsWith(nameA, nameB) {
	return getColumnNamesSequence(getColumnStartsWith(nameA), getColumnStartsWith(nameB));
}

function getColumn(name) {

	var sheet = SpreadsheetApp.getActiveSheet();

	var lastColumn = memLastColumn();
	for (var column = 1; column <= lastColumn; column++) {
		if(getColumnName(column)===name){
			return column
		}
	}

	throw 'Invalid column name: '+name;
}




function getColumnStartsWith(name) {

	var sheet = SpreadsheetApp.getActiveSheet();

	var lastColumn = memLastColumn();
	for (var column = 1; column <= lastColumn; column++) {
		if(getColumnName(column).indexOf(name)===0){
			return column
		}
	}

	throw 'Invalid column name: '+name;
}

function memValueAt(row, col){
  var sheet=SpreadsheetApp.getActiveSheet()
  if(!cacheTableData){
    
     cacheTableData=sheet.getRange(1, 1, memLastRow(), memLastColumn()).getValues();
     //console.log(cacheTableData);
  }
	
  var r=row-1;
  var c=col-1;
  
  if(typeof cacheTableData[r]=="undefined"){
    return cacheTableData[r];
  }
  
  var value= cacheTableData[r][c];
  return value;

}

function memLastRow(){
  if(cacheTableLastRow==-1){
    cacheTableLastRow=SpreadsheetApp.getActiveSheet().getLastRow();
  }
  return cacheTableLastRow;
}

function memLastColumn(){
  if(cacheTableLastCol==-1){
    cacheTableLastCol=SpreadsheetApp.getActiveSheet().getLastColumn();
  }
  return cacheTableLastCol;
}

function memUpdate(row, col, value){
  if(cacheTableLastRow>-1&&cacheTableLastRow<row){
    cacheTableLastRow=row;
  }
  
  if(cacheTableLastCol>-1&&cacheTableLastCol<col){
    cacheTableLastCol=col;
  }
  
  
  if(typeof cacheTableData[row-1]=="undefined"){
     cacheTableData[row-1]=[];
  }
  
  cacheTableData[row-1][col-1]=value;
}


function valueAt(row, col) {
  
 
  return memValueAt(row, col);
  
  
   //var sheet=SpreadsheetApp.getActiveSheet()
   //var value= sheet.getRange(row, col).getValue();
	
   //return value;
}

function setValueAt(row, col, value) {
	
	SpreadsheetApp.getActiveSheet().getRange(row, col).setValue(value);
    memUpdate(row, col, value);

}


function getNewRowOrRowWith(object) {

	var lastRow = memLastRow();
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

	var lastRow = memLastRow();

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