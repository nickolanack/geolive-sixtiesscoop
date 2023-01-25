'use strict'


var UserContact = new Class({
	Extends:DataTypeObject,
	initialize:function(user){
		var me=this;
		me._user=user.getUserId()
	},
	setSubject:function(e){
        var me=this;
        me._subject=e;
    },
	setMessage:function(e){
        var me=this;
        me._message=e;
    },
    save:function(cb){
        
        var me=this;
        
        (new AjaxControlQuery(CoreAjaxUrlRoot,'send_message', {
		  'plugin': "MapStory",
		  "user":me._user,
		  "subject":me._subject,
		  "message":me._message
		})).addEvent('success',function(){
		    cb(true);
		}).execute(); 
		
		

    }

});


var StoryUser = new Class({
	Extends:DataTypeObject,
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
	save:function(cb){


		cb(true);

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


	getImages:function(callback){

		var content=this.getRealCardsSync().map(function(card){
			return card.getCardMedia();
		}).join("\n");


		var parser=(new HTMLTagParser());
		parser.parse(content);
		

		var items=parser.get('images').concat(
				parser.get('links'), 
			).map(function(item){

			return item.url||false;

			}).filter(function(item){ return !!item; });


		var unique=items.filter(function(url, i){
			return items.indexOf(url)===i;
		});


		if(unique.length==0){
			callback([]);
			return;
		}

		(new HTMLArrayMetadataRequest(unique)).cache({expire:5}).on('success', function(res) {

		 	if(res.success){
		 		callback(res.results.filter(function(data){
		 			return data.type==='image'||(data.type==='external'&&data.externalType==='image');
		 		}));
		 		return;
		 	}

		 	callback([]);

		 }).on('failure',function(){
		 
		 	console.warn('Image metadata error');
		 	callback([]);
		 
		 }).execute();






		return [];

		
	},


	getVideos:function(callback){

		var content=this.getRealCardsSync().map(function(card){
			return card.getCardMedia();
		}).join("\n");


		var parser=(new HTMLTagParser());
		parser.parse(content);
		

		var items=parser.get('videos').concat(
				parser.get('links'), 
				parser.get('iframes'), 
				parser.get('objects'),
				parser.get('embeds')
			).map(function(item){

			return item.url||false;

			}).filter(function(item){ return !!item; });


		var unique=items.filter(function(url, i){
			return items.indexOf(url)===i;
		});

		if(unique.length==0){
			callback([]);
			return;
		}

		(new HTMLArrayMetadataRequest(unique)).cache({expire:5}).addEvent('success', function(res) {

		 	if(res.success){
		 		callback(res.results.filter(function(data){
		 			return data.type==='video'||(data.type==='external'&&data.externalType==='video');
		 		}));
		 		return;
		 	}

		 	callback([]);

		 }).on('failure',function(){
		 
		 	console.warn('Video metadata error');
		 	callback([]);
		 
		 }).execute();






		return [];

		
	},


	getMediaElement(){
		
		var el=new Element('span',{
		    "class":"media-container empty"
		});

		this.getVideos(function(videos){
		    
		    if(videos.length){
		        var yt=el.appendChild(new Element('span',{
		            styles:{
		                'background-image':'url('+videos[0].poster+')'
		            },
		            "class":"video",
		            html:'<svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%"><path class="ytp-large-play-button-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path><path d="M 45,24 27,14 27,34" fill="#fff"></path></svg>'
		        }));
		        
		        yt.appendChild(new Element('h2',{ html:videos[0].youtube.title }));
		        
		        el.removeClass('empty');
		        el.addClass('has-video');
		        
		        el.parentNode.addEvent('click', function(){
		           
		           console.log(videos[0]) 
		           
		                    PushBoxWindow.open(videos[0].iframe, {
			                    handler: 'iframe',
			                    size: PushBox.FitWindow({
			                        aspect:{
			                            x:videos[0].w, y:videos[0].h
			                        }
			                    }),
			                    closable:true,
			                    push: true
			                });
		           
		            
		        });
		        
		        el.parentNode.addClass('small-video icon-only');
		        el.appendChild(new Element('div',{"class":"toggle-display-mode", events:{click:function(e){
		            
		            e.stop();
		            var p=el.parentNode;
		            if(p.hasClass('small-video')){
		                
		                if(p.hasClass('icon-only')){
		                    
		                    p.removeClass('small-video');
		                    p.removeClass('icon-only');
		                    return;
		                    
		                }
		                
		                p.addClass('icon-only');
		                return;
		            }
		            p.addClass('small-video')
		        }}}))
		        
		    }
		    
		    
		});
		this.getImages(function(images){
		    
		    if(images.length){
		        el.appendChild(new Element('span',{
		            styles:{
		                'background-image':'url('+images[0].url+')'
		            },
		            "class":"image"
		        }));
		        
		        el.removeClass('empty');
		        el.addClass('has-img');
		    }
		    
		    
		});

		return el;
	}

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


	isContactable: function() {

		var me = this;
		if (me._userData) {
			return me._userData.allowContact==="true"||me._userData.allowContact===true;
		}

		return false;
	},

	isSharingEmail: function() {

		var me = this;
		if (me._userData) {
			return me._userData.shareEmail==="true"||me._userData.shareEmail===true;
		}

		return false;
	},

	getSharedEmail: function() {

		var me = this;
		if (me._userData&&typeof me._userData.email=="string") {
			return me._userData.email;
		}
		return "";
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
		

			cards.push(new HistoryNavigationCard(Object.append({
				
			}, {
				classNames: "nav-card summary-card",
			})))

			if (!me.hasBirthStory()) {
				if (me.canEdit()) {
					cards.push(new AddCard({
						label: "Create birth story",
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
					label: journeyStories.length ? "Add more locations along your story" : "Add a location along your story",
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
						label: "Add a repatriation story",
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

		if (me.isClient()) {
			return true;
		}

		return AppClient.getUserType() === "admin";
	},
	isClient:function(){
		var me = this;

		if (me._userData && parseInt(me._userData.id) === AppClient.getId()) {
			return true;
		}
		return false;
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