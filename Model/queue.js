module.exports = {
	userList : new Array(),
	adduser: function(user, deck) {
		this.userList.push({user: user, deck: deck});
	},
	removeuser: function (name) {
		for (var i = 0; i < this.userList.length; i++) {
			if(this.userList[i].user.name == name)
				return this.userList.splice(i, 1);
		}
		return false;
	}
}