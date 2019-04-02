var StoryMapController = new Class({
    Implements: [Events],
    initialize: function() {


        var me = this;
        me.setSortFn(function(){
            //random
            return Math.round((Math.random()*2.0)-1.0);
        });

        me.addEvent('clearCards', function(cards) {
            me.markersForCards(cards, function(marker) {
                if (marker === me._activeMarker) {
                    me._activeMarker = null;
                }
                me.scaleIcon(marker, 10);
            });
        });

        me.addEvent('setCards', function(cards, group) {
            me.markersForCards(cards, function(marker) {
                me.scaleIcon(marker, 20);
            });
            if (group instanceof StoryUser) {
                me.linkCardsOnMap(cards);
            }
            me.focusCurrentStory();
        });

    },



    getCurrentCards: function(callback) {


        var me = this;

        if (me._cards) {
            callback(me._cards.slice(0));
            return;
        }

        me.getCurrentCardGroup(function(group) {
            group.getCards(function(cards) {
                me._cards = cards;
                callback(me._cards.slice(0));
                me.fireEvent('setCards', [me._cards.slice(0), group]);

            });
        });

    },

    getCurrentCardLabel: function(callback) {

        var me = this;
        me.getCurrentCardGroup(function(group) {

            group.getCardsLabel(function(label) {

                var div = label;

                if (!(div && div.tagName)) {
                    div = new Element('div');
                }

                if (typeof label == "string") {

                    div.appendChild(new Element('span', {
                        "html": label
                    }));
                }

                if (!(group instanceof StoryUser && (group.isCurrentUser()))) {
                    div.appendChild(new Element('span', {
                        "class": "user-link",
                        "html": " Go to your own story",
                        events: {
                            click: function() {
                                ScoopStories.loadCardGroupWithUserId(AppClient.getId(), function() {
                                    //ScoopStories.focusCurrentStory();
                                })
                            }
                        }
                    }));
                }



                callback(div);

            });
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

    initializeSidePanel: function(sidePanel, el) {
        var me = this;
        var sidePanelViewer = new ContentModuleViewer(el, {});


        me.getApp(function(app) {
            app.getDisplayController().display('sidePanelDetail', AppClient, sidePanelViewer);
        });

        

        sidePanel.addEvent('show', function(){

            $$('.TileButtonsFunctionsSection')[0].addClass('shifted');

        }).addEvent('hide', function(){

            $$('.TileButtonsFunctionsSection')[0].removeClass('shifted');

        })

        

    },

    getSearchAggregators: function(search) {

        return [
            new StorySearch(search, {})
        ];

    },
    initializeApplication: function(app) {
        var me = this;
        me._app = app;

        me.fireEvent('loadApp', [app]);
    },

    initializeMap: function(map) {

        var me = this;
        me._map = map;
        map.setMapitemSelectFn(function(item) {

            me.selectCard(item.getId());

        });


        map.getLayerManager().getLayers().forEach(function(layer) {

            layer.getItems().forEach(function(marker) {
                me.scaleIcon(marker, 10);
            });

            //layer.addEvent('')

        })

        me.fireEvent('loadMap', [map]);


    },

    selectCard: function(id) {
        var me = this;

        if (me.hasCard(id)) {
            me.focusCard(me.getCard(id));
            return;
        }

        me.loadCardGroupWithCardId(id, function() {
            setTimeout(function() {
                //TODO loading card group already moves the map
                me.focusCard(me.getCard(id))
            }, 250);
        });

    },

    focusCurrentStory: function() {

        var me = this;
        me.getCurrentCards(function(cards) {

            var markers = [];
            var addMarker = function(marker) {
                markers.push(marker);
            }

            var _timeout = null;
            var fitBounds = function() {

                if (_timeout) {
                    clearTimeout(_timeout);
                }

                _timeout = setTimeout(function() {
                    _timeout = null;
                    if (markers.length == 0) {
                        return;
                    }
                    if (markers.length == 1) {
                        me.getMap().panTo(markers[0].getLatLng());
                        return;
                    }

                    me.getMap().fitBounds(SpatialCalculator.calculateBounds(markers));

                }, 250);


            }

            me.markersForCards(cards, function(marker) {
                addMarker(marker);
            });


            fitBounds();


            addMarker = function(marker) {
                markers.push(marker);
                fitBounds();
            }


        });

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

            //me.getMap().panTo(marker.getLatLng());
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

    loadCardGroupWithUserId: function(id, callback) {


        var me = this;


        if (id == -1 && AppClient.getUserType() == "guest") {
            me.setCardGroup(new AppClientStoryUser(), callback);
            return;
        }


        (new AjaxControlQuery(CoreAjaxUrlRoot, "get_story_with_user", {
            "plugin": "MapStory",
            "user": id
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
            me.fireEvent('setCards', [me._cards.slice(0), group]);
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
        return $$('.story-list .card-id-' + id)[0];
    },


    getClient: function(callback) {

        callback(new AppClientStoryUser());


    },
    setSortFn: function(fn, name){
        
        var me=this;
        me._sortFn=fn;
        me._sortName=name;
        return me;

    },
    getSortName:function(){
        var me=this;
        return me._sortName;
    },
    getSortFn:function(){

        var me=this;
        return me._sortFn;

    },
    StyleCardGroupLabel: function(el) {

        var me = this;
        var setCardLabel = function() {
            me.getCurrentCardLabel(function(label) {
                if (typeof label == "string") {
                    el.innerHTML = label;
                    return;
                }

                el.innerHTML = "";
                if (label) {
                    el.appendChild(label);
                }
            });

        }
        setCardLabel();


        new WeakEvent(el, me, 'setCards', setCardLabel);
        //me.addEvent('setCards', setCardLabel);

        return el;
    },



    GetAddCardModule: function(item, application) {

        var me = this;
        var button = new Element('button', {
            html: item.getLabel(),
            "class": item.getClassNames()
        });
        button.appendChild(new Element('span', {
            "class": "icon"
        }));

        if (item.hasFn()) {


            button.addEvent('click', item.executeFn.bind(item));
            return button;

        }


        new UIModalFormButton(
            button,
            application, item, {
                formName: item.getFormView(),
                formOptions: {
                    template: "form"
                }

            }
        );



        return button;

    },

    GetSortCardModule: function(item, application) {

        var me = this;
        var div = new Element('div', {
            "class": item.getClassNames()
        });

        var sortBtn = function(btnOptions) {

            var btn=new Element('button', {
                "html":btnOptions.label,
                "class":(me.getSortName()==btnOptions.sortName?"current":""),
                "events":{
                    "click":function(){
                        me.setSortFn(btnOptions.sortFn, btnOptions.sortName);
                        me._cards=null;
                        me.redraw();
                    }
                }
            });



            if (item.hasResults()) {
                return btn;
            }
            btn.addClass('disabled');
            btn.setAttribute('disabled', true);


            return btn;
        }


        div.appendChild(new Element('h3', {
            "html": "Sort"
        }));


        div.appendChild(sortBtn({
            "label": "<h3>Alphabetically name</h3>",
            "sortFn":function(a, b){
                //random
                return Math.round((Math.random()*2.0)-1.0);
            },
            "sortName":'name'
        }));

        div.appendChild(sortBtn({
            "label": "<h3>Date of birth</h3>",
            "sortFn": function(a, b){
                //random
                return Math.round((Math.random()*2.0)-1.0);
            },
            "sortName": 'birth-date'
        }));
        div.appendChild(sortBtn({
            "label": "<h3>Alpabetically name at birth</h3>",
            "sortFn": function(a, b){
                //random
                return Math.round((Math.random()*2.0)-1.0);
            },
            "sortName": 'birth-name'
        }));
        div.appendChild(sortBtn({
            "label": "<h3>Year adompted</h3>",
            "sortFn": function(a, b){
                //random
                return Math.round((Math.random()*2.0)-1.0);
            },
            "sortName": 'adopted-year'
        }));

        return div;

    },

    GetProfileSummaryCardModule: function(item, application) {

        var me = this;
        var div = new Element('div', {
            "class": item.getClassNames()
        });
        div.appendChild(new Element('h3', {
            "html": "Name: "+item.getUsersName()
        }));

        var user=item.getUser();
        var birthdate="unknown";
        if(user.hasBirthStory()){
            birthdate=user.getBirthStory().getYear();
        }

        div.appendChild(new Element('h4', {
            "html": "Date of birth: "+birthdate
        }));
        div.appendChild(new Element('h4', {
            "html": "Place of birth: {birthplace}"
        }));
        div.appendChild(new Element('h4', {
            "html": "Name at birth: {birthname}"
        }));
        div.appendChild(new Element('h4', {
            "html": "Year adopted: {adoptedyear}"
        }));
        div.appendChild(new Element('h4', {
            "html": "Reunited with family: {reunited?}"
        }));
        div.appendChild(new Element('h4', {
            "html": "Looking for family: {looking?}"
        }));
        return div;

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

    getApp: function(callback) {
        var me = this;

        if (callback) {

            if (!me._app) {

                me.addEvent('loadApp:once', function(app) {
                    callback(app);
                });
                return;
            }


            callback(me._app);
            return;


        }

        if (!me._app) {
            throw 'app is not initialized'
        }
        return me._app;
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
            if (!icon) {
                return;
            }
            el.setStyle("background-image", 'url("' + icon + '")');
        });

        return el;
    },

    FormatFormButton: function(btn, name) {
        return btn;
    },

    GetCardModule: function(item, application) {

        var me = this;



        var getCardName=function(card){
            var me=this;

            var name=card.getName();

            if(card.isBirthStory()){
                name="birth story"
            }
            return name;
        };

        var getCardDescription=function(card){
            var me=this;

            var name=card.getName();

            if(card.isBirthStory()){
                var userWas=card.belongsToCurrentUser()?"You were":card.getUsersName()+" was";
                name=userWas+" born in "+card.getYear();
            }
            return name;
        };


        var modules = [
            new Element('span', {
                "class": "icon"
            }),
            ScoopStories.StyleCardImage(new Element('div', {
                "class": "card-img"
            }), item),
            new Element('h3', {
                "html": getCardName(item)
            }),
            new Element('p', {
                "html": getCardDescription(item)
            })

        ];

        if (item.canEdit()) {
            modules = modules.concat([
                new Element('span', {
                    "class": "edit-btn",
                    events: {
                        click: function(e) {


                            application.getDisplayController().displayPopoverForm(
                                item.getFormView(),
                                item, {
                                    template: "form"
                                }
                            );
                        }
                    }
                }),
                new Element('span', {
                    "class": "delete-btn",
                    events: {
                        click: function(e) {
                            (new UIModalDialog(me.getApp(), {
                                name: "Confirmation",
                                description: "Are you sure you want to delete this card"
                            }, {
                                "formName": "dialogForm",
                                "formOptions": {
                                    "template": "form",
                                    "className": "confirm-view"
                                }
                            })).show(function(answer) {



                            });
                        }
                    }
                })
            ]);
        }

        var module = new ModuleArray(modules, {
            "class": item.getClassNames()
        });

        module.getElement().setAttribute('data-id', item.getId());
        module.getElement().addClass('card-id-' + item.getId());
        module.getElement().addEvent('click', function() {


            //marker.activate();
            //item.setActive();
            me.selectCard(item.getId());

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
        var me = this;
        me.getMap(function(map) {
            me._markerCardsFilter(cards).forEach(function(card) {
                map.getLayerManager().filterMarkerById(card.getId(), callback);
            });
        });
    },
    _markerCardsFilter: function(cards) {
        return cards.filter(function(card) {
            return (card instanceof StoryCard && (!(card instanceof AddCard || card instanceof ProfileSummaryCard || card instanceof SortCard)));
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
    getFirstStory: function() {
        var me = this;
        return me._birthStory || (me._journeyStories && me._journeyStories.length ? me._journeyStories[0] : me._repatriationStory) || null;
    },
    isCurrentUser: function() {
        var me = this;
        return me.getUserId() === AppClient.getId();
    },

    getUsersName: function() {
        var me = this;
        if (me._userData) {
            return me._userData.name;
        }

        return 'Unknown';
    },

    getUserId: function() {

        var me = this;
        if (me._userData) {
            return parseInt(me._userData.id);
        }

        return -1;
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

            cards.push(
                (new ProfileSummaryCard(Object.append({

                }, {
                    classNames: "summary-card",
                }))).setUser(me)
            );

            if (!me.hasBirthStory()) {
                if (me.canEdit()) {
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


            if (me.canEdit()) {
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
                if (me.canEdit()) {
                    cards.push(new AddCard({
                        label: "Add A Repatriation Story",
                        formView: "createRepatriationStoryForm",
                        classNames: "add-card repatriation-card",
                        type: 'MapStory.repatriationStory'
                    }));
                }
            }

            if (me.canEdit()) {
                cards.push(new AddCard({
                    label: "Help Family Find You",
                    formView: "publishingOptionsForm",
                    classNames: "help-card add-card publishing-options-card"
                }));
            }


            callback(cards);

        })


    },
    canEdit: function() {
        var me = this;

        if (me._userData && parseInt(me._userData.id) === AppClient.getId()) {
            return true;
        }

        return AppClient.getUserType() === "admin";
    },
    getCardsLabel: function(callback) {

        var me = this;


        if (!me.isCurrentUser()) {

            var div = new Element('div');
            div.appendChild(new Element('span', {
                "class": "user-name",
                "html": me.getUsersName() + "'s "
            }));
            div.appendChild(new Element('span', {
                "html": "Sixties Scoop Survivor Story "
            }))

            callback(div);
            return;
        }

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
    canEdit: function() {
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

    getYear:function(){
        var me=this;
        if(me._config.attributes.locationDate&&me._config.attributes.locationDate!=''){
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

    getUser:function(){
        var me=this;
        return me._user;
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
        if (!me._user) {
            callback(null);
            return null;
        }
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



var SortCard = new Class({
    Extends: StoryCard,
    canEdit: function() {
        return false;
    },
    hasResults: function() {
        var me = this;
        return me._results().length;;
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



var AdvancedStorySearch = new Class({
    Extends: MockDataTypeItem,
    initialize: function(options) {
        var me = this;
        me.parent(options);

    },
    save: function(cb) {

        var me = this;
        ScoopStories.setCardGroup(me, function() {

        });

    },
    getCards: function(cb) {



        var me = this;


        if(me._cards){
            cb(me._padCards(me._cards));
            return;
        }


        ScoopStories.getMap(function(map) {
            var randomIds = map.getLayerManager().filterMapitems(function() {

                var r = Math.round(Math.random()) >= 1;
                return r;

            }).map(function(feature) {
                return feature.getId();
            });


          

            (new AjaxControlQuery(CoreAjaxUrlRoot, 'get_feature_list', {
                'plugin': 'MapStory',
                'items': randomIds
            })).addEvent('success', function(resp) {

                var randomSearchCards =resp.results.map(function(data){

                    var card = new StoryCard(Object.append(data, {
                        classNames: "search-card-detail"
                    }));
                    var user = new StoryUser({
                        "story": [],
                        "user": Object.append({}, data.userData)
                    });
                    card.setUser(user);
                    return card;
                });

                me._cards=randomSearchCards;
                cb(me._padCards(randomSearchCards));

            }).execute();

           


        })



    },
    _padCards:function(searchCards){


        var cards = [
            new SortCard(Object.append({
                results: function() {
                    return searchCards;
                }
            }, {
                classNames: "sort-card summary-card",
            }))
        ];


        if (searchCards.length == 0) {
            cards.push(new AddCard({

                label: "Empty Search Results",

                classNames: "help-card add-card publishing-options-card",
                click: function() {
                    console.log('todo');
                }

            }));

            return cards;
        }


        return cards.concat(searchCards.sort(ScoopStories.getSortFn()));


    },
    getCardsLabel: function(cb) {

        return cb("Search Results");
    }
})

var StorySearch = new Class({
    Extends: UISearchListAggregator,
    initialize: function(search, options) {
        //var me = this;
        this.parent(search, Object.append({

            PreviousTemplate: UIListAggregator.PreviousTemplate,
            MoreTemplate: UIListAggregator.MoreTemplate,
            ResultTemplate: UIListAggregator.NamedViewTemplate(ScoopStories.getMap.bind(ScoopStories), {
                namedView: "scoopStoryDetail",
                formatResult: function(data) {


                    var card = new StoryCard(Object.append(data, {
                        classNames: "search-card"
                    }));
                    var user = new StoryUser({
                        "story": [],
                        "user": Object.append({}, data.userData)
                    });
                    card.setUser(user)

                    return card;
                },
                events: {
                    click: function() {


                    }
                }
            })

        }, options));
    },
    _getRequest: function(filters) {
        var me = this;
        var string = me.currentSearchString;

        var args = {
            search: string,
            searchOptions: filters
        };

        return new AjaxControlQuery(CoreAjaxUrlRoot, 'search', Object.append({
            'plugin': 'MapStory'
        }, args));


    }
});