'use strict'


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
			return me._userData.searchingFor.indexOf("Yes") >= 0;
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