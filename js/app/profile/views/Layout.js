define('profile/views/Layout', [
	'backbone.marionette',
	'profile/views/Detail'
], function(Marionette, DetailView) {"use strict";
	
	var lt = Marionette.LayoutView.extend({
		template: '#profile-layout-template',
		options: {
			userModel: null
		},
		regions: {
			detailRegion: '#detail-region'
		},
		showDetail: function() {

			var view = new DetailView({
				model: this.getOption('userModel')
			})

			this.detailRegion.show(view);
		},
		onRender: function() {

			this.showDetail();		
		}	
	})
	
	return lt;
})