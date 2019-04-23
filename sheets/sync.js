/**
 * Installation
 * ******************************
 * Starting with a sheet: Tools->Script editor and paste this file into Code.gs
 * From the script: Edit->Current porject's Triggers and add 2 new triggers:
 * 		`onEdit` Function -> `On edit` event
 * 		`onOpen` Function -> `On open` event 
 *   			!You may have to click `Advanced/Proceed` to view authorization form with warnings
 *   			
 * 
 * Configuration
 * ******************************
 * This section can be used to configure the editable fields, attributes, field validation etc. 
 * Remember to set Script Propertie: `secret` to match Geolive config value
 */


var AppName = "Geoforms sync";
var AppDomain = "sixtiesscoop.geoforms.ca";


//var RequestUrl = "https://" + AppDomain + "/php-core-app/core.php?iam=googlesheets?0=1&format=ajax&task=user_function";
var AjaxUrl = "https://" + AppDomain + "/php-core-app/core.php?iam=googlesheets?0=1&format=ajax";
var WidgetTarget = 41;
//var AppSecret = PropertiesService.getScriptProperties().getProperty('secret')


function onOpen() {

	//enableSync();
	drawMenu();
}



function drawMenu() {

	//var sync = syncIsEnabled();

	var ui = SpreadsheetApp.getUi();
	// Or DocumentApp or FormApp.
	ui.createMenu(AppName)
		.addItem('Import from map', 'importData')
		.addItem('Export to map', 'exportData')
		.addToUi();

}



