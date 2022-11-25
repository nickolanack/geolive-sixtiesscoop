module.getChildWizard(function(wizard) {
						wizard.addEvent('valueChange', function() {
							module.getWizard().setDataValue({'profile':wizard.getData()});
						});
					});