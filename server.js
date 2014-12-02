var express = require('express');
var http = require('http');
var path = require('path');
var io = require('socket.io');

var app = express();

var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var session = require('express-session');

var flash = require('connect-flash');
var mongoose = require('mongoose');
var db = require('./db');
var passport = require('passport');

var authSetup = require("./auth/middleware");

var MongoStore = require('connect-mongo')(session);

var port = process.env.PORT || 3000;
var env = process.env.NODE_ENV || 'development';

var config;

db.init(config, function(err, config) {
	if (env == "development") {

		var dbConfig = db.getConnectionConfig(config);	
		console.log("[INFO] - use dev setup");

	 	app.set('views', path.join(__dirname, 'views'));
	    app.set('view engine', 'jade');
	 	app.use(express.static(__dirname + "/public"));
	 	app.use(express.static(path.join(__dirname, '/js')));
	 	app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));

	 	app.use(bodyParser());
		app.use(methodOverride());
		app.use(errorHandler({dumpExceptions: true, showStack: true}));
		app.use(session({
			store: new MongoStore({
				mongoose_connection: mongoose.connection
			}),
		secret: '999'}));

		//CONFIG SECTION
		app.use(passport.initialize());
		app.use(passport.session());
		app.use(flash());

		authSetup.init();
		//ROUTES SECTION
		require('./auth/routing.js')(app);
		require('./routes/users')(app);
		require('./routes/routes')(app);
		require('./routes/friends')(app);

		app.get('*', function(req, res) {
			res.send(404);
		})
	}
})

var server = http.createServer(app);
server.listen(port, function() {
	console.log("Server is running on port" + port)
});