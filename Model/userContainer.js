module.exports = {
	userList : new Array(),
	adduser: function(user) {
		this.userList.push(user);
	},
	finduser: function (name) {
		for (var i = 0; i < this.userList.length; i++) {
			if(this.userList[i].name == name)
				return this.userList[i];
		};
		return null;
	},
	removeuse: function (name) {
		for (var i = 0; i < this.userList.length; i++) {
			if(this.userList[i].name == name)
				return this.userList.splice(i, 1);
		}
		return false;
	}
}