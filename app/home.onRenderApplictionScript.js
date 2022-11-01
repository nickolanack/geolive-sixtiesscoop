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


GetWidget("combinedForm")->display($targetInstance);
GetWidget("contactUserForm")->display($targetInstance);

