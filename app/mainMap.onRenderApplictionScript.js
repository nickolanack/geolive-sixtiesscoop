IncludeJSBlock('
    TemplateModule.SetTemplate(\'default\',\'<div data-template="content" class="template-content"></div>\');
');

GetWidget("homeStyle")->display($targetInstance);
GetWidget("mainStyle")->display($targetInstance);

GetPlugin('MapStory')->includeScripts();

IncludeJS('{widgets}/WizardBuilder/js/FormBuilder.js');
IncludeJS('{widgets}/Configuration/js/ConfigEdit.js');


IncludeJSBlock('

    '.$targetInstance->getJSObjectName().'.runOnceOnLoad(function(app){
        ScoopStories.initializeApplication(app);
    });

');


GetWidget("sidePanelDetailList")->display($targetInstance);
GetWidget("sidePanelGraphDetail")->display($targetInstance);
GetWidget("sidePanelEmptyDetail")->display($targetInstance);
GetWidget("sidePanelDetail")->display($targetInstance);
GetWidget("sidePanelUserInfoDetail")->display($targetInstance);


GetWidget("genericParametersForm")->display($targetInstance);

