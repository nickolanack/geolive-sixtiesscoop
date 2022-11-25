module.getChildWizard(function(wizard) {
						wizard.addEvent('valueChange', function() {
							module.getWizard().setDataValue({'birth':wizard.getData()});
						});
						module.getWizard().addDataAggregationFunction(module.getWizard().getCurrentIndex(), function(){
        					module.getWizard().setDataValue({'birth':wizard.getData()});
        				});
					});