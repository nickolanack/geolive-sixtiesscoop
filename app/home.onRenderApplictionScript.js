IncludeJSBlock('
    TemplateModule.SetTemplate(\'form\',\'<div><div data-template="title" class="template-title"></div><div data-template="content" class="template-content"></div><div data-template="footer" class="template-footer"></div></div>\');
    TemplateModule.SetTemplate(\'default\',\'<div data-template="content" class="template-content"></div>\');
');

IncludeJS('{widgets}/WizardBuilder/js/FormBuilder.js');

GetWidget("homeStyle")->display($targetInstance);
GetWidget("loginFormView")->display($targetInstance);



