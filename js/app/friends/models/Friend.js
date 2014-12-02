define('friends/models/Friend', [
	'backbone'
], function(Backbone) {"use strict";
	var app = Backbone.Model.extend({
		idAttribute: '_id',
		urlRoot: '/friends',
		// url: function() {
		// 	debugger;
		// 	var lastUrl = _.result(Backbone.Model.prototype, 'url');
		// 	debugger;
		// 	return lastUrl + "?status=" + this.get('status');
		// },
		defaults: {
			name: '',
			username: '',
			email: '',
			dateOfRegistration: null,
			status: '',
			isMyFriend: false,
			isOutboxed: false,
			ortogonalId: null
		},
		isMyFriend: function() {
			return _.where(this.get('friends'),
			 {userId: window.Friends.getGlobalUser(function() {}).id})[0];
		}
	});
	
	return app;
})