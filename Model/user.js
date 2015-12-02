module.exports = function(name, socket) {
	this.name = name;
	this.socket = socket;
	this.deckList = new Array();
	this.addDeck = function(deck){
		this.deckList.push(deck);
	}
	this.removeDeck = function (deckName) {
		for (var i = 0; i < this.deckList.length; i++) {
			if (this.deckList[i].name == deckName) {
				deck.splice(this.deckList[i], 1);
				return true;
			};
		};
		return false;
	}
	this.findDeck = function(name){
		for (var i = 0; i < this.deckList.length; i++) {
			if(this.deckList[i].name == name)
				return this.deckList[i];
		};
		return false;
	}
}