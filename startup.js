
var mongoose = require('mongoose');
var UserApi = require('./utils/users').Api;
var User = mongoose.model('User');

var adminDefaultName = "admin";

function createAdmin(connection, cb) {
	var password = 'admin1234567890';
	console.log("SUPERADMIN NOT FOUND!");
    console.log("CREATE SUPERADMIN!");

    UserApi.createUser(adminDefaultName, password, cb);
}

function checkAdminExist(connection, cb) {
	User.find({username: adminDefaultName}, function(err, admin) {

		if (admin.length) {
			cb(err, admin);
		} else {
			createAdmin(connection, cb);
		}
	})
}

exports.startDB = {
	checkAdminExist: checkAdminExist,
	createAdmin: createAdmin
}