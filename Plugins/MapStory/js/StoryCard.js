'use strict';

var StoryCard = new Class({
    Extends: DataTypeObject,
    Implements: [Events],
    initialize: function(config) {
        var me = this;
        me.type = "MapStory.card";
        me._id = config.id || -1;
        me._config = JSON.parse(JSON.stringify(config));


        (Object.keys(config)).forEach(function(k) {
            me["_" + k] = config[k] || "{" + k + "}";
            var setFn = function(v) {
                me["_" + k] = v;
                return me;
            };

            var setMethod = "set" + k.capitalize();
            if (me[setMethod]) {
                setMethod = '_' + setMethod;
            }
            me[setMethod] = setFn;

            var getfn = function() {
                return me["_" + k];
            }

            var getMethod = "get" + k.capitalize();
            if (me[getMethod]) {
                getMethod = '_' + getMethod;
            }
            me[getMethod] = getfn;

        });

    },

    _getAttr: function(field, defaultValue) {

        if (
            me._config.attributes &&
            me._config.attributes[field] &&
            me._config.attributes[field] != '' &&
            me._config.attributes[field] != 'false'
        ) {

            return me._config.attributes[field];
        }

        return defaultValue;

    },

    getYear: function() {
        var me = this;
        if (
            me._config.attributes &&
            me._config.attributes.locationDate &&
            me._config.attributes.locationDate != '' &&
            me._config.attributes.locationDate != 'false') {

            return me._config.attributes.locationDate.split('-').shift();
        }

        return '{year}';


    },

    getUsersName: function() {
        var me = this;
        if (me._user) {
            return me._user.getUsersName();
        }

        return 'Unknown';
    },

    belongsToCurrentUser: function() {
        var me = this;
        if (me._user) {
            return me._user.isCurrentUser();
        }

        return false;
    },

    getConfig: function() {
        var me = this;
        return JSON.parse(JSON.stringify(me._config));
    },

    setUser: function(user) {
        var me = this;

        me._user = user;

        return me;
    },

    getUser: function() {
        var me = this;
        return me._user;
    },

    getTypeOfCard: function() {
        var me = this;

        if (me.isBirthStory()) {
            return "Birth";
        }

        if (me.isRepatriationStory()) {
            return "Repatriation";
        }

        if (me.isAdoptionStory()) {
            return "Adoption";
        }


        return "Journey";

    },
    isAdoptionStory: function() {
        var me = this;
        return me._user && me._user.hasAdoptionStory() && me._user.getAdoptionStory() === me;
    },
    isBirthStory: function() {
        var me = this;
        return me._user && me._user.hasBirthStory() && me._user.getBirthStory() === me;
    },
    isRepatriationStory: function() {
        var me = this;
        return me._user && me._user.hasRepatriationStory() && me._user.getRepatriationStory() === me;
    },

    canEdit: function() {
        var me = this;
        if (!me._user) {
            return false;
        }

        return parseInt(me._user.getUserId()) === AppClient.getId() || AppClient.getUserType() === "admin";
    },

    getAddress: function() {
        var me = this;
        if (me._address) {
            return this._address
        }


        if (
            me._config.attributes &&
            me._config.attributes.locationName &&
            me._config.attributes.locationName != '' &&
            me._config.attributes.locationName != 'false') {

            return this._config.attributes.locationName;
        }

        return false;

    },
    setAddress: function(address) {
        this._address = address;
        return this;
    },
    setLocation: function(location) {
        this._location = location;
    },

    getDescription: function() {
        return this._description || '';
    },



    setDescription: function(desc) {
        this._description = desc;
        return this;
    },
    getDate: function(date) {
        return this._date || null;
    },
    setDate: function(date) {
        this._date = date;
        return this;
    },
    getFormView: function() {

        var me = this;
        if (this._getFormView) {
            return this._getFormView();
        }

        if (me.isBirthStory()) {
            return 'createBirthStoryForm';
        }

        if (me.isRepatriationStory()) {
            return 'createRepatriationStoryForm';
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

    setAttributes: function(attrs) {
        this._attributes = attrs;
        return this;
    },

    getCardBackgroundImage: function(callback) {

        var me = this;


        if (
            me._config.attributes &&
            me._config.attributes.locationImages
        ) {

            var images = JSTextUtilities.ParseImages(me._config.attributes.locationImages);
            if (images.length) {
                callback(images[0].url);
                return;
            }

        }


        if (!me._user) {
            callback(null);
            return null;
        }
        return this._user.getIcon(callback);
    },
    getCardMedia: function() {

        var me = this;

        if (
            me._config.attributes &&
            me._config.attributes.locationImages) {
            return me._config.attributes.locationImages;
        }
        return '';
    },

    save: function(callback) {
        var me = this;

        (new AjaxControlQuery(CoreAjaxUrlRoot, "save_story_item", {

            "plugin": "MapStory",
            'address': me.getAddress(),
            'date': me.getDate(),
            'description': me.getDescription(),
            'attributes': me._attributes || {},
            'location': me._location || null,

            'id': me.getId(),
            'type': me.getType()


        })).addEvent("success", function(resp) {
            callback(true);
        }).execute();
    }


});


StoryCard.AddAttributeClass=function(attrs , el){

    var isTrue=function(a){
        return a===true||a==='true';
    }

    if(isTrue(attrs.isBirthStory)){
        el.addClass('birth-card');
        return;
    }

    if(isTrue(attrs.isRepatriationStory)){
        el.addClass('repatriation-card');
        return;
    }

    el.addClass('journey-card');

    if(isTrue(attrs.isAdoptionStory)){
        el.addClass('adoption-card');
    }

};


var SortCard = new Class({
    Extends: StoryCard,
    canEdit: function() {
        return false;
    },
    hasResults: function() {
        var me = this;
        return me._results().length;
    }
});

var HistoryNavigationCard = new Class({
    Extends: StoryCard,
    canEdit: function() {
        return false;
    }
});

var ProfileSummaryCard = new Class({
    Extends: StoryCard,
    canEdit: function() {
        return false;
    }
});



var AddCard = new Class({
    Extends: StoryCard,
    hasFn: function() {
        return !!this._click;
    },
    canEdit: function() {
        return false;
    },
    executeFn: function(e) {
        var me = this;
        if (!me.hasFn()) {
            throw 'Does not have user function'
        }
        me._click(e);

    }
});