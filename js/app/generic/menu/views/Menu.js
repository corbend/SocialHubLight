define('generic/menu/views/Menu', [
	'backbone.marionette',
], function(Marionette) {"use strict";
		
	var Item = Marionette.ItemView.extend({
		tagName: 'li',
		template: function(data) {
			return _.template([
				'<a href="#<%=url%>" class="button rectangular">',
					'<i class="fa fa-<%=icon%>"></i>',
        			'<span><%=title%></span>',
				'</a>'
			].join("\r\n"))(data)
		},
		events: {
			'click a': 'onClick'
		},
		onClick: function(event) {
			event.preventDefault();
			this.trigger('before:select');
			this.$el.addClass('active');
		}
	})

	var v = Marionette.CollectionView.extend({
		tagName: 'ul',
		childView: Item,
		modelEvents: {
			'select': 'deselectAll'
		},
		deselectAll: function() {
			this.children.forEach(function(menuItem) {
				menuItem.$el.removeClass('active');
			})
		}
	})

	return v;
});