(new UIModalDialog(
			map, 
			new MockDataTypeItem({
			    mutable:true,
			    name:"",
			    description:"",
			    location:""
			}), 
			{
				"formName": 'supportGroupForm',
				"formOptions": {
					template: "form",
					labelForCancel:"Cancel",
					labelForSave:"Save",
					viewerOptions:{
				    	"className":"test"
					}
				}
			}
		)).show(function(){


		}).on('complete', function(item){
		    
		   
		    
		});