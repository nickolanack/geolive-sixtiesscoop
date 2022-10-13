IncludeJSBlock('
    TemplateModule.SetTemplate(\'default\',\'<div data-template="content" class="template-content"></div>\');
');

IncludeJS('{widgets}/WizardBuilder/js/FormBuilder.js');

GetWidget("homeStyle")->display($targetInstance);
GetWidget("genericParametersForm")->display($targetInstance);
