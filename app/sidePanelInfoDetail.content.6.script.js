
if(item.canEdit&&item.canEdit()){
    
    
  var deleteBtn=new Element('button', {
                    html: "delete",
                    "class": "inline-btn delete",
                    events: {
                        click: function(e) {
                            (new UIModalDialog(application, {
                                name: "Confirmation",
                                description: "Are you sure you want to delete this card"
                            }, {
                                "formName": "dialogForm",
                                "formOptions": {
                                    "template": "form",
                                    "className": "confirm-view"
                                }
                            })).show(function(answer) {


                                if (answer == true) {

                                    (new AjaxControlQuery(CoreAjaxUrlRoot, "delete_story_item", {
                                        'plugin': 'MapStory',
                                        'id': item.getId(),
                                        'type': item.getType()
                                    })).addEvent("success", function(resp) {
                                        ScoopStories.clearCards()
                                        ScoopStories.redraw();
                                    }).execute();

                                }

                            });
                        }
                    }
                })
    
var editBtn=new Element('button', {
                html: "edit",
                "class": "inline-btn edit"
            })
new UIModalFormButton(editBtn, ScoopStories.getMap(), item, {

                formName: item.getFormView()

            });
            
            var span=new Element('span');
            span.appendChild(deleteBtn);
            span.appendChild(editBtn);
            
            
            return span
}
return null;