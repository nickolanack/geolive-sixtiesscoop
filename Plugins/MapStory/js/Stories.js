var StoryMapController = new Class({
    Implements: [Events],
    initialize: function() {


        var me = this;
        me.setSortFn(function() {
            //random
            return Math.round((Math.random() * 2.0) - 1.0);
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

        var needsDisclaimer=function(){
            return localStorage.getItem("hasViewedDisclaimer") !== "Yes";
        }


        me.addEvent('loadMap', function() {
            var showDisclaimer = function() {
                (new AjaxControlQuery(CoreAjaxUrlRoot, "get_metadata", {
                    "widget": "disclaimer"
                })).addEvent("success", function(resp) {

                    var d=new Element('div');
                    var p=new Element('p', {
                        style: "padding: 30px;",
                        html: "<h1>Disclaimer</h1>" + resp.metadata.positions.content.modules[1].config.text
                    });
                    d.appendChild(p);
                    //if(needsDisclaimer()){
                    var button=d.appendChild(new Element('button',{"html":"Accept", "class":"disclaimer primary-btn "+(!needsDisclaimer()?"disabled":""), events:{click:function(){
                        box.close();
                    }}}));
                    if(!needsDisclaimer()){
                        new UIPopover(button,{
                            description:"You've already accepted the terms",
                            anchor:UIPopover.AnchorAuto()
                        });
                    }else{
                        new UIPopover(button,{
                            description:"You must accept the terms to use this site",
                            anchor:UIPopover.AnchorAuto()
                        });
                    }


                    var box=PushBox.Open(d, {
                        handler: 'append',
                        closable:!needsDisclaimer(),
                        size: {
                            x: 700,
                            y: 500
                        },
                        push: true
                    });


                    localStorage.setItem("hasViewedDisclaimer", "Yes");

                }).execute();
            }

            if (needsDisclaimer()) {
                showDisclaimer();
            }


            var link = $("disclaimer-link");
            if (link) {
                link.onclick = function() {
                    showDisclaimer();
                    return false;
                }
            }
        })



    },

    clearCards: function() {

        var me = this;
        me._cards = null;
        return me;

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


    setSidePanelView: function(view, item, className) {

        var me = this;
        
            me.getApp(function(app) {
                

                me._sidePanel.useDisplayController(app.getDisplayController());
                me._sidePanel.renderNamedView(view, item);
                
                if (me._sidePanelClassName) {
                    me._sidePanel.getElement().removeClass(me._sidePanelClassName);
                    delete me._sidePanelClassName
                }
                if (className) {
                    me._sidePanelClassName = className
                    me._sidePanel.getElement().addClass(me._sidePanelClassName)
                }


            });




    },

    initializeSidePanelLeft: function(sidePanel, el) {



        var me = this;
        me._sidePanel = sidePanel;

        var clear = function() {
            me.setSidePanelView('sidePanelEmptyDetail', AppClient, 'empty');
        }

        clear();

        me.addEvent('unfocusCard', clear);


        me.addEvent('focusCard', function(card) {
            me.setSidePanelView('sidePanelDetailList', card, 'item-content');
            sidePanel.show();
        });

        me.addEvent('showDispersion', function(graph) {
            me.setSidePanelView('sidePanelGraphDetail', graph, 'graph-analytics');
        });
        me.addEvent('hideDispersion', clear);


        sidePanel.addEvent('show', function() {

            $$('.left-center.ltr>*').forEach(function(el) {
                el.addClass('shifted');
            });

        }).addEvent('hide', function() {

            $$('.left-center.ltr>*').forEach(function(el) {
                el.removeClass('shifted');
            });

        });

        me._addSidePanelToggleTips(sidePanel, '.SideBarWidget.left .toggle-button');

    },


    CardGroupsBefore: function(item){
        var me = this;
        var items = [];

        var realCards = item.getUser().getRealCardsSync();

        if (!(item.isBirthStory && item.isBirthStory())) {
            if (item.getUser().hasBirthStory()) {

                items.push(new StoryGroup({
                    type: "Birth Story",
                    isBirthStory: true,
                    description: "",
                    cards: [realCards.shift()]
                }));
            }

        }

        var beforeCards = [];
        while (realCards.length && realCards[0] !== item) {
            beforeCards.push(realCards.shift());
        }

        if (beforeCards.length) {
            items.push(new StoryGroup({
                type: "Previous Stories",
                description: beforeCards.length + " more " + (beforeCards.length == 1 ? "story" : "stories") + " before this",
                cards: beforeCards
            }));
        }

        return items;
    },


    CardGroupsAfter: function(item){
        var me = this;
        var items = [];

        var realCards = item.getUser().getRealCardsSync();

        while (realCards.length && realCards[0] !== item) {
            realCards.shift();
        }
        realCards.shift();

        var afterCards = realCards.slice(0);


        var repatriation = [];
        if (afterCards.length) {
            if (afterCards[afterCards.length - 1].isRepatriationStory()) {
                repatriation.push(afterCards.pop())
            }
        }

        if (afterCards.length) {

            items.push(new StoryGroup({
                type: "Next Stories",
                description: afterCards.length + " more " + (afterCards.length == 1 ? "story" : "stories") + " after this",
                cards: afterCards
            }));
        }

        if (repatriation.length) {

            items.push(new StoryGroup({
                type: "Repatriation Story",
                description: "",
                isRepatriationStory:true,
                cards: repatriation
            }));
        }

        return items;
          
    },


    SidePanelStoryListItems: function(item) {


        var me = this;
        var items = [item.getUser()];

        items=items.concat(me.CardGroupsBefore(item))
        items.push(item);
        items=items.concat(me.CardGroupsAfter(item))

        return items;

    },

    _addSidePanelToggleTips: function(sidePanel, selector) {

        var sidePanelTipTimeout;
        var showToggleTip = function() {

            if (sidePanelTipTimeout) {
                clearInterval(sidePanelTipTimeout);
            }

            var toggle = $$(selector)[0];

            toggle.addClass('just-closed');

            sidePanelTipTimeout = setTimeout(hideToggleTip, 2000);

        };
        var hideToggleTip = function() {
            if (sidePanelTipTimeout) {
                clearInterval(sidePanelTipTimeout);
            }
            sidePanelTipTimeout = null;
            var toggle = $$(selector)[0];
            toggle.removeClass('just-closed');
        }


        sidePanel.addEvent('show', hideToggleTip).addEvent('hide', showToggleTip)
    },



    getEmptySelectionHtml: function() {

        var me = this;

        var div = new Element('div', {
            "class": "empty-section"
        });
        div.appendChild(new Element('h3', {
            'html': 'Empty selection'
        }));
        div.appendChild(new Element('p', {
            'html': 'click a marker on the map, or search a story to see details here.'
        }));


        var div2 = new Element('div', {

            "class": "help-section empty-section"

        }).addEvent("click", function() {

            me.getMap().getNamedValue('Tutorial', function(tut) {
                tut.toggle();
            });

        })

        div2.appendChild(new Element('h3', {
            'html': 'How to get started'
        }));
        div2.appendChild(new Element('p', {
            'html': 'do you want to create a story or find family?'
        }));

        div.appendChild(div2);



        return div;

    },

    getNavigationHtml: function(item) {

        var me = this;

        var nav = new Element('div', {
            "class": "story-navigation"
        });



        var back = nav.appendChild(new Element('button', {
            "class": "back"
        }));


        var forward = nav.appendChild(new Element('button', {
            "class": "forward"
        }));


        item.getUser().getCards(function(rawCards) {

            var cards = rawCards.filter(function(card) {
                return card.getId && card.getId() > 0;
            });

            var index = cards.indexOf(item);

            if (index > 0) {
                back.addClass('active');
                back.addEvent('click', function() {
                    me.selectCard(cards[index - 1].getId());
                })
            }
            if (index + 1 < cards.length) {
                forward.addClass('active');
                forward.addEvent('click', function() {
                    me.selectCard(cards[index + 1].getId());
                })
            }


        })



        return nav;
    },

    initializeAdoptionTile: function(map, tile, control) {

        var me = this;
        var graph = (new UIDispersionGraph(map, tile, control))
        graph.addEvent('activate', function() {

            var activeCard = me._activeCard;
            if (activeCard) {
                me._unfocusCard();
            }

            me.fireEvent('showDispersion', [graph]);
            me._sidePanel.show();
            me._storyView.hide();



            graph.addEvent('deactivate:once', function() {
                me.fireEvent('hideDispersion', [graph]);
                if (activeCard) {
                    me.focusCard(activeCard);
                }
                me._storyView.show();
            })

            // me._storyView.redraw({"namedView": "sidePanelEmptyDetail"});


        });
        graph.addEvent('deactivate', function() {
            //setTimeout(function(){

            //}, 50);

        });

    },

    initializeSidePanelRight: function(sidePanel, el) {

        var me = this;
        var sidePanelViewer = new ContentModuleViewer(el, {});


        me.getApp(function(app) {
            app.getDisplayController().display('sidePanelDetail', AppClient, sidePanelViewer);
        });



        sidePanel.addEvent('show', function() {



            $$('.rtl>*').forEach(function(el) {
                el.addClass('shifted');
            });

        }).addEvent('hide', function() {

            $$('.rtl>*').forEach(function(el) {
                el.removeClass('shifted');
            });

        });

        me._addSidePanelToggleTips(sidePanel, '.SideBarWidget.right .toggle-button');

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

            layer.runOnceOnLoad(function() {
                layer.getItems().forEach(function(marker) {
                    if (marker instanceof GeoliveMarker) {
                        me.scaleIcon(marker, 10);
                    }
                });
            });

            //layer.addEvent('')

        });
        map.getLayerManager().addEvent('addLayer', function(layer) {
            layer.runOnceOnLoad(function() {
                layer.getItems().forEach(function(marker) {
                    if (marker instanceof GeoliveMarker) {
                        me.scaleIcon(marker, 10);
                    }
                });
            });
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

            me.getMap().panTo(marker.getLatLng());
            me.scaleIcon(marker, 40);



        });



        cardEl = me.getCardEl(card.getId());
        if (cardEl) {
            cardEl.addClass('active');
            me.fireEvent('focusCard', [card]);
            return;
        }


        throw "cant find card el!";



    },
    scaleIcon: function(marker, x) {

        if (!marker) {
            console.error('not a marker');
            return;
        }
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

        me.fireEvent('unfocusCard', [card]);



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
        me._storyView.redraw({
            "namedView": "scoopStoryView"
        });


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
    setSortFn: function(fn, name) {

        var me = this;
        me._sortFn = fn;
        me._sortName = name;
        return me;

    },
    getSortName: function() {
        var me = this;
        return me._sortName;
    },
    getSortFn: function() {

        var me = this;
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


        var formButton=(new UIModalFormButton(
            button,
            application, item, {
                formName: item.getFormView(),
                formOptions: {
                    template: "form"
                }

            }
        )).addEvent('complete', function(story) {

            ScoopStories.clearCards();
            ScoopStories.redraw();

            if (me.shouldChainStoryForm(story)) {
                me.chainStoryForm(application);
            }

        }).addEvent('show', function(){
            var wizard=formButton.getWizard();
            me.displayWizardFlow(item, wizard)
        })



        return button;

    },

    displayWizardFlow:function(item, wizard){
        var me=this;
        wizard.getViewer().addEvent('open:once', function(){
            var el=wizard.getElement();
           
            var before=me.CardGroupsBefore(item);
            if(before.length){
                 var beforeEl=el.appendChild(new Element('div',{"class":"flow-left"}));
                 beforeEl.setAttribute("data-groups-count", before.length);
                 before.forEach(function(group){
                     beforeEl.appendChild(new Element('div',{"class":"ui-view story-card"}));
                 });
            }

            var after=me.CardGroupsAfter(item);
            if(after.length){
                 var afterEl=el.appendChild(new Element('div',{"class":"flow-right"}));
                 afterEl.setAttribute("data-groups-count", after.length);
                 after.forEach(function(group){
                     afterEl.appendChild(new Element('div',{"class":"ui-view story-card"}));
                 });
            }

            
        });

        
    },


    shouldChainStoryForm: function(completedStory) {
        return completedStory._id === -1 && completedStory._attributes && completedStory._attributes.storyAttributes && completedStory._attributes.storyAttributes.hasAnotherLocation;
    },

    chainStoryForm: function(application) {


        var item = new AddCard({
            label: "Add More Locations Along Your Story",
            formView: "createStoryForm",
            classNames: "add-card journey-card",
            type: 'MapStory.story'
        });

        var formButton=(new UIModalDialog(
            application, item, {
                formName: item.getFormView(),
                formOptions: {
                    template: "form"
                }

            }
        )).addEvent('complete', function(story) {

            ScoopStories.clearCards();
            ScoopStories.redraw();

            if (me.shouldChainStoryForm(story)) {
                me.chainStoryForm(application);
            }

        }).addEvent("show",function(){
            var wizard=formButton.getWizard();
            me.displayWizardFlow(item, wizard)
        }).show();

    },

    GetSortCardModule: function(item, application) {

        var me = this;
        var div = new Element('div', {
            "class": item.getClassNames()
        });

        var sortBtn = function(btnOptions) {

            var btn = new Element('button', {
                "html": btnOptions.label,
                "class": (me.getSortName() == btnOptions.sortName ? "current" : ""),
                "events": {
                    "click": function() {
                        me.setSortFn(btnOptions.sortFn, btnOptions.sortName);
                        me.clearCards()
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
            "sortFn": function(a, b) {
                //random
                return Math.round((Math.random() * 2.0) - 1.0);
            },
            "sortName": 'name'
        }));

        div.appendChild(sortBtn({
            "label": "<h3>Date of birth</h3>",
            "sortFn": function(a, b) {
                //random
                return Math.round((Math.random() * 2.0) - 1.0);
            },
            "sortName": 'birth-date'
        }));
        div.appendChild(sortBtn({
            "label": "<h3>Alpabetically name at birth</h3>",
            "sortFn": function(a, b) {
                //random
                return Math.round((Math.random() * 2.0) - 1.0);
            },
            "sortName": 'birth-name'
        }));
        div.appendChild(sortBtn({
            "label": "<h3>Year adompted</h3>",
            "sortFn": function(a, b) {
                //random
                return Math.round((Math.random() * 2.0) - 1.0);
            },
            "sortName": 'adopted-year'
        }));

        return div;

    },

    GetProfileSummaryUserModule: function(user, application) {
        var me = this;
        var div = new Element('div', {

        });
        div.appendChild(new Element('h3', {
            "html": "Name: " + user.getUsersName()
        }));


        var birthdate = "unknown";
        if (user.hasBirthStory()) {
            birthdate = user.getBirthStory().getYear();
        }


        var birthplace = "unknown";
        if (user.hasBirthStory()) {
            birthplace = user.getBirthStory().getAddress();
        }

        div.appendChild(new Element('h4', {
            "html": "Date of birth: " + birthdate
        }));
        div.appendChild(new Element('h4', {
            "html": "Place of birth: " + birthplace
        }));
        div.appendChild(new Element('h4', {
            "html": "Name at birth: " + (user.knowsBirthName() ? user.getBirthName() : "unknown")
        }));


        var journey = user.getFirstJourneyStory();

        div.appendChild(new Element('h4', {
            "html": "Year adopted: " + (journey ? journey.getYear() : "unknown")
        }));
        div.appendChild(new Element('h4', {
            "html": "Reunited with family: " + (user.hasRepatriationStory() ? "yes" : "no")
        }));
        div.appendChild(new Element('h4', {
            "html": "Looking for family: " + (user.isLookingForFamily() ? "yes" : "no")
        }));
        //if(user.isLookingForFamily()){
            var looking=div.appendChild(new Element("span",{"class":(user.isLookingForFamily()?"is-looking-for-icon":"not-looking-for-icon")}));
            new UIPopover(looking,{
                description:(user.isLookingForFamily()?"Searching family":"Not searching for family"),
                anchor:UIPopover.AnchorAuto()
            });
        //}
        return div;

    },
    GetProfileSummaryCardModule: function(item, application) {
        var me = this;
        var user = item.getUser();
        var div = me.GetProfileSummaryUserModule(user, application);
        div.addClass(item.getClassNames());
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



        var getCardLocation = function(card) {
            var me = this;

            var name = card.getAddress();
            return name;
        };

        var getCardUserName = function(card) {
            var me = this;

            var name = card.getUsersName();
            return name;
        };

        var getCardDescription = function(card) {
            var me = this;
            var description = card.getYear();
            return description;
        };


        var modules = [
            new Element('span', {
                "class": "icon"
            }),
            ScoopStories.StyleCardImage(new Element('div', {
                "class": "card-img"
            }), item),
            new Element('h3', {
                "html": getCardUserName(item),
                "class": "user-name"
            }),

            new Element('h3', {
                "html": getCardLocation(item),
                "class": "location-name"
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
                                },
                                function(wizard){
                                    wizard.addEvent("openStep:once",function(){
                                        me.displayWizardFlow(item, wizard)
                                    });
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


var StoryGroup = new Class({
    Extends:MockDataTypeItem,
    initialize: function(config) {
        var me = this;
        me._type = "CardGroup";
        me._config = config;
    },
    getCards: function(callback) {
        var me = this;
        callback(me._config.cards || []);
    },
    getDescription: function() {
        var me = this;
        return (typeof me._config.description == "string") ? me._config.description : "Some group of cards";
    },
    getTypeOfCard: function() {
        var me = this;
        return (typeof me._config.type == "string") ? me._config.type : "Group of cards";
    },
    getAddress: function() {
        return "";
    },
    getYear: function() {
        return "";
    },
    getCardMedia: function() {
        return "";
    },

    isBirthStory: function() {
        var me = this;
        return !!me._config.isBirthStory;
    },
    isRepatriationStory: function() {
        var me = this;
        return !!me._config.isRepatriationStory;
    },
    isAdoptionStory: function() {
        var me = this;
        return !!me._config.isAdoptionStory;
    }

});

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

            if (story.attributes.isAdoptionStory === "true" || story.attributes.isAdoptionStory === true) {
                me._setAdoptionStoryData(story);
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
    _setAdoptionStoryData: function(data) {

        var me = this;
        if (me._adoptionStory) {
            throw 'Already have adoption story';
        }


        me._adoptionStory = new StoryCard(Object.append(data, {
            classNames: "adoption-card journey-card",
        })).setUser(me);

        return me;

    },
    getFirstJourneyStory: function() {
        var me = this;
        return me._journeyStories && me._journeyStories.length ? me._journeyStories[0] : false;
    },
    getFirstStory: function() {
        var me = this;
        return me._birthStory || me.getFirstJourneyStory() || me._repatriationStory || null;
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

    hasAdoptionStory: function() {
        return !!this._adoptionStory;
    },
    getAdoptionStory: function() {
        var me = this;
        if (!me._adoptionStory) {
            throw 'StoryUser does not have adoption story';
        }
        return me._adoptionStory;
    },

    getBirthName: function() {

        var me = this;
        if (me._userData && typeof me._userData.birthName == "string") {
            return me._userData.birthName;
        }


        return "";
    },
    knowsBirthName: function() {

        var me = this;
        if (me._userData) {
            return (me._userData.knowsBirthName === true || me._userData.knowsBirthName === "true") && typeof me._userData.birthName == "string" && me._userData.birthName != "";
        }


        return false;
    },

    isLookingForFamily: function() {

        var me = this;
        if (me._userData && typeof me._userData.searchingFor == "string") {
            return me._userData.searchingFor.indexOf("Yes")>=0;
        }

        return false;
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
    getRealCardsSync: function() {

        var me = this;
        var cards = [];
        if (me.hasBirthStory()) {
            cards.push(me.getBirthStory());
        }

        if (me.hasAdoptionStory()) {
            cards.push(me.getAdoptionStory());
        }
        var journeyStories = me.getJourneyStories();
        cards = cards.concat(journeyStories);

        if (me.hasRepatriationStory()) {
            cards.push(me.getRepatriationStory());
        }

        return cards;

    },

    getCards: function(callback) {

        var me = this;

        me.runOnceOnLoad(function() {

            var cards = [];
            /*
             * TODO use profile for search results, or get rid of them 
             *
            cards.push(
                (new ProfileSummaryCard(Object.append({

                }, {
                    classNames: "summary-card",
                }))).setUser(me)
            );
            */

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
            if (me.hasAdoptionStory()) {
                cards.push(me.getAdoptionStory());
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
                // cards.push(new AddCard({
                //     label: "Help Family Find You",
                //     formView: "publishingOptionsForm",
                //     classNames: "help-card add-card publishing-options-card"
                // }));
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
        me._searchData = {};
        me.parent(options);

    },
    save: function(cb) {

        var me = this;

        ScoopStories.setCardGroup(me, function() {

        });

    },

    /*form fields*/

    setName: function(name) {

        var me = this;
        me._searchData.name = name;

    },
    setDob: function(day) {

        var me = this;
        me._searchData.dob = day;

    },
    setMob: function(month) {

        var me = this;
        me._searchData.mob = month;

    },
    setYob: function(year) {

        var me = this;
        me._searchData.yob = year;

    },

    setLob: function(loc) {

        var me = this;
        me._searchData.lob = loc;

    },
    setNob: function(name) {

        var me = this;
        me._searchData.nob = name;

    },
    setYa: function(year) {

        var me = this;
        me._searchData.ya = year;

    },
    setLocation: function(loc) {

        var me = this;
        me._searchData.location = loc;

    },



    getCards: function(cb) {



        var me = this;


        if (me._cards) {
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



            (new AjaxControlQuery(CoreAjaxUrlRoot, 'advanced_search', {
                'plugin': 'MapStory',
                'search': me._searchData
            })).addEvent('success', function(resp) {

                var randomSearchCards = resp.results.map(function(data) {

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

                me._cards = randomSearchCards;
                cb(me._padCards(randomSearchCards));

            }).execute();

            me._searchData = {};


        })



    },
    _padCards: function(searchCards) {


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
        var me = this;
        this.parent(search, Object.append({

            PreviousTemplate: UIListAggregator.PreviousTemplate,
            MoreTemplate: UIListAggregator.MoreTemplate,
            ResultTemplate: UIListAggregator.NamedViewTemplate(ScoopStories.getMap.bind(ScoopStories), {
                namedView: "scoopStoryDetail",
                formatResult: function(data) {

                    var keyword = me.getSearchString();

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