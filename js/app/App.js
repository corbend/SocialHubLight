define('App', [
	'backbone',
	'backbone.marionette',
	'friends/Module',
	'profile/Module',
	'search/Module',
	'generic/menu/Controller',
	'profile/models/User'
], function(Backbone, Marionette,
	FriendModule, ProfileModule, SearchModule, MenuController,
	User
) {"use strict";
	var app = new Marionette.Application();

	app.addRegions({
		'menuRegion': '#menu-region',
		'contentRegion': '#content-region'
	})

	function createRouter(app) {
		var Router = Backbone.Router.extend({
			routes: {
				'profile': 'showProfile',
				'friends': 'showFriends',
				'search': 'showSearch',
				'*path': 'showMain'
			},
			showMain: function() {
				app.showMainView();
			},
			showProfile: function() {
				app.contentRegion.show(ProfileModule.API.showLayout());
			},
			showFriends: function() {
				app.contentRegion.show(FriendModule.API.showLayout());
			},
			showSearch: function() {
				app.contentRegion.show(SearchModule.API.showLayout());
			}

		})

		app.Router = new Router();
	}

	function initMenu(app) {

		var MenuCollection = Backbone.Collection.extend({
			comparator: 'idx'
		});

		app.Menu = {
			Items: new MenuCollection({
				idx: 100,
				title: 'Exit',
				url: '/sign-out',
				icon: 'exit',
				action: function() {window.location="/sign-out";}
			}),
			Controller: new MenuController({mainApplication: app})
		}
	}

	function showMenu(app) {
		app.menuRegion.show(app.Menu.Controller.showMenu(app.Menu.Items));

		app.Menu.Items.trigger('select', app.Menu.Items.at(0));
	}

	app.on('start', function() {

		createRouter(app);	
		initMenu(app);

		//регистрируем суб-приложения и пункты меню
		ProfileModule.start({mainApplication: app});
		FriendModule.start({mainApplication: app});
		SearchModule.start({mainApplication: app});

		Backbone.history.start();

		showMenu(app);
	})

	app.showMainView = function() {
		ProfileModule.API.showLayout();
	}

	app.registerMenu = function(options) {

		app.Menu.Items.add(options);
	}

	app.getGlobalUser = function(cb) {

		if (!window.Friends.__GLOBAL_USER) {
			var CurrentUser = User.extend({
				url: function() {
					return '/users/current';
				}
			})

			var cUser = new CurrentUser();
			cUser.sync('read', cUser, {
				success: function(data) {
					cUser.set(data);
					window.Friends.__GLOBAL_USER = cUser;
					cb(cUser);
				}
			});
		} else {
			cb(window.Friends.__GLOBAL_USER);
			return window.Friends.__GLOBAL_USER;
		}
	}

	return app;
})