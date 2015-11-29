/* containers */
var CardContainer = require('./Model/cardContainer');
var UserContainer = require('./Model/userContainer');
var RoomContainer = require('./Model/roomContainer');
var QueueContainer = require('./Model/queue');
/* on cards */
var Summon = require('./Model/summon');
var CardTamplate = require('./Model/cardTamplate');
/* on decks */
var Card = require('./Model/card');
/* on users */
var Deck = require('./Model/deck');
var User = require('./Model/user');
/* on rooms */
var Room = require('./Model/room');

/* end pre load files */
var LoadCards = require('./Model/doCards');
LoadCards = new LoadCards(CardContainer);
console.log("card Loadet")
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

server.listen(3000);
app.use("/site/", express.static(__dirname + '/site/'));
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/site/index.html');
});

io.sockets.on('connection', function (socket) {
  console.log("new user connection");

  /* creater new acount*/
  socket.on('new user', function (data, callback){
    if(socket.playerName){
      //socket.emit('new user',{status: false, text: "do allready have a player"});
      callback({status: false, text: "do allready have a player"});
    }else if (data == "" || UserContainer.finduser(data) !== null) {
      //socket.emit('new user',{status: false, text: "the name allready in use"});
      callback({status: false, text: "the name allready in use"});
    }else{
      console.log("new user: "+data);
      socket.playerName = data;
      var newUser = new User(data, socket);
      UserContainer.adduser(newUser);
      //socket.emit('new user',{status: true, text: "done!"});
      callback({status: true, text: "done!"});
    }
  });
  socket.on('toQueue', function (deckName, callback) {
    var userData = UserContainer.finduser(socket.playerName);
    var userDeck = userData.findDeck(deckName);
    console.log("user: "+userData.name +" deck: "+ userDeck.name);
    QueueContainer.adduser(userData, userDeck);
    callback({status:true});
    console.log("new queue : "+ userData.name);
  });
  /* show cards page*/
  socket.on('cards screen', function (callback){
    callback({status:true, items: CardContainer.htmlList});
    console.log("send card list");
  });
  socket.on('deck screen', function (callback){
    if(socket.playerName){
      var userData = UserContainer.finduser(socket.playerName);
      var deckArrayNames = new Array();
      for (var i = 0; i < userData.deckList.length; i++) {
        deckArrayNames.push(userData.deckList[i].name);
      };
      callback({status:true, items: deckArrayNames});
    }else{
      callback({status:false, items: null});
    }
    //console.log("send card list");
  });
  socket.on('CreaterandomDeck', function (callback){
    var userData = UserContainer.finduser(socket.playerName);
    var randomNewDeck = CardContainer.createRandomDeck("randomNewDeck"+userData.deckList.length);
    userData.addDeck(randomNewDeck);
    callback({status:true});
  });
  socket.on('getDeckCards', function (deckName, callback){
    var userData = UserContainer.finduser(socket.playerName);
    var userDeck = userData.findDeck(deckName);
    callback({status:true, items: userDeck.htmlOutput()})
  });
  /* the game */
  socket.on('picCard', function (callback){
    if (socket.playerName) {
      var playerRoom = RoomContainer.findroom(socket.playerName);
      if (playerRoom.picCard(socket.playerName)) {
        callback({status:true});
      }else{
        callback({status:false});
      }
    };
  });
  socket.on('nextTurn', function (callback){
    var playerRoom = RoomContainer.findroom(socket.playerName);
    if (playerRoom.endturn(socket.playerName)) {
      callback({status:true});
    }else{
      callback({status:false});
    }
  });
  socket.on('activeCard', function (cardId, callback){
    var playerRoom = RoomContainer.findroom(socket.playerName);
    if (playerRoom.activeCard(socket.playerName, cardId)) {
      callback({status:true});
    }else{
      callback({status:false});
    }
  });
  socket.on('useCard', function (cardId, enemyCardId, callback){
    var playerRoom = RoomContainer.findroom(socket.playerName);
    if (playerRoom.useCard(socket.playerName, cardId, enemyCardId)) {
      callback({status:true});
    }else{
      callback({status:false});
    }
  });
  socket.on('useCardOnPlayer', function (cardId, callback) {
    var playerRoom = RoomContainer.findroom(socket.playerName);
    if (playerRoom.useCardOnPlayer(socket.playerName, cardId)) {
      callback({status:true});
    }else{
      callback({status:false});
    }
  })
});
console.log("cards in container: "+CardContainer.cardList.length);
/* loop */
var theQueueLoop = setInterval(function () {
  var queueUsers = QueueContainer.userList; 
  for (var i = 0; i < queueUsers.length; i++) {

    if(i % 2 == 1){
      console.log("---new room---");
      var newRoom = new Room(queueUsers[i-1].user, queueUsers[i].user, queueUsers[i-1].deck, queueUsers[i].deck)
      QueueContainer.removeuser(queueUsers[i].user.name);
      QueueContainer.removeuser(queueUsers[i-1].user.name);
      RoomContainer.addroom(newRoom);
      newRoom.player1.socket.emit('gameStart');
      newRoom.player2.socket.emit('gameStart');
      newRoom.updateGame();
      console.log("a game started");
    }
  };
}, 2000);