
(new \core\extensions\widget\WidgetRenderer($targetInstance))->addInlineViews(array(
    'home', 
    'headerMenuContent', 
    'bannerContent', 
    'introSection', 
    'homePageContent', 
    'bottomSection', 
    'gettingStarted', 
    'placeholderLabelItem', 
    'featuredStories', 
    'featuredStory', 
    'sidePanelInfoDetail'
));

IncludeJSBlock('
    TemplateModule.SetTemplate(\'form\',\'<div><div data-template="title" class="template-title"></div><div data-template="content" class="template-content"></div><div data-template="footer" class="template-footer"></div></div>\');
    TemplateModule.SetTemplate(\'default\',\'<div data-template="content" class="template-content"></div>\');
');

IncludeJS('{widgets}/WizardBuilder/js/FormBuilder.js');
IncludeJS('{widgets}/Configuration/js/ConfigEdit.js');

IncludeJS('{modules}/ShareLinks/js/SocialLinks.js');

GetPlugin('MapStory')->includeScripts();

GetWidget("homeStyle")->display($targetInstance);
GetWidget("loginFormView")->display($targetInstance);
GetWidget("registerFormView")->display($targetInstance);

GetWidget("forgotPasswordForm")->display($targetInstance);


GetWidget("combinedForm")->display($targetInstance);
GetWidget("contactUserForm")->display($targetInstance);

