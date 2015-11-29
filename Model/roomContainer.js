module.exports = {
	roomList : new Array(),
	roomListEndGame : new Array(),
	addroom: function(room) {
		this.roomList.push(room);
	},
	/* find room form user name*/
	findroom: function (name) {
		for (var i = 0; i < this.roomList.length; i++) {
			if(this.roomList[i].player1.name == name){
				return this.roomList[i];
			}else if(this.roomList[i].player2.name == name){
				return this.roomList[i];
			}
		};
		return null;
	},
	removeroom: function (id) {
		for (var i = 0; i < this.roomList.length; i++) {
			if (this.roomList[i].id == id) {
				this.roomListEndGame.push(this.roomList[i]);
				return this.roomList.splice(i, 1);
			};
		};
		return false;
	}
}