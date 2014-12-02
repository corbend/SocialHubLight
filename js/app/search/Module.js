define('search/Module', [
	'backbone.marionette',
	'search/views/Layout',
	'friends/collections/Friends'
], function(Marionette, Layout, FriendsCollection) {"use strict";

	var app = new Marionette.Application();
		
	app.on('start', function(opts) {
		var scope = this;

		this.mainApplication = opts.mainApplication;
		this.mainApplication.registerMenu({
			title: 'Search',
			url: '/search',
			idx: 3,
			icon: 'search',
			action: app.API.showLayout
		});

	})

	app.API = {
		showLayout: function() {

			var UsersCl = FriendsCollection.extend({
				searchCriteria: '',
				url: function() {
					var lastUrl = _.result(FriendsCollection.prototype, 'url');
					var searchValue = String(this.searchCriteria);
					var searchParam = searchValue? "?search=" + searchValue: '';

					return lastUrl + "/all" + searchParam;
				}
			})

			var lt = new Layout({
				searchCollection: new UsersCl()
			})

			lt.on('show', function() {
				lt.resultRegion.currentView.on('childview:send:invoice', function(childView) {
					childView.model.set({
						status: 'outbox'
					})

					childView.model.once('sync', function() {
						childView.model.set('status', 'outbox');
						childView.model.set('isMyFriend', true);
						childView.render();
					})

					childView.model.save();

				})

				lt.resultRegion.currentView.on('childview:remove:friend', function(childView) {

					var frs = childView.model.get('friends');
					var deleteFriendId = childView.model.get('ortogonalId');

					var removeUrl = '/friends/' + deleteFriendId + "/" + childView.model.get('status');

					childView.model.destroy({
						url: removeUrl
					});

				})
			})

			return lt;
		}
	}

	return app;
})