var CardTamplate = require('./cardTamplate');
var Card = require('./card');
module.exports = function (CardContainer) {
	var charge = [false, true];
	var imagesCat = ['abstract','animals','business','cats','city','food','nightlife','fashion','people','nature','sport','stechnics','transport'];
	var carImage = 0;
	var ii = 0;
	var summon = [null, null, null, [0,2],[1,1],[2,1]];
	for (var i = 0; i < 60; i++) {
		if (i % 10 == 0){
			carImage++;
			ii = 0;
		}	
		var cardImage = "http://lorempixel.com/95/95/"+imagesCat[carImage]+"/"+ii+"/";
		var randomattack = doRandom(9, 0);
		var randomhealth = doRandom(9, 0);
		if (i < 5) {
			charge = false;
			var randomattack = doRandom(5, 0);
			var randomhealth = doRandom(5, 0);
		};
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
		var card = new Card("card nr: "+ i, CardTamplate.default, cardImage, text, randomattack, randomhealth, randomcost, randomcharge, randomsummon, randomtaunt);
		CardContainer.addCard(card);	
		ii++;
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