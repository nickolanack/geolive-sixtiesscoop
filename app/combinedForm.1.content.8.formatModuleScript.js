module.getChildWizard(function(wizard) {
						wizard.addEvent('valueChange', function() {
						    wizard.update();
							module.getWizard().setDataValue({'repatriation':wizard.getData()});
						});
						
						module.getWizard().addDataAggregationFunction(module.getWizard().getCurrentIndex(), function(){
						    wizard.update();
        					module.getWizard().setDataValue({'repatriation':wizard.getData()});
        				});
						
					});