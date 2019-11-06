
if(item.canEdit&&item.canEdit()){
var btn=new Element('button', {
                html: "edit",
                "class": "inline-btn edit"
            })
new UIModalFormButton(btn, ScoopStories.getMap(), item, {

                formName: item.getFormView()

            });
            return btn
}
return null;