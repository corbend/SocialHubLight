define('friends/Module', [

	'backbone.marionette',
	'friends/collections/Friends',
	'friends/views/Layout'

], function(Marionette, FriendsCollection, Layout) {"use strict";
	var app = new Marionette.Application();

	app.on('start', function(opts) {
		this.mainApplication = opts.mainApplication;

		this.mainApplication.registerMenu({
			title: 'Friends',
			url: '/friends',
			idx: 2,
			icon: 'user',
			action: this.API.showLayout
		});
	})

	app.API = {
		showLayout: function() {
					
			var InboxCollection = FriendsCollection.extend({
				url: function() {
					var lastUrl = _.result(FriendsCollection.prototype, 'url');
					return lastUrl + "?status=inbox"
				}
			})

			var OutboxCollection = FriendsCollection.extend({
				url: function() {
					var lastUrl = _.result(FriendsCollection.prototype, 'url');
					return lastUrl + "?status=outbox"
				}
			})

			var ListCollection = FriendsCollection.extend({
				url: function() {
					var lastUrl = _.result(FriendsCollection.prototype, 'url');
					return lastUrl + "?status=accept"
				}
			})

			var inboxCl = new InboxCollection();
			var outboxCl = new OutboxCollection();
			var listCl = new ListCollection();

			var lt = new Layout({
				inboxCollection: inboxCl,
				outboxCollection: outboxCl,
				listCollection: listCl
			});

			inboxCl.fetch();
			outboxCl.fetch();
			listCl.fetch();

			return lt;
		}
	}

	return app;
})