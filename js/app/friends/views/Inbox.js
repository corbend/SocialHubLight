define('friends/views/Inbox', [
	'backbone.marionette',
], function(Marionette) {"use strict";
		
	var Item = Marionette.ItemView.extend({
		tagName: 'li',
		template: '#friends-inbox-item-template',
		triggers: {
			'click .accept-button': 'accept:inbox',
			'click .remove-button': 'remove:inbox'
		}
	})

	var v = Marionette.CollectionView.extend({
		tagName: 'ul',
		childView: Item
	})

	return v;
});