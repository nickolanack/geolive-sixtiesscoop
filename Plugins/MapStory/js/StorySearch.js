'use strict';

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


var AdvancedStorySearchAggregator = new Class({
    Extends: UISearchListAggregator,
    initialize: function(search, options) {
        var me = this;
        this.parent(search, Object.append({

            PreviousTemplate: UIListAggregator.PreviousTemplate,
            MoreTemplate: UIListAggregator.MoreTemplate,
            ResultTemplate: UIListAggregator.NamedViewTemplate(ScoopStories.getMap.bind(ScoopStories), {
                namedView: "scoopStoryDetail",
                formatResult: function(data) {

                    var card = new StoryCardSearchResult(Object.append(data, {
                        classNames: "search-card"
                    }));
                    var user = new StoryUser({
                        "story": [],
                        "user": Object.append({}, data.userData)
                    });
                    card.setUser(user);
                    return card;
                },
                events: {
                    click: function() {


                    }
                }
            })

        }, options));
    },
    getLastResponse:function(){
        return this._results;
    },
    _getRequest: function(filters) {
        var me = this;
        var string = me.currentSearchString;


        return (new AjaxControlQuery(CoreAjaxUrlRoot, 'advanced_search', {
                'plugin': 'MapStory',
                'search': {name:string},
                 searchOptions: filters
            })).addEvent('success',function(results){

            me._results=results;

        });
    }
});