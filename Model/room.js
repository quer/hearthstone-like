var Deck = require('./deck');
var RoomContainer = require('./roomContainer');
var CardContainer = require('./cardContainer');
var Clone = require('./fun/clone');
var Shuffle = require('./fun/shuffle');
module.exports = function(player1, player2, player1Deck, player2Deck) {
	console.log(player1Deck.name+ " | "+ player2Deck.name )
	this.id = RoomContainer.roomList.length;
	this.turn = Math.floor((Math.random() * 1) + 0);
	this.turnStartTime = new Date();
	this.gameTime = new Date();
	this.roundGems = 1;
	this.gameDone = false;
	/* user 1 pre settings */
	this.player1 = player1;
	this.player1.Deck = new Shuffle(new Clone(player1Deck));
	this.player1.HandDeck = new Array();
	this.player1.TableDeck = new Array();
	this.player1.turns = 1;
	this.player1.gemsLeft = 1;
	this.player1.havePickCard = false;
	this.player1.life = 30;
	/* user 2 pre settings */
	this.player2 = player2;
	this.player2.Deck = new Shuffle(new Clone(player2Deck));
	this.player2.HandDeck = new Array();
	this.player2.TableDeck = new Array();
	this.player2.turns = 1;
	this.player2.gemsLeft = 1;
	this.player2.havePickCard = false;
	this.player2.life = 30;
	
	/**
	* private metode
	*/
	this.getPlayer = function (name) {
		if (this.player1.name == name) {
			return {player: this.player1, turn: this.getPlayerTurn("1")};
		}else if (this.player2.name == name) {
			return {player: this.player2, turn: this.getPlayerTurn("2")};
		}else {
			return false;
		}
	}
	this.getOtherPlayer = function (name) {
		if (this.player1.name != name) {
			return {player: this.player1, turn: this.getPlayerTurn("1")};
		}else if (this.player2.name != name) {
			return {player: this.player2, turn: this.getPlayerTurn("2")};
		}else {
			return false;
		}
	}
	this.getPlayerTurn = function (player) {
		if ((player == "1" && this.turn == 0) || (player == "2" && this.turn == 1)) {
			return true;
		}else{
			return false;
		} 
	}
	this.setTableObj = function (Card) {
		return {Card: Card, charge: Card.charge};
	}
	this.getHtmlArrayCard = function (cardList) {
		var returnArray = new Array();
		for (var i = 0; i < cardList.length; i++) {
			returnArray.push(cardList[i].htmlOutput());
		};
		return returnArray; 
	}
	this.getHtmlTableArrayCard = function (cardList) {
		var returnArray = new Array();
		for (var i = 0; i < cardList.length; i++) {
			returnArray.push({Card: cardList[i].Card.htmlOutput(), charge: cardList[i].charge});
		};
		return returnArray; 
	}
	/**
	* public metode
	*/
	this.updateGame = function(){
		/*
		socket update game på brugerens socket..
		*/
		var player1HtmlReturn = {
			myLife: this.player1.life,
			enemyLife: this.player2.life,
			cardsLeft: this.player1.Deck.cardList.length,
			myHand: this.getHtmlArrayCard(this.player1.HandDeck),
			myTable: this.getHtmlTableArrayCard(this.player1.TableDeck),
			gemsLeft: this.player1.gemsLeft,
			turns: this.player1.turns,
			enemyHand: this.player2.HandDeck.length,
			enemyTable: this.getHtmlTableArrayCard(this.player2.TableDeck),
			turn: this.getPlayerTurn("1")
		}
		var player2HtmlReturn = {
			myLife: this.player2.life,
			enemyLife: this.player1.life,
			cardsLeft: this.player2.Deck.cardList.length,
			myHand: this.getHtmlArrayCard(this.player2.HandDeck),
			myTable: this.getHtmlTableArrayCard(this.player2.TableDeck),
			gemsLeft: this.player2.gemsLeft,
			turns: this.player2.turns,
			enemyHand: this.player1.HandDeck.length,
			enemyTable: this.getHtmlTableArrayCard(this.player1.TableDeck),
			turn: this.getPlayerTurn("2")
		};
		this.player1.socket.emit('updateGame', player1HtmlReturn);
		this.player2.socket.emit('updateGame', player2HtmlReturn);
	}
	this.picCard = function (name, bypass) {
		var player = this.getPlayer(name);
		console.log("player.turn: "+player.turn + "player.player.havePickCard: "+ player.player.havePickCard);
		if (((player.turn == true && player.player.havePickCard == false) || bypass !== undefined) && player.player.Deck.cardList.length > 0) {
			var cardPicked = player.player.Deck.cardList[0];
			console.log(cardPicked);
			player.player.HandDeck.push(cardPicked);
			player.player.Deck.removeCard(0);
			/* socket: update game */
			if (bypass === undefined) {
				this.updateGame();
				player.player.havePickCard = true;
			};
			return true
		}else{
			console.log("ikke din tur eller har fået kort eller har ikke flere(picCard)");
			return false;
		}
	}
	/* name og id bliver altid sat. aSummon er kun sat vis det er et kort som skal summon*/
	this.activeCard = function (name, id, aSummon) {
		var player = this.getPlayer(name);
		if (player.turn == true) {
			if (player.player.TableDeck.length < 7) {
				if (aSummon !== undefined) {
					var theSummonCard = CardContainer.findCard(id);
					theSummonCard = new Clone(theSummonCard);
					player.player.TableDeck.push(this.setTableObj(theSummonCard));
					console.log("do summon");
					return true;
				}else{
					for (var i = 0; i < player.player.HandDeck.length; i++) {
						if (player.player.HandDeck[i].id == id) {
							var playerCard = player.player.HandDeck[i];
							if (player.player.gemsLeft >= playerCard.cost) {
								player.player.TableDeck.push(this.setTableObj(playerCard));
								/* ser om den skal summon ektra kort*/
								if (playerCard.summon != false && playerCard.summon != null && playerCard.summon !== undefined) {
									for (var ii = 0; ii < playerCard.summon.amount; ii++) {
										this.activeCard(name, playerCard.summon.card.id, true);
									};
								};						
								player.player.gemsLeft -= playerCard.cost;
								player.player.HandDeck.splice(i, 1);
								/* socket: update game */
								this.updateGame();
								return true;
							}else{
								/* vis han ikke har råd*/
								console.log("ikke råd");
								return false;					
							}
						};
					};
				}
			};
		}
		console.log("bordet er fyldt eller det ikke din tur(activeCard)");
		return false;
	}
	this.useCard = function (name, id, attackId) {
		var player = this.getPlayer(name);
		var otherPlayer = this.getOtherPlayer(name);
		if (player.turn == true) {
			for (var i = 0; i < player.player.TableDeck.length; i++) {
				if(player.player.TableDeck[i].Card.id == id){
					var playerCard = player.player.TableDeck[i].Card;
					/* kigger efter modstander kort*/
					for (var ii = 0; ii < otherPlayer.player.TableDeck.length; ii++) {
						if(otherPlayer.player.TableDeck[ii].Card.id == attackId){
							var otherPlayerCard = otherPlayer.player.TableDeck[ii].Card;
							player.player.TableDeck[i].charge = false;
							otherPlayerCard.health -= playerCard.attack;
							playerCard.health -= otherPlayerCard.attack;
							if (otherPlayerCard.health < 1) {
								otherPlayer.player.TableDeck.splice(ii,1);
							};
							if (playerCard.health < 1) {
								player.player.TableDeck.splice(i,1);
							};
							playerCard.charge = false;
							console.log("done!(useCard)");
							this.updateGame();
							/* socket: update game */
							return true;
						}
					};
					console.log("enemy card no exist(useCard)");
				} 
			};
		}
		console.log("ikke din tur (useCard)");
		return false;
	}
	this.useCardOnPlayer = function(name, id){
		var player = this.getPlayer(name);
		var otherPlayer = this.getOtherPlayer(name);
		if (player.turn == true) {
			for (var i = 0; i < player.player.TableDeck.length; i++) {
				if(player.player.TableDeck[i].Card.id == id){
					var playerCard = player.player.TableDeck[i].Card;
					otherPlayer.player.life -= playerCard.attack;
					if (otherPlayer.player.life < 1) {
						this.endGame();
					};
					playerCard.charge = false;
					console.log("done!(useCard)");
					this.updateGame();
					return true;
				} 
			};
		}
		console.log("ikke din tur (useCardOnPlayer)");
		return false;
	}
	this.endGame = function(){
		if (this.player1.life < 1) {
			this.gameDone = true;
			this.player1.socket.emit('gameEnd', false);
			this.player2.socket.emit('gameEnd', true);
			RoomContainer.removeroom(this.id);
			return true;
		}else if (this.player2.life < 1) {
			this.gameDone = true;
			this.player1.socket.emit('gameEnd', true);
			this.player2.socket.emit('gameEnd', false);
			RoomContainer.removeroom(this.id);
			return true;
		}
		return false;
	}
	/* skal opdater i fremtiden*/
	this.endturn = function (name) {
		var player = this.getPlayer(name);
		if (player.turn == true) {
			if (this.turn == 0) {
				this.turn = 1;
			}else{
				this.turn = 0;
			}
			if (player.player.turns < 10) {
				player.player.turns += 1;
			};
			player.player.gemsLeft = player.player.turns;
			this.player1.havePickCard = false;
			this.player2.havePickCard = false;
			for (var i = 0; i < player.player.TableDeck.length; i++) {
				player.player.TableDeck[i].charge = true;
				player.player.TableDeck[i].Card.charge = true;
			};
			/* socket: update game */
			this.updateGame();
			return true;
		};
		console.log("ikke din tur(endturn)");
		return false;
	}
	this.picCard(player1.name, true);
	this.picCard(player1.name, true);
	this.picCard(player1.name, true);
	this.picCard(player2.name, true);
	this.picCard(player2.name, true);
	this.picCard(player2.name, true);
	
}
