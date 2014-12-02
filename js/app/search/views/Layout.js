define('search/views/Layout', [
	'backbone.marionette',
	'search/views/List'
], function(Marionette, ListView) {"use strict";
	
	var lt = Marionette.LayoutView.extend({
		template: '#search-layout-template',
		options: {
			searchCollection: null
		},
		ui: {
			searchField: 'input'
		},
		events: {
			'keyup input': 'onSearch'
		},
		regions: {
			resultRegion: '#result-region'
		},
		showResultList: function() {

			var view = new ListView({
				collection: this.getOption('searchCollection')
			})

			this.resultRegion.show(view);
		},
		onRender: function() {

			this.showResultList();		
		},
		onSearch: function() {

			var cl = this.getOption('searchCollection');
			cl.searchCriteria = this.ui.searchField.val();
			cl.fetch();
		}
	})
	
	return lt;
})