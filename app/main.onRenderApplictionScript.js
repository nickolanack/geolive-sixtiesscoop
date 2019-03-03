

GetWidget("initializeApplication")->display($targetInstance);
GetWidget("mainStyle")->display($targetInstance);
GetWidget("registerFormView")->display($targetInstance);
GetWidget("loginFormView")->display($targetInstance);
GetWidget("profileFormView")->display($targetInstance);
GetWidget("sidePanelDetail")->display($targetInstance);
//GetWidget("addCardView")->display($targetInstance);
//GetWidget("createStoryForm")->display($targetInstance);

IncludeJSBlock('
TemplateModule.SetTemplate(\'form\',\'<div><div data-template="title" class="template-title"></div><div data-template="content" class="template-content"></div><div data-template="footer" class="template-footer"></div></div>\');
');

GetPlugin('MapStory')->includeScripts();

HtmlDocument()->META(HtmlDocument()->website(), 'base');




