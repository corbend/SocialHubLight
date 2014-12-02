define('search/views/List', [
	'backbone.marionette'
], function(Marionette) {"use strict";
	
	var Item = Marionette.ItemView.extend({
		tagName: 'li',
		template: '#search-result-template',
		events: {
			'click .control': 'doAction',
		},
		ui: {
			control: '.control'
		},
		onRender: function() {
			if (_.result(this.model, 'isMyFriend')) {
				this.ui.control.addClass('remove-button');	
			} else {
				this.ui.control.addClass('invoice-button');
			}
		},
		doAction: function(event) {
			if (this.model.get('isMyFriend')) {
				this.removeFriend(event);
			} else {
				this.sendInvoice(event);
			}
		},
		sendInvoice: function(event) {
			event.preventDefault();
			this.trigger('send:invoice');
		},
		removeFriend: function(event) {
			event.preventDefault();
			this.trigger('remove:friend');
		}
	})

	var v = Marionette.CollectionView.extend({
		tagName: 'ul',
		childView: Item
	})

	return v;

})