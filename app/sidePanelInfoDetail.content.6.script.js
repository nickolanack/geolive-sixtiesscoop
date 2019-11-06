
if(item.canEdit&&item.canEdit()){
var btn=new Element('button', {
                html: "edit",
                "class": "inline-btn profile"
            })
new UIModalFormButton(btn, ScoopStories.getMap(), item, {

                formName: item.getFormView()

            });
            return btn
}
return null;