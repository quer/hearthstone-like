var Shuffle = require('./fun/shuffle');
var Deck = require('./deck');
module.exports = {
	cardList : new Array(),
	htmlList : new Array(),
	addCard: function(card) {
		this.cardList.push(card);
		this.htmlList.push(card.htmlOutput());
	},
	findCard: function (id) {
		if (id !== false) {
			for (var i = 0; i < this.cardList.length; i++) {
				if(this.cardList[i].id == id)
					return this.cardList[i];
			};
		};
		return null;
	},
	createRandomDeck: function(name){
		var newDeck = new Deck(name);
		cardShuffle = new Shuffle(this.cardList);
		/* viker bare der mindst er 30 kort i alt i spillet */
		for (var i = 0; i < 30; i++) {
			newDeck.addCard(cardShuffle[i]);
		};
		return newDeck;
	}
}