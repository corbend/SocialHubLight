define('generic/menu/Controller', [
	'backbone.marionette',
	'generic/menu/views/Menu'
], function(Marionette, MenuView) {

	var ctrl = Marionette.Controller.extend({
		initialize: function(opts) {
			this.mainApplication = opts.mainApplication;
		},
		showActiveItem: function(url, view) {
			var cl = view.collection;
			var selectedMenuItem;

			var selectedItem = cl.where({url: url})[0];

			if (selectedItem) {
				selectedMenuItem = view.children.findByModel(selectedItem);

				selectedMenuItem.$el.addClass('active');
			}
		},
		showMenu: function(collection) {
			var scope = this;

			var view = new MenuView({
				collection: collection
			})

			view.listenTo(collection, 'select', function(model) {
				scope.mainApplication.Router.navigate(model.get('url'));
				var showAction = model.get('action');
				scope.showActiveItem(model.get('url'), view);
				scope.mainApplication.contentRegion.show(showAction());
			})

			view.on('childview:before:select', function(childView) {
				view.children.forEach(function(cview) {
					cview.$el.removeClass('active');
				})
				childView.model.collection.trigger('select', childView.model);
			})

			return view;
		}
	})

	return ctrl;
})