define('friends/views/Outbox', [
	'backbone.marionette',
], function(Marionette) {"use strict";
		
	var Item = Marionette.ItemView.extend({
		tagName: 'li',
		template: '#friends-outbox-item-template',
		triggers: {
			'click .remove-button': 'remove:inbox'
		}
	})

	var v = Marionette.CollectionView.extend({
		tagName: 'ul',
		childView: Item
	})

	return v;
});