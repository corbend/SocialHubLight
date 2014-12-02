var mongoose = require('mongoose');

var scheme = new mongoose.Schema({

	//от кого
	fromUserId: {type: mongoose.Schema.ObjectId, ref: 'User'},
	//кому
	toUserId: {type: mongoose.Schema.ObjectId, ref: 'User'},
})

module.exports = mongoose.model('Invite', scheme);