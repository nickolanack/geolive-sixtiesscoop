var ScoopStories = {
    getCurrentCards: function(callback) {

        ScoopStories.getCurrentCardGroup(function(group) {
            group.getCards(callback);
        });

    },

    getCurrentCardLabel: function(callback) {

        ScoopStories.getCurrentCardGroup(function(group) {
            group.getCardsLabel(callback);
        });

    },

    getCurrentCardGroup: function(callback) {


        ScoopStories.getClient(function(item) {

            var methods = ["getCards", "getCardsLabel", "getCardsDescription"];
            methods.forEach(function(m) {
                if (typeof item[m] != "function") {
                    throw "CardGroup is expected to provide methods: (" + methods.join(", ") + ")";
                }
            })
            callback(item);

        });



    },



    getClient: function(callback) {

        callback(new AppClientStoryUser());


    },

    StyleCardGroupLabel: function(el) {


        var setCardLabel = function() {
            ScoopStories.getCurrentCardLabel(function(label) {
                el.innerHTML = label;
            });
        }
        setCardLabel();

        return el;
    },

    getMap:function(){
        return false;
    },

    StyleUserIcon: function(el) {


        ScoopStories.getClient(function(client) {


            var setClientIcon = function() {
                client.getIcon(function(icon) {
                    el.setStyle("background-image", 'url("' + icon + '")');
                });
            };

            setClientIcon();
            new WeakEvent(el, client, "change", setClientIcon);


        });

        return el;
    },

    StyleCardImage: function(el, card) {

        card.getCardBackgroundImage(function(icon){
            el.setStyle("background-image", 'url("' + icon + '")');
        });

        return el;
    },

    FormatFormButton: function(btn, name) {
        return btn;
    }

    GetCardModule:function(item, application){

        var module = new ModuleArray([
        new Element('span', {"class":"icon"}),
        ScoopStories.StyleCardImage(new Element('div', {"class":"card-img"}), item),
        new Element('h3', {"html":item.getName()}),
        new Element('p', {"html":item.getDescription()})
        
        ],{"class":item.getClassNames()});

        module.getElement().addEvent('click',function())   

        return module;
    }


}



var StoryUser = new Class({
    Implements: [Events],
    initialize: function(config) {

    },
    runOnceOnLoad:function(fn){

        var me = this;
        if (me._loaded) {
            setTimeout(function(){
                fn(me);
            }, 0);
            return;
        } 

        me.addEvent('load:once', function(){
            fn(me);
        });

    },
    _setStoryData:function(stories){
        var me=this;

        me._storyData=stories;
        stories.forEach(function(story){

           if(story.attributes.isBirthStory==="true"||story.attributes.isBirthStory===true){
                me._setBirthStoryData(story);
                return;
           }


           if(story.attributes.isRepatriationStory==="true"||story.attributes.isRepatriationStory===true){
                me._setRepatriationStoryData(story);
                return;
           }


           me._addJourneyStoryData(story)




        });
        return me;
    },
    _setUserData:function(user){
        var me=this;
        me._userData=user;
        return me;
        
    },
    _setBirthStoryData:function(data){
        var me=this;
        if(me._birthStory){
            throw 'Already have birth story';
        }


        me._birthStory=new StoryCard(Object.append(data,{
             classNames: "birth-card",
        })).setUser(me);

        return me;

    },
    hasBirthStory:function(){return !!this._birthStory;},
    getBirthStory:function(){
        var me=this;
        if(!me._birthStory){
            throw 'StoryUser does not have birth story';
        }
        return me._birthStory;
    },
    _setRepatriationStoryData:function(data){
        var me=this;
        if(me._repatriationStory){
            throw 'Already have birth story';
        }


        me._repatriationStory=new StoryCard(Object.append(data,{
             classNames: "repatriation-card"
        })).setUser(me);
        return me;

    },
    hasRepatriationStory:function(){return !!this._repatriationStory;},
    getRepatriationStory:function(){
        var me=this;
        if(!me._repatriationStory){
            throw 'StoryUser does not have repatriation story';
        }
        return me._repatriationStory;
    },
    _addJourneyStoryData:function(data){
        var me=this;

        if(!me._journeyStories){
            me._journeyStories=[];
        }

        me._journeyStories.push(new StoryCard(Object.append(data,{
            classNames: "journey-card"
        })).setUser(me));

        //sort...
    },
    getJourneyStories:function(){
        var me=this;
        return me._journeyStories||[];
    },
    getIcon: function(callback) {

        var me=this;
        me.runOnceOnLoad(function(){

            callback(me._userData.icon.split('"')[1]);
        });

        // (new AjaxControlQuery(CoreAjaxUrlRoot, "get_configuration_field", {
        //     "widget": "demoConfig",
        //     "field": "item0Image"
        // })).addEvent("success", function(resp) {
        //     callback(resp.value);
        // }).execute();


    },
    getCards: function(callback) {

        (new AjaxControlQuery(CoreAjaxUrlRoot, "get_story", {
            "plugin": "MapStory",
            "user": 999
        })).addEvent("success", function(resp) {
            callback([new StoryCard()]);
        }).execute();


    },
    getCardsLabel: function(callback) {

        if (AppClient.getUserType() === "guest") {

            callback("Get Started With The Sixties Scoop Survivor Stories");
            return;
        }


        callback("Create Your Own Sixties Scoop Survivor Story");
    },
    getCardsDescription: function(callback) {
        callback("");
    }

});


