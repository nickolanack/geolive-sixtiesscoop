var StoryMapController = new Class({
    Implements: [Events],
    initialize: function() {


        var me = this;

        me.addEvent('clearCards', function(cards) {
            me.markersForCards(cards, function(marker){
                if(marker===me._activeMarker){
                    me._activeMarker=null;
                }
                me.scaleIcon(marker, 10);
            });
        });

        me.addEvent('setCards', function(cards) {
            me.markersForCards(cards, function(marker){
                 me.scaleIcon(marker, 20);
            });
            me.linkCardsOnMap(cards);

        });

    },

    getCurrentCards: function(application, callback) {


        var me = this;

        if (me._cards) {
            callback(me._cards.slice(0));
            return;
        }

        me.getCurrentCardGroup(function(group) {
            group.getCards(function(cards) {
                me._cards = cards;
                callback(me._cards.slice(0));
                me.fireEvent('setCards', [me._cards.slice(0)]);

            });
        });

    },

    getCurrentCardLabel: function(callback) {

        var me = this;
        me.getCurrentCardGroup(function(group) {

            group.getCardsLabel(callback);
        });

    },

    getCurrentCardGroup: function(callback) {

        var me = this;

        if (me._group) {

            callback(me._group);
            return;
        }

        me.getClient(function(item) {

            var methods = ["getCards", "getCardsLabel", "getCardsDescription"];
            methods.forEach(function(m) {
                if (typeof item[m] != "function") {
                    throw "CardGroup is expected to provide methods: (" + methods.join(", ") + ")";
                }
            })
            me._group = item;
            callback(item);

        });



    },

    initializeStoryView: function(storyView) {

        var me = this;
        me._storyView = storyView;



    },

    initializeMap: function(map) {

        var me = this;
        me._map = map;
        map.setMapitemSelectFn(function(item) {

            if (me.hasCard(item.getId())) {
                me.focusCard(me.getCard(item.getId()));
                return;
            }

            me.loadCardGroupWithCardId(item.getId(), function() {
                me.focusCard(me.getCard(item.getId()))
            });

        });


        map.getLayerManager().getLayers().forEach(function(layer) {

            layer.getItems().forEach(function(marker) {
                me.scaleIcon(marker, 10);
            });

            //layer.addEvent('')

        })

        me.fireEvent('loadMap', [map]);


    },



    focusCard: function(card) {

        var me = this;
        if (me._activeCard) {
            me._unfocusCard();
        }
        me._activeCard = card;
        if (me._activeMarker) {
            me.scaleIcon(me._activeMarker, 20);
        }


        var marker = me.getMarker(card.getId(), function(marker) {

            me._activeMarker = marker;

            me.getMap().panTo(marker.getLatLng());
            me.scaleIcon(marker, 40);

            



        });



        cardEl = me.getCardEl(card.getId());
        if (cardEl) {
            cardEl.addClass('active');
            return;
        }


        throw "cant find card el!";



    },
    scaleIcon: function(marker, x) {

        var icon = marker.getMapObject().getIcon();

        if (icon.url) {
            icon = icon.url;
        }

        icon = {
            url: icon,
            scaledSize: new google.maps.Size(x, x)
        };

        marker.getMapObject().setIcon(icon);



    },
    _unfocusCard: function(card) {

        var me = this;
        if (!me._activeCard) {
            return;
        }

        var card = me._activeCard;
        me._activeCard = null;

        cardEl = me.getCardEl(card.getId());
        if (cardEl) {
            cardEl.removeClass('active');
        }



    },
    loadCardGroupWithCardId: function(id, callback) {


        var me = this;

        (new AjaxControlQuery(CoreAjaxUrlRoot, "get_story_with_item", {
            "plugin": "MapStory",
            "item": id
        })).addEvent("success", function(resp) {


            me.setCardGroup(new StoryUser(resp), callback);


        }).execute();


        //throw 'load card group with card: '+id;

    },

    setCardGroup: function(group, callback) {
        var me = this;
        me._group = group;

        group.getCards(function(cards) {

            if (me._cards) {
                me.fireEvent('clearCards', [me._cards.slice(0)]);
            }

            me._cards = cards;
            me.fireEvent('setCards', [me._cards.slice(0)]);
            me.redraw(callback)
        })

    },
    redraw: function(callback) {
        var me = this;
        if (!me._storyView) {
            throw 'story view not initialized';
        }
        me._storyView.addEvent('load:once', function() {
            if (callback) {
                callback();
            }
        });
        me._storyView.redraw();


    },


    hasCard: function(id) {
        var me = this;
        if (!me._cards) {
            return false;
        }

        for (var i = 0; i < me._cards.length; i++) {
            if (me._cards[i].getId() + "" === id + "") {
                return true;
            }
        }

        return false;

    },
    getCard: function(id) {
        var me = this;
        if (!me._cards) {
            throw 'no cards are loaded';
        }

        for (var i = 0; i < me._cards.length; i++) {
            if (me._cards[i].getId() + "" === id + "") {
                return me._cards[i];
            }
        }

        throw 'cards:' + id + ' is not available';
    },
    getCardEl: function(id) {
        return $$('.card-id-' + id)[0];
    },


    getClient: function(callback) {

        callback(new AppClientStoryUser());


    },

    StyleCardGroupLabel: function(el) {

        var me = this;
        var setCardLabel = function() {
            me.getCurrentCardLabel(function(label) {
                el.innerHTML = label;
            });
        }
        setCardLabel();

        return el;
    },

    getMap: function(callback) {
        var me = this;

        if (callback) {

            if (!me._map) {

                me.addEvent('loadMap:once', function(map) {
                    callback(map);
                });
                return;
            }


            callback(me._map);
            return;


        }

        if (!me._map) {
            throw 'map is not initialized'
        }
        return me._map;
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

        card.getCardBackgroundImage(function(icon) {
            el.setStyle("background-image", 'url("' + icon + '")');
        });

        return el;
    },

    FormatFormButton: function(btn, name) {
        return btn;
    },

    GetCardModule: function(item, application) {

        var me = this;

        var module = new ModuleArray([
            new Element('span', {
                "class": "icon"
            }),
            ScoopStories.StyleCardImage(new Element('div', {
                "class": "card-img"
            }), item),
            new Element('h3', {
                "html": item.getName()
            }),
            new Element('p', {
                "html": item.getDescription()
            })

        ], {
            "class": item.getClassNames()
        });

        module.getElement().setAttribute('data-id', item.getId());
        module.getElement().addClass('card-id-' + item.getId());
        module.getElement().addEvent('click', function() {


            //marker.activate();
            //item.setActive();
            me.focusCard(item);

        });



        return module;
    },

    getMarker: function(id, callback) {
        var me = this;
        me.getMap(function(map) {
            map.getLayerManager().filterMarkerById(id, callback);
        })
    },

    linkCardsOnMap: function(cards) {

        var me = this;
        me.getMap(function(map) {



            var markerCards = me._markerCardsFilter(cards);

            if (!me._layer) {
                me._layer = new BaseLayer(map.getLayerManager(), {
                    name: 'Story Lines',
                    id: 9999999
                });



                map.getLayerManager().addLayer(me._layer);
            }

            var layer = me._layer;

            layer.getItems().forEach(function(item) {
                layer.removeItem(item);
            });


            var lastCardMarker = null;
            var linkNextCard = function() {
                if (markerCards.length == 0) {
                    return;
                }
                var currentCard = markerCards.shift();

                map.getLayerManager().filterMarkerById(currentCard.getId(), function(currentMarker) {
                    if (lastCardMarker) {
                        if (!currentMarker) {
                            throw 'unable to find marker: ' + currentCard.getId();
                        }
                        // map.createMapFeature('line', {});

                        var data = {
                            lineColor: "#ff0000",
                            lineWidth: 3,
                            geodesic: true,
                            coordinates: [
                                [lastCardMarker.getLatLng().lat, lastCardMarker.getLatLng().lng],
                                [currentMarker.getLatLng().lat, currentMarker.getLatLng().lng]
                            ]
                        };
                        var line = new GeoliveLine(new google.maps.Polyline({
                            strokeColor: data.lineColor || MapFactory.COLOR,
                            strokeOpacity: data.lineOpacity || MapFactory.OPACITY,
                            strokeWeight: data.lineWidth || MapFactory.WIDTH,
                            clickable: !!(data.clickable || true),
                            geodesic: !!(data.geodesic || false),
                            path: data.coordinates.map(function(c) {
                                return new google.maps.LatLng(c[0], c[1]);
                            })
                        }), data);


                        line.setLayer(layer);
                    }

                    lastCardMarker = currentMarker;
                    linkNextCard();
                });


            };
            linkNextCard();

        });
    },
    markersForCards: function(cards, callback) {
        var me=this;
        me.getMap(function(map) {
            me._markerCardsFilter(cards).forEach(function(card){
                map.getLayerManager().filterMarkerById(card.getId(), callback);
            });
        });
    },
    _markerCardsFilter: function(cards) {
        return cards.filter(function(card) {
            return (card instanceof StoryCard && (!(card instanceof AddCard)));
        });
    }


});


