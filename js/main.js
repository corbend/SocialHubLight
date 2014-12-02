require.config({
	baseUrl: 'app',
	paths: {
		jquery: '/bower_components/jquery/jquery.min',
		underscore: '/bower_components/underscore/underscore-min',
		backbone: '/bower_components/backbone/backbone',
		'backbone.marionette': '/bower_components/backbone.marionette/lib/backbone.marionette.min',
	},
	shim: {
		underscore: {
			deps: ['jquery'],
			exports: '_'
		},
		backbone: {
			deps: ['underscore'],
			exports: 'Backbone'
		}
	}
})

require(['backbone', 'App'], function(Backbone, mainApp) {
	console.log("START!!!");
	window.Friends = mainApp;
	mainApp.getGlobalUser(function() {
		mainApp.start();
	})
})