

GetWidget("initializeApplication")->display($targetInstance);
GetWidget("mainStyle")->display($targetInstance);
GetWidget("registerFormView")->display($targetInstance);
GetWidget("loginFormView")->display($targetInstance);
GetWidget("profileFormView")->display($targetInstance);

GetWidget("sidePanelDetail")->display($targetInstance);
GetWidget("sidePanelEmptyDetail")->display($targetInstance);
GetWidget("sidePanelInfoDetail")->display($targetInstance);

GetWidget("sidePanelDetailList")->display($targetInstance);


GetWidget("dialogForm")->display($targetInstance);
GetWidget("advancedSearchForm")->display($targetInstance);
//GetWidget("addCardView")->display($targetInstance);
//GetWidget("createStoryForm")->display($targetInstance);

GetWidget("publishingOptionsForm")->display($targetInstance);

IncludeJSBlock('
TemplateModule.SetTemplate(\'form\',\'<div><div data-template="title" class="template-title"></div><div data-template="content" class="template-content"></div><div data-template="footer" class="template-footer"></div></div>\');
');

GetPlugin('MapStory')->includeScripts();

HtmlDocument()->META(HtmlDocument()->website(), 'base');




