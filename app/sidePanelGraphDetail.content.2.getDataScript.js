setTimeout(function(){
    
         var data={"result": [
               
               ([60, 61, 62]).map(function(yr){
                  
                  return  {"value": 
                      item.getProviceCodeItems().slice(0,4).map(function(item){
                          return {"product.name": item.getTitle(), "result": Math.floor(Math.random() * Math.floor(10))};
                      }), 
               "timeframe": {"start": (1900+yr)+"-01-01T00:00:00.000Z", "end": (1900+yr+1)+"-01-01T00:00:00.000Z"}};
                   
               })
               
               ]}
    
callback({
	"result": [{
		"value": [{
			"product.name": "BC",
			"result": 53
		}, {
			"product.name": "AB",
			"result": 47
		}, {
			"product.name": "SK",
			"result": 24
		}, {
			"product.name": "MB",
			"result": 76
		}],
		"timeframe": {
			"start": "2019-03-20T00:00:00.000Z",
			"end": "2019-03-21T00:00:00.000Z"
		}
	}, {
		"value": [{
			"product.name": "BC",
			"result": 32
		}, {
			"product.name": "AB",
			"result": 24
		}, {
			"product.name": "SK",
			"result": 56
		}, {
			"product.name": "MB",
			"result": 32
		}],
		"timeframe": {
			"start": "2019-03-21T00:00:00.000Z",
			"end": "2019-03-22T00:00:00.000Z"
		}
	}, {
		"value": [{
			"product.name": "BC",
			"result": 27
		}, {
			"product.name": "AB",
			"result": 32
		}, {
			"product.name": "SK",
			"result": 18
		}, {
			"product.name": "MB",
			"result": 33
		}],
		"timeframe": {
			"start": "2019-03-22T00:00:00.000Z",
			"end": "2019-03-23T00:00:00.000Z"
		}
	}, {
		"value": [{
			"product.name": "BC",
			"result": 68
		}, {
			"product.name": "AB",
			"result": 56
		}, {
			"product.name": "SK",
			"result": 65
		}, {
			"product.name": "MB",
			"result": 59
		}],
		"timeframe": {
			"start": "2019-03-23T00:00:00.000Z",
			"end": "2019-03-24T00:00:00.000Z"
		}
	}, {
		"value": [{
			"product.name": "BC",
			"result": 38
		}, {
			"product.name": "AB",
			"result": 48
		}, {
			"product.name": "SK",
			"result": 50
		}, {
			"product.name": "MB",
			"result": 26
		}],
		"timeframe": {
			"start": "2019-03-24T00:00:00.000Z",
			"end": "2019-03-25T00:00:00.000Z"
		}
	}, {
		"value": [{
			"product.name": "BC",
			"result": 34
		}, {
			"product.name": "AB",
			"result": 15
		}, {
			"product.name": "SK",
			"result": 18
		}, {
			"product.name": "MB",
			"result": 14
		}],
		"timeframe": {
			"start": "2019-03-25T00:00:00.000Z",
			"end": "2019-03-26T00:00:00.000Z"
		}
	}]
});
}, 100);

