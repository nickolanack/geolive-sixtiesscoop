
//var AjaxUrl = "https://" + AppDomain + "/php-core-app/core.php?iam=googlesheets?0=1&format=ajax";
function request(task, json, callback){

  console.log("Ajax: "+AjaxUrl+"&task="+task);
  
  var options = {
		"method": "POST",
		"payload": {
			"json": JSON.stringify(json)
		},
		"followRedirects": true,
		"muteHttpExceptions": true
	};

	console.log(options);

	var response = UrlFetchApp.fetch(AjaxUrl+"&task="+task, options);


	var responseCode = response.getResponseCode();
	var responseContent = response.getContentText();

	if (responseCode != 200) {
		callback('Error: '+responseCode);
	}

	var responseData =null;
  try{
    responseData=JSON.parse(responseContent);
  }catch(e){
  
  }
    if((responseData && responseData.success === true)){
		callback(null, responseData);
		return;
	}


	callback('Invalid response: '+responseContent);
	

}