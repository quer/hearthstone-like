jQuery(function($) {
	activeCardId = null;
	var socket = io.connect();
	/*$( "#myHand" ).on( "click", ".card", function() {
		console.log("card click");
		if ($( "#myTeam .card" ).length < 7) {
			$("#myTeam").append($(this)[0].outerHTML);
			$(this).remove();
			console.log("card moved");
		}else{
			console.log("card game full");
		}
	});*/
	socket.on('gameStart', function () {
		cleanNewGame();
	});
	socket.on('updateGame', function(data){
		updateGame(data);
	});
	socket.on('gameEnd', function (youWon) {
		gameEnd(youWon);
	})
	$( "#login" ).on( "click", "#newPlayerButton", function() {
		if (!hasWhiteSpace($("#login #newPlayerName").val())) {
			var playerName = $("#login #newPlayerName").val();
			console.log(playerName);
			//socket.emit('new user', playerName);
			socket.emit('new user', playerName, function(data){
				if (data.status) {
					$( "#login" ).hide();
					$( "#menu" ).show();
					console.log("---login Work---");
					console.log(data.text);	
				}else{
					console.log("---login fail---");
					console.log(data.text);
				}
			});
		}else{
			console.log("---login fail---");
			console.log("der er mellemrum");
		}
	});
	$( "#menu" ).on( "click", ".items", function() {
		var buttomText = $(this).text();
		/* start game page */
		if (buttomText == "play") {
			console.log("play screen");
			/* true så ved den det er play siden*/
			showDecksPage(true);
		}else 
		/* show deck page */
		if (buttomText == "deck") {
			showDecksPage();
		}else 
		/* show cards page */
		if (buttomText == "cards") {
			showCardsPage();
		}else{
			console.log("i fuckt up");
		}
	});
	$( "body" ).on( "click", ".backToMenu", function() {
		showpage("menu");
	});
	$( "#decks" ).on( "click", "#CreaterandomDeck", function() {
		socket.emit('CreaterandomDeck', function(data){
			if (data.status) {
				showDecksPage();
			}else
			{
				console.log("fail creating a random deck");
			}
		});
	});
	$( "#gameDecks" ).on( "click", ".deck", function() {
		var deckname = $(this).attr("deckname");
		if (deckname != "emty") {
			socket.emit('getDeckCards', deckname, function(data){
				if (data.status) {
					showCardsPage(data.items);
				}else{
					console.log("fail creating a random deck");
				}
			});
		}else{
			console.log("not a deck");
		}
	});
	$("#play").on("click", ".deck", function(){
		/* Add to queue */
		var deckname = $(this).attr("deckname");
		if (deckname != "emty") {
			socket.emit('toQueue', deckname, function(data){
				if (data.status) {
					showpage("queue");
					console.log("add you to gueue");
				}else{
					console.log("fail add you to gueue");
				}
			});
		}else{
			console.log("not a deck");
		}
	});
	$("#theBoard").on("click", "#nextTurn", function () {
		socket.emit('nextTurn', function(data){
			activeCardId = null;
			if (data.status) {

				console.log("next turn");
			}else{
				console.log("not your turn(new turn)");
			}
		});
	}).on("click", "#myHand .card", function () {
		var cardId = $(this).attr("cardId");
		socket.emit('activeCard', cardId,  function(data){
			if (data.status) {
				console.log("next turn");
			}else{
				console.log("not your turn(new turn)");
			}
		});
	}).on("click", "#myTeam .card", function () {
		if ($(this).attr("charge") == "true") {
			activeCardId = $(this).attr("cardId");
			console.log("card selceted: " + activeCardId);
		}else{
			console.log("card not charge");
		}
	}).on("click", "#enemyTeam .card", function () {
		if(activeCardId != null){
			var cardId = $(this).attr("cardId");
			socket.emit('useCard', activeCardId, cardId,  function(data){
				if (data.status) {
					activeCardId = null;
					console.log("move done");
				}else{
					console.log("noget kig galt server side");
				}
			});
		}else{
			console.log("vælg et kort at angribe med!");
		}
	}).on("click", "#enemyPlayer", function () {
		if(activeCardId != null){
			socket.emit('useCardOnPlayer', activeCardId,  function(data){
				if (data.status) {
					activeCardId = null;
					console.log("move done on player");
				}else{
					console.log("noget kig galt server side");
				}
			});
		}else{
			console.log("vælg et kort at angribe med!");
		}
	});
	
	function hasWhiteSpace(s) {
		return s.indexOf(' ') >= 0;
	}
	

	/**
	*	load and show a page
	*/
	function showCardsPage (cardArray) {
		console.log("cards screen");
		/* shows all card that is in the game*/
		if (cardArray === undefined) {
			socket.emit('cards screen', function(data){
				console.log(data);
				if (data.status) {
					$( "#cards #gameCards" ).html("");
					var cardsHtml = "";
					for (var i = 0; i < data.items.length; i++) {
						cardsHtml += createCardHtml(data.items[i]);
					};
					$( "#cards #gameCards" ).html(cardsHtml);
					showpage("cards");
				}else{
					console.log("server side fuck up");		
				}
			});
		}else{
			$( "#cards #gameCards" ).html("");
			var cardsHtml = "";
			for (var i = 0; i < cardArray.length; i++) {
				cardsHtml += createCardHtml(cardArray[i]);
			};
			$( "#cards #gameCards" ).html(cardsHtml);
			showpage("cards");
		}
	}
	function showDecksPage (onPlayPage) {
		console.log("deck screen");
		socket.emit('deck screen', function(data){
			console.log(data.items);
			if (data.status) {
				if (onPlayPage !== undefined) {
					$( "#play #gameDecks" ).html("");
				}else{
					$( "#decks #gameDecks" ).html("");
				}
				var decksHtml = "";
				for (var i = 0; i < data.items.length; i++) {
					decksHtml += createDeckHtml(data.items[i]);
				};
				for (var i = 0; i < (9-data.items.length); i++) {
					decksHtml += createDeckHtml("emty");
				};
				if (onPlayPage !== undefined) {
					$( "#play #gameDecks" ).html(decksHtml);
				}else{
					$( "#decks #gameDecks" ).html(decksHtml);
				}
				console.log("deckHtml: "+decksHtml);
				if (onPlayPage !== undefined) {
					showpage("play");
				}else{
					showpage("decks");
				}
			}else{
				console.log("server side fuck up");		
			}
		});
	}
	function createCardHtml (data) {
		return '<div class="card" taunt="'+data.taunt+'" charge="'+data.charge+'" cardId="'+data.id+'"><div class="cardImage"><img src="'+data.cardImage+'"></div><div class="cardDesigh" style="background-image: url(\'site/image/'+data.cardTamplate+'\');" ><div class="attack">'+data.attack+'</div><div class="health">'+data.health+'</div><div class="cost">'+data.cost+'</div><div class="data">'+data.text+'</div></div></div>';
	}
	function createDeckHtml (data) {
		return '<div class="deck" deckName="'+data+'">'+data+'</div>';
	}
	function showpage (page) {
		$( "#theBoard" ).hide();
		$( "#menu" ).hide();
		$( "#cards" ).hide();
		$( "#decks" ).hide();
		$( "#play" ).hide();
		$( "#queue" ).hide();
		$( "#gameEnd" ).hide();
		if (page == "theBoard") {
			$( "#theBoard" ).show();
		}else if (page == "cards") {
			$( "#cards" ).show();
		}else if (page == "decks") {
			$( "#decks" ).show();
		}else if (page == "play") {
			$( "#play" ).show();
		}else if (page == "queue") {
			$( "#queue" ).show();
		}else if (page == "gameEnd") {
			$( "#gameEnd" ).show();
		}else {
			$( "#menu" ).show();
		}
	}
	/* the game data */
	function cleanNewGame() {
		$( "#theBoard #enemyHand" ).html("");
		$( "#theBoard #theMap #enemyTeam" ).html("");
		$( "#theBoard #theMap #myTeam" ).html("");
		$( "#theBoard #myHand" ).html("");
		showpage("theBoard");
	}
	function updateGame (data) {
		console.log(data);
		/* clean all */
		$( "#theBoard #enemyHand" ).html("");
		$( "#theBoard #theMap #enemyTeam" ).html("");
		$( "#theBoard #theMap #myTeam" ).html("");
		$( "#theBoard #myHand" ).html("");
		/* set enemyHand */
		var enemyHand = "";
		for (var i = 0; i < data.enemyHand; i++) {
			enemyHand += '<div class="card backcard">a</div>';
		};
		$( "#theBoard #enemyHand" ).html(enemyHand);
		/* set myHand */
		var myHand = "";
		for (var i = 0; i < data.myHand.length; i++) {
			myHand += createCardHtml(data.myHand[i]);
		};
		$( "#theBoard #myHand" ).html(myHand);
		/* set theMap enemyTeam*/
		var enemyTeam = "";
		for (var i = 0; i < data.enemyTable.length; i++) {
			enemyTeam += createCardHtml(data.enemyTable[i].Card, true);
		};
		$( "#theBoard #theMap #enemyTeam" ).html(enemyTeam);
		/* set theMap myTeam*/
		var myTeam = "";
		for (var i = 0; i < data.myTable.length; i++) {
			myTeam += createCardHtml(data.myTable[i].Card);
		};
		$( "#theBoard #theMap #myTeam" ).html(myTeam);
		$( "#theBoard #enemygems" ).html(data.enemy.gemsLeft+" tilbage ud af "+ data.enemy.turns)
		$( "#theBoard #mygems" ).html(data.gemsLeft+" tilbage ud af "+ data.turns);
		$( "#theBoard #info" ).html("turn: "+ data.turn+ "<br>turns: "+ data.turns+ "<br>my live: "+ data.myLife+ "<br>cards Left: "+ data.cardsLeft);
		$( "#theBoard #enemyPlayer" ).html("enemy lives back: "+ data.enemyLife);
	}
	function gameEnd(youWon){
		if (youWon) {
			$( "#gameEnd .items" ).html("you won the game!!");
		}else{
			$( "#gameEnd .items" ).html("you lost the game!!");
		}
		cleanNewGame();
		showpage("gameEnd");
	}
});