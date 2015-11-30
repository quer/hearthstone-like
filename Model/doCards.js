var CardTamplate = require('./cardTamplate');
var Card = require('./card');
module.exports = function (CardContainer) {
	var charge = [false, true];
	var summon = [null, null, null, [0,2],[1,1],[2,1]];
	for (var i = 0; i < 60; i++) {
		
		var randomattack = doRandom(10, 0);
		var randomhealth = doRandom(10, 0);
		var randomcost = Math.floor((randomattack+randomhealth)/2);
		var randomcharge = charge[doRandom(2, 0)-1];
		var randomtaunt = charge[doRandom(2, 0)-1];
		var randomsummon = summon[0];
		if(i > 5){
			randomsummon = summon[doRandom(6, 0)-1];
		}
		var text = "";
		if (randomcharge == true) {text +="<b>Charge</b> "};
		if (randomsummon != null) {
			var getCard = CardContainer.findCard(randomsummon[0]);
			text +="<b>battlecry</b> summon "+randomsummon[1]+" "+getCard.attack+"/"+getCard.health+" af "+randomsummon[0]+" ";
		};
		text += "nr: "+ i;
		var card = new Card("card nr: "+ i, CardTamplate.default, text, randomattack, randomhealth, randomcost, randomcharge, randomsummon, randomtaunt);
		CardContainer.addCard(card);	
	};	
}
function randomItem (array) {
	return array[Math.floor(Math.random()*array.length)];
}
function doRandom(higestIndex, loop) {
	if(loop > 0){
		return Math.floor(Math.random()*higestIndex)+1;
	}else{
		return doRandom(Math.floor(Math.random()*higestIndex)+1, ++loop);
	}
}