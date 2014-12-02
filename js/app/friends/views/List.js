define('friends/views/List', [
	'backbone.marionette',
], function(Marionette) {"use strict";
		
	var Item = Marionette.ItemView.extend({
		tagName: 'li',
		template: '#friends-list-item-template',
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