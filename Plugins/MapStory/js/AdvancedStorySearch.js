'use strict'


var StoryCardSearchResult=new Class({
	Extends:StoryCard
})

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

	setCards:function(cards){
		var me=this;
		me._cards=cards;
		return me;
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

					var card = new StoryCardSearchResult(Object.append(data, {
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
			new HistoryNavigationCard(Object.append({
				
			}, {
				classNames: "nav-card summary-card",
			})),
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