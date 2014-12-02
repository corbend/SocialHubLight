var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	name: String,
	username: String,
	lastEnter: Date,
	passwordSalt: String,
	passwordHash: String,
	telephone: String,
	dateOfRegistration: Date,
	email: String,
	activated: Boolean,
	verifiedByMail: Boolean,
	notActivatedTime: Number,
	document: Object,
	block: Boolean,
	status: String
})

module.exports = {
	User: mongoose.model('User', UserSchema),
	Schema: UserSchema
}