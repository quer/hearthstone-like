module.exports = function (name) {
	this.name = name;
	this.cardList = new Array();
	this.addCard = function (card) {
		if (this.cardList.length < 30) {
			this.cardList.push(card);
			return true;
		};
		return false;
	}
	this.findCard = function (id) {
		for (var i = 0; i < this.cardList.length; i++) {
			if(this.cardList[i].id == id)
				return this.cardList[i];
		};
		return null;
	}
	/* remove card from index nr in array */
	this.removeCard = function (id){

		this.cardList.splice(id, 1);
	}
	this.htmlOutput = function(deckName){
		var htmlList = new Array();
		for (var i = 0; i < this.cardList.length; i++) {
				htmlList.push(this.cardList[i].htmlOutput());
		};
		return htmlList;
	}
}