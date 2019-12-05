'use strict';

var StoryMapController = new Class({
    Implements: [Events],
    initialize: function() {





        var me = this;


        me.options={
            iconSizeSmall:10,
            iconSizeSmallBirth:20,
            iconSizeCurrentStory:20,
            iconSizeSelected:40


        };

        me.setSortFn(function() {
            //random
            return Math.round((Math.random() * 2.0) - 1.0);
        });

        me.addEvent('clearCards', function(cards) {
            me.markersForCards(cards, function(marker) {
                if (marker === me._activeMarker) {
                    me._activeMarker = null;
                }
                me.clearIconScale(marker);
            });
        });

        me.addEvent('setCards', function(cards, group) {
            me.markersForCards(cards, function(marker) {
                me.scaleIcon(marker, me.options.iconSizeCurrentStory);
            });
            if (group instanceof StoryUser) {
                me.linkCardsOnMap(cards);
            }
            me.focusCurrentStory();
        });

        var needsDisclaimer = function() {
            return localStorage.getItem("hasViewedDisclaimer") !== "Yes";
        }


        me.addEvent('loadMap', function() {
            var showDisclaimer = function() {
                (new AjaxControlQuery(CoreAjaxUrlRoot, "get_metadata", {
                    "widget": "disclaimer"
                })).addEvent("success", function(resp) {

                    var d = new Element('div');
                    var p = new Element('p', {
                        style: "padding: 30px;",
                        html: "<h1>Disclaimer</h1>" + resp.metadata.positions.content.modules[1].config.text
                    });
                    d.appendChild(p);
                    //if(needsDisclaimer()){
                    var button = d.appendChild(new Element('button', {
                        "html": "Accept",
                        "class": "disclaimer primary-btn " + (!needsDisclaimer() ? "disabled" : ""),
                        events: {
                            click: function() {
                                box.close();
                            }
                        }
                    }));
                    if (!needsDisclaimer()) {
                        new UIPopover(button, {
                            description: "You've already accepted the terms",
                            anchor: UIPopover.AnchorAuto()
                        });
                    } else {
                        new UIPopover(button, {
                            description: "You must accept the terms to use this site",
                            anchor: UIPopover.AnchorAuto()
                        });
                    }


                    var box = PushBox.Open(d, {
                        handler: 'append',
                        closable: !needsDisclaimer(),
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

    clearIconScale:function(marker){
        var me=this;
        if(marker.getIcon().indexOf("7pW_da6")>0){
             me.scaleIcon(marker, me.options.iconSizeSmallBirth);
            return;
        }
        me.scaleIcon(marker, me.options.iconSizeSmall);
    },

    clearCards: function() {

        var me = this;
        me._lastCards=null;
        me._cards = null;
        return me;

    },


    hasHistory:function(){
        return !!this._lastCards;
    },

    pushCardHistory: function() {

        var me = this;
        me._lastCards=me._cards;
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


    CardGroupsBefore: function(item) {
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


    CardGroupsAfter: function(item) {
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
                isRepatriationStory: true,
                cards: repatriation
            }));
        }

        return items;

    },


    SidePanelStoryListItems: function(item) {


        var me = this;
        var items = [item.getUser()];

        items = items.concat(me.CardGroupsBefore(item))
        items.push(item);
        items = items.concat(me.CardGroupsAfter(item))

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


            me._sidePanel.getElement().addClass('analytics');
            me._searchPanel.hide();
            me._searchPanel.disable();
            graph.addEvent('deactivate:once', function() {

                me._searchPanel.enable();
                me._sidePanel.getElement().removeClass('analytics');
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
        me._searchPanel = sidePanel;
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
                        me.clearIconScale(marker);
                    }
                });
            });

            //layer.addEvent('')

        });
        map.getLayerManager().addEvent('addLayer', function(layer) {
            layer.runOnceOnLoad(function() {
                layer.getItems().forEach(function(marker) {
                    if (marker instanceof GeoliveMarker) {
                        me.clearIconScale(marker);
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
            me.scaleIcon(me._activeMarker, me.options.iconSizeCurrentStory);
        }


        var marker = me.getMarker(card.getId(), function(marker) {

            me._activeMarker = marker;

            me.getMap().panTo(marker.getLatLng());
            me.scaleIcon(marker, me.options.iconSizeSelected);



        });



        var cardEl = me.getCardEl(card.getId());
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

        var cardEl = me.getCardEl(card.getId());
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


        var formButton = (new UIModalFormButton(
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

        }).addEvent('show', function() {
            var wizard = formButton.getWizard();
            me.displayWizardFlow(item, wizard)
        })



        return button;

    },

    displayWizardFlow: function(item, wizard) {
        return;

        var me = this;
        wizard.getViewer().addEvent('open:once', function() {
            var el = wizard.getElement();

            var before = me.CardGroupsBefore(item);
            if (before.length) {
                var beforeEl = el.appendChild(new Element('div', {
                    "class": "flow-left"
                }));
                beforeEl.setAttribute("data-groups-count", before.length);
                before.forEach(function(group) {
                    beforeEl.appendChild(new Element('div', {
                        "class": "ui-view story-card"
                    }));
                });
            }

            var after = me.CardGroupsAfter(item);
            if (after.length) {
                var afterEl = el.appendChild(new Element('div', {
                    "class": "flow-right"
                }));
                afterEl.setAttribute("data-groups-count", after.length);
                after.forEach(function(group) {
                    afterEl.appendChild(new Element('div', {
                        "class": "ui-view story-card"
                    }));
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

        var formButton = (new UIModalDialog(
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

        }).addEvent("show", function() {
            var wizard = formButton.getWizard();
            me.displayWizardFlow(item, wizard)
        }).show();

    },
    GetHistoryNavigationModule: function(item, application) {

        var me=this;
        if(!me.hasHistory()){

            return null;
        }



        var me = this;
        var div = new Element('div', {
            
        });

      

            var btn = new Element('button', {
                "html":"Clear Search",
               
                "events": {
                    "click": function() {
                       
                    }
                }
            });


            div.appendChild(btn)

        return div;
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
            "label": "<h3>Alphabetically name at birth</h3>",
            "sortFn": function(a, b) {
                //random
                return Math.round((Math.random() * 2.0) - 1.0);
            },
            "sortName": 'birth-name'
        }));
        div.appendChild(sortBtn({
            "label": "<h3>Year adopted</h3>",
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
        var nameEl=div.appendChild(new Element('h3', {
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
        var lookingEl=div.appendChild(new Element('h4', {
            "html": "Looking for family: " + (user.isLookingForFamily() ? "yes" : "no")
        }));
        //if(user.isLookingForFamily()){
        var looking = div.appendChild(new Element("span", {
            "class": (user.isLookingForFamily() ? "is-looking-for-icon" : "not-looking-for-icon")
        }));


        

        if (user.isClient()) {

            new UIModalFormButton(nameEl.appendChild(new Element('button', {
                html: "edit",
                "class": "inline-btn profile"
            })), application, AppClient, {

                formName: "profileFormView"

            });
            new UIModalFormButton(lookingEl.appendChild(new Element('button', {
                html: "edit",
                "class": "inline-btn publishing-options"
            })), application, AppClient, {


                formName: "publishingOptionsForm",


            });
        }
        //else{
            if (user.isContactable()) {


                new UIModalFormButton(div.appendChild(new Element("button", {
                    "class": "contact-btn",
                    "html": "Contact User"
                })), application, new UserContact(user), {



                    formName: AppClient.getUserType() == "guest"?"loginFormView":"contactUserForm",


                });


              

                 if (user.isSharingEmail()) {
                    div.appendChild(new Element('p', {
                        style:"display: inline-block;",
                        html: "<a href=\"mailto:"+user.getSharedEmail()+"\">"+user.getSharedEmail()+"</a>",
                        "class": "info",
                    }));
                }

            } else {
                div.appendChild(new Element('p', {
                    "class": "info",
                    "html": "user does not want to be contacted through the site"
                }));
            }
        //}


        new UIPopover(looking, {
            description: (user.isLookingForFamily() ? "Searching family" : "Not searching for family"),
            anchor: UIPopover.AnchorAuto()
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
                                function(wizard) {
                                    wizard.addEvent("openStep:once", function() {
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


            if(item instanceof StoryCardSearchResult){
                //push card history is the same as 
                //clear cards (ip preperation for new set)
                //but stores the last set
                me.pushCardHistory();
                //me.clearCards();
            }
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