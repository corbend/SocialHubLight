define('profile/collections/Users', [
	'backbone',
	'profile/models/User'
], function(Backbone, User) {"use strict";

	var app = Backbone.Collection.extend({
		url: '/users',
		model: User
	});
	
	return app;
})