var ScoopStories = new StoryMapController();


var StoryUser = new Class({
    Implements: [Events],
    initialize: function(config) {

        var me = this;
        me._setStoryData(config.story);
        me._setUserData(config.user);
        me._loaded = true;
        me.fireEvent('load');

    },
    runOnceOnLoad: function(fn) {

        var me = this;
        if (me._loaded) {
            setTimeout(function() {
                fn(me);
            }, 0);
            return;
        }

        me.addEvent('load:once', function() {
            fn(me);
        });

    },
    _setStoryData: function(stories) {
        var me = this;

        me._storyData = stories;
        stories.forEach(function(story) {

            if (story.attributes.isBirthStory === "true" || story.attributes.isBirthStory === true) {
                me._setBirthStoryData(story);
                return;
            }


            if (story.attributes.isRepatriationStory === "true" || story.attributes.isRepatriationStory === true) {
                me._setRepatriationStoryData(story);
                return;
            }


            me._addJourneyStoryData(story)



        });
        return me;
    },
    _setUserData: function(user) {
        var me = this;
        me._userData = user;
        return me;

    },
    _setBirthStoryData: function(data) {
        var me = this;
        if (me._birthStory) {
            throw 'Already have birth story';
        }


        me._birthStory = new StoryCard(Object.append(data, {
            classNames: "birth-card",
        })).setUser(me);

        return me;

    },
    hasBirthStory: function() {
        return !!this._birthStory;
    },
    getBirthStory: function() {
        var me = this;
        if (!me._birthStory) {
            throw 'StoryUser does not have birth story';
        }
        return me._birthStory;
    },
    _setRepatriationStoryData: function(data) {
        var me = this;
        if (me._repatriationStory) {
            throw 'Already have birth story';
        }


        me._repatriationStory = new StoryCard(Object.append(data, {
            classNames: "repatriation-card"
        })).setUser(me);
        return me;

    },
    hasRepatriationStory: function() {
        return !!this._repatriationStory;
    },
    getRepatriationStory: function() {
        var me = this;
        if (!me._repatriationStory) {
            throw 'StoryUser does not have repatriation story';
        }
        return me._repatriationStory;
    },
    _addJourneyStoryData: function(data) {
        var me = this;

        if (!me._journeyStories) {
            me._journeyStories = [];
        }

        me._journeyStories.push(new StoryCard(Object.append(data, {
            classNames: "journey-card"
        })).setUser(me));

        //sort...
    },
    getJourneyStories: function() {
        var me = this;
        return me._journeyStories || [];
    },
    getIcon: function(callback) {

        var me = this;
        me.runOnceOnLoad(function() {

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

        var me = this;

        me.runOnceOnLoad(function() {

            var cards = [];
            if (!me.hasBirthStory()) {
                if(me.canEdit()){
                    cards.push(new AddCard({
                        label: "Create Birth Story",
                        formView: "createBirthStoryForm",
                        classNames: "add-card birth-card",
                        type: 'MapStory.birthStory'
                    }));
                }
            }

            if (me.hasBirthStory()) {
                cards.push(me.getBirthStory());
            }
            var journeyStories = me.getJourneyStories();
            cards = cards.concat(journeyStories);


            if(me.canEdit()){
                cards.push(new AddCard({
                    label: journeyStories.length ? "Add More Locations Along Your Story" : "Add A Location Along Your Story",
                    formView: "createStoryForm",
                    classNames: "add-card journey-card",
                    type: 'MapStory.story'
                }));
            }

            if (me.hasRepatriationStory()) {
                cards.push(me.getRepatriationStory());
            }

            if (!me.hasRepatriationStory()) {
                if(me.canEdit()){
                    cards.push(new AddCard({
                        label: "Add A Repatriation Story",
                        formView: "createRepatriationStoryForm",
                        classNames: "add-card repatriation-card",
                        type: 'MapStory.repatriationStory'
                    }));
                }
            }

            if(me.canEdit()){
                cards.push(new AddCard({
                    label: "Help Family Find You",
                    formView: "publishingOptionsForm",
                    classNames: "help-card add-card publishing-options-card"
                }));
            }


            callback(cards);

        })


    },
    canEdit:function(){
        return AppClient.getUserType() === "admin";
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
    },


});


var AppClientStoryUser = new Class({
    Extends: StoryUser,
    initialize: function() {

        var me = this;

        (new AjaxControlQuery(CoreAjaxUrlRoot, "get_story", {
            "plugin": "MapStory",
        })).addEvent("success", function(resp) {


            me._setStoryData(resp.story);
            me._setUserData(resp.user);
            me._loaded = true;
            me.fireEvent('load');

        }).execute();


    },
    canEdit:function(){
        return true;
    },
    getCards: function(callback) {

        var me = this;

        if (AppClient.getUserType() === "guest") {
            callback([new AddCard({

                label: "Create Your Story",
                formView: "loginFormView",
                classNames: "add-card journey-card"

            }), new AddCard({

                label: "Search Stories",

                classNames: "help-card add-card publishing-options-card",
                click: function() {
                    console.log('todo');
                }

            })]);
            return;

        }

        me.parent(callback);
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

    setUser: function(user) {
        var me = this;

        me._user = user;

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

    getCardBackgroundImage: function(callback) {
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
    hasFn: function() {
        return !!this._click;
    },
    executeFn: function(e) {
        var me = this;
        if (!me.hasFn()) {
            throw 'Does not have user function'
        }
        me._click(e);

    }
});