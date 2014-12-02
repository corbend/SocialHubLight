define('profile/models/User', [
	'backbone'
], function(Backbone) {"use strict";
	var app = Backbone.Model.extend({
		idAttribute: '_id',
		urlRoot: '/users',
		defaults: {
			name: '',
			username: '',
			email: '',
			dateOfRegistration: null,
			friends: null
		}
	});
	
	return app;
})