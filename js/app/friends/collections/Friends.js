define('friends/collections/Friends', [
	'backbone',
	'friends/models/Friend'
], function(Backbone, User) {"use strict";

	var app = Backbone.Collection.extend({
		url: '/friends',
		model: User
	});
	
	return app;
})