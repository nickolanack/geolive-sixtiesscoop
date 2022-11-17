IncludeJSBlock('
    TemplateModule.SetTemplate(\'default\',\'<div data-template="content" class="template-content"></div>\');
');

GetWidget("homeStyle")->display($targetInstance);
GetWidget("mainStyle")->display($targetInstance);

GetPlugin('MapStory')->includeScripts();


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

