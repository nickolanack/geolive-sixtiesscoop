module.getChildWizard(function(wizard) {
						wizard.addEvent('valueChange', function() {
						    wizard.update();
							module.getWizard().setDataValue({'publishing':wizard.getData()});
						});
						module.getWizard().addDataAggregationFunction(module.getWizard().getCurrentIndex(), function(){
						    wizard.update();
        					module.getWizard().setDataValue({'publishing':wizard.getData()});
        				});
					});