define('profile/Module', [
	'backbone.marionette',
	'profile/models/User',
	'profile/collections/Users',
	'profile/views/Layout'
], function(Marionette, User, UsersCollection, Layout) {"use strict";
	var app = new Marionette.Application();
		
	app.on('start', function(opts) {
		console.log('PROFILE MODULE->START!');
		// this.List.Controller = new ListController();
		// this.Detail.Controller = new DetailController();
		this.mainApplication = opts.mainApplication;
		this.mainApplication.registerMenu({
			title: 'Profile',
			url: '/profile',
			idx: 1,
			icon: 'info',
			action: this.API.showLayout
		});
	})

	app.Users = new UsersCollection();

	app.API = {
		showLayout: function() {

			var CurrentUser = User.extend({
				url: function() {
					return '/user/current';
				}
			})

			var cUser = new CurrentUser();

			var lt = new Layout({
				userModel: cUser
			})

			cUser.sync('read', cUser, {
				url: '/users/current',
				success: function(data) {
					cUser.set(data);
					lt.render();
				}
			});

			return lt;
		}
	}

	return app;
})