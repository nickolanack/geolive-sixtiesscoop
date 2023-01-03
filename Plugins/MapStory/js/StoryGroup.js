'use strict'


var StoryGroup = new Class({
	Extends: MockDataTypeItem,
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



StoryGroup.BestCard=function(story){

    
    var cards = story.getRealCardsSync();


        
        var index=-1;
        var length=-1;
        
        cards.forEach(function(c,i){
            var l=c.getDescription().length;
            if(l>length){
               length=l;
               index=i;
            }
        })
        
        return cards[index];

}