var AppClientStoryUser = new Class({
    Extends: StoryUser,
    initialize:function(){

        var me=this;

         (new AjaxControlQuery(CoreAjaxUrlRoot, "get_story", {
            "plugin": "MapStory",
         })).addEvent("success", function(resp) {


            me._setStoryData(resp.story);
            me._setUserData(resp.user);
            me._loaded=true;
            me.fireEvent('load');

        }).execute();


    },

    getCards: function(callback) {

        var me=this;

        if (AppClient.getUserType() === "guest") {
            callback([new AddCard({

                label: "Create Your Story",
                formView: "loginFormView",
                classNames: "add-card journey-card"

            }), new AddCard({

                label: "Search Stories",
              
                classNames: "help-card add-card publishing-options-card",
                click:function(){
                    console.log('todo');
                }

            })]);
            return;

        }


        me.runOnceOnLoad(function(){

            var cards=[];
            if(!me.hasBirthStory()){
                cards.push(new AddCard({
                    label: "Create Birth Story",
                    formView: "createBirthStoryForm",
                    classNames: "add-card birth-card",
                    type: 'MapStory.birthStory'
                }));
            }

            if(me.hasBirthStory()){
                cards.push(me.getBirthStory());
            }
            var journeyStories=me.getJourneyStories();
            cards=cards.concat(journeyStories);



            cards.push(new AddCard({
                label: journeyStories.length?"Add More Locations Along Your Story":"Add A Location Along Your Story",
                formView: "createStoryForm",
                classNames: "add-card journey-card",
                type: 'MapStory.story'
            }));


            if(me.hasRepatriationStory()){
                cards.push(me.getRepatriationStory());
            }

            if(!me.hasRepatriationStory()){
                cards.push(new AddCard({
                    label: "Add A Repatriation Story",
                    formView: "createRepatriationStoryForm",
                    classNames: "add-card repatriation-card",
                    type: 'MapStory.repatriationStory'
                }));
            }

            cards.push(new AddCard({
                label: "Help Family Find You",
                formView: "publishingOptionsForm",
                classNames: "help-card add-card publishing-options-card"
            }));


            callback(cards);

        })
    }



})

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

    getConfig: function() {
        var me = this;
        return JSON.parse(JSON.stringify(me._config));
    },

    setUser:function(user){
        var me=this;

        me._user=user;

        return me;
    },

    getAddress: function() {
        return this._address || false;
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

    setAttributes: function(attrs) {
        this._attributes = attrs;
        return this;
    },
    
    getCardBackgroundImage:function(callback){
        return this._user.getIcon(callback);
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


var AddCard = new Class({
    Extends: StoryCard,
    hasFn:function(){
        return !!this._click;
    },
    executeFn:function(e){
        var me=this;
        if(!me.hasFn()){
            throw 'Does not have user function'
        }
        me._click(e);

    }
});