define('profile/views/Detail', [
	'backbone.marionette',
], function(Marionette) {"use strict";
		
	var v = Marionette.ItemView.extend({
		template: '#profile-detail-template',
		templateHelpers: function(data) {
			return {
				dateFormatted: new Date(this.model.get('dateOfRegistration')).toLocaleString()
			}
		}
	})

	return v;
});