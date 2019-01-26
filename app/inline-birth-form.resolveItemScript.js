    
   var MockCard = new Class({
        Extends: MockDataTypeItem,
        getAddress: function() {
            return false;
        },
        setAddress: function(address) {
    
    
        },
        setDate: function(address) {
    
    
        },
        getFormView: function() {
            if (this._getFormView) {
                return this._getFormView();
            }
            return "createStoryForm"
        },
        getLabel: function() {
            if (this._getLabel) {
                return this._getLabel();
            }
            return "Add Card"
        },
        getClassNames: function() {
            if (this._getClassNames) {
                return this._getClassNames();
            }
            return "add-card";
        },
    
    
        save:function(callback){
            callback(false);
        }
    
    
    });
    
    return new MockCard();