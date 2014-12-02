var mongoose = require("mongoose");
var async = require("async");
var nconf = require("nconf");
var config = require('./config');

var startup = require('./startup').startDB;
var nodeEnv = process.env.NODE_ENV || 'development';
var devMode = nodeEnv;
var mongoHost = process.env.OPENSHIFT_MONGODB_DB_HOST;
var mongoPort = process.env.OPENSHIFT_MONGODB_DB_PORT;
var mongoUsername = process.env.OPENSHIFT_MONGODB_DB_USERNAME;
var mongoPassword = process.env.OPENSHIFT_MONGODB_DB_PASSWORD;

var User = require('./models/User').User;
var Profile = require('./models/Profile').Profile;

function getConnectionConfig(configObject) {

	var devConnectionString = configObject.get('db_string');
	var detConString = devConnectionString;
	var development = true;

	//OPENSHIFT DB setup
	if (mongoHost && mongoPort && devMode == "production") {

		detConString = [
			'mongodb://',
			mongoUsername, ':',
			mongoPassword, '@',
			mongoHost, ":", mongoPort, "/", "monolith"
		].join("");
	}

	var baseConfig = {
		connectionString: detConString,
		name: configObject.get('db_name'),
		db: configObject.get('db_name')
	};

	if (devMode == "development") {

		baseConfig.host = mongoHost;
		baseConfig.port = mongoPort;
		baseConfig.username = mongoUsername;
		baseConfig.password = mongoPassword;
	}

	return baseConfig;
}

function init(configObject, outerCallback) {

	async.waterfall([ 
		function(cb) {
			//читаем конфиг
			nconf.use('file', {file: './config.json'});
			nconf.load();
			configObject = nconf;
			cb(null, configObject);
		},
		function(configObject, cb) {
			//коннектимся к базе
		
			mongoose.connect(getConnectionConfig(configObject).connectionString);

			var cn = mongoose.connection;

			cn.on('open', function(cn) {
				cb(null, cn);
			});

			cn.on('error', function(err) {
				cb(err);
			})
		},
		function(connection, cb) {		
			startup.checkAdminExist(connection, cb);
		},
		function(_, cb) {
			console.log("prepopulate data!");
			//stub for populating db
			cb(null);
		}
	],	function(err, result) {

		if (err) {
			console.log("ERROR->" + err);
			outerCallback(err);
		} else {
			outerCallback(null, configObject);
		}
	})
}

module.exports = {
	init: init,
	getConnectionConfig: getConnectionConfig
}
