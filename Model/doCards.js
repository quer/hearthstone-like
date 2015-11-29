var CardTamplate = require('./cardTamplate');
var Card = require('./card');
module.exports = function (CardContainer) {
	var charge = [true, false];
	var attack = [0,1,2,3,4,5,6,7,8,9,10];
	var health = [0,1,2,3,4,5,6,7,8,9,10];
	var cost = [0,1,2,3,4,5,6,7,8,9,10];
	var summon = [null, [0,2],[1,1],[2,1]];
	for (var i = 0; i < 60; i++) {
		var randomcharge = randomItem(charge);
		var randomattack = randomItem(attack);
		var randomhealth = randomItem(health);
		var randomcost = randomItem(cost);
		var randomsummon = summon[0];
		if(i > 5){
			randomsummon = randomItem(summon);
		}
		var text = "";
		if (randomcharge == true) {text +="<b>Charge</b>. "};
		if (randomsummon != null) {
			var getCard = CardContainer.findCard(randomsummon[0]);
			text +="<b>battlecry</b> summon "+randomsummon[1]+" "+getCard.attack+"/"+getCard.health+" af "+randomsummon[0]+" ";
		};
		text += "nr: "+ i;
		var card = new Card("card nr: "+ i, CardTamplate.default, text, randomattack, randomhealth, randomcost, randomcharge, randomsummon, false);
		CardContainer.addCard(card);	
	};	
}
function randomItem (array) {
	return array[Math.floor(Math.random()*array.length)];
}