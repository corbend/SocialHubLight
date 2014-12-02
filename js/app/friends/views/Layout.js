define('friends/views/Layout', [
	'backbone.marionette',
	'friends/views/Inbox',
	'friends/views/Outbox',
	'friends/views/List'
], function(Marionette, InboxView, OutboxView, ListView) {"use strict";
	
	var lt = Marionette.LayoutView.extend({
		template: '#friends-layout-template',
		options: {
			outboxCollection: null,
			inboxCollection: null,
			listCollection: null
		},
		regions: {
			inboxRegion: '#inbox-region',
			outboxRegion: '#outbox-region',
			listRegion: '#list-region'
		},
		showInbox: function() {

			var scope = this;

			var view = new InboxView({
				collection: this.getOption('inboxCollection')
			})

			//принимаем предложение дружбы
			this.listenTo(view, 'childview:accept:inbox', function(childView) {

				var oldStatus = 'inbox';
				childView.model.set('status', "accept", {silent: true});
				//после изменения статуса
				childView.model.once('sync', function() {
					view.collection.fetch();
					scope.getOption('listCollection').fetch();
				})
				//если происходит ошибка, возращаем старый статус
				childView.model.once('error', function() {
					childView.model.set('status', oldStatus, {silent: true});
					view.render();
				})
				childView.model.save({
					url: childView.model.url() + "/accept"
				});
			})

			this.listenTo(view, 'childview:remove:inbox', function(childView) {
				childView.model.once('error', function() {
					view.render();
				})

				childView.model.destroy({
					url: childView.model.url() + "/inbox"
				});
			})

			this.inboxRegion.show(view);
		},
		showOutbox: function() {

			var view = new OutboxView({
				collection: this.getOption('outboxCollection')
			});

			this.listenTo(view, 'childview:remove:inbox', function(childView) {
				childView.model.once('error', function() {
					view.render();
				})
				childView.model.destroy({
					url: childView.model.url() + "/outbox"
				});
			})

			this.outboxRegion.show(view);
		},
		showList: function() {

			var view = new ListView({
				collection: this.getOption('listCollection')
			});

			this.listenTo(view, 'childview:remove:inbox', function(childView) {
				childView.model.once('error', function() {
					view.render();
				})
				childView.model.destroy({
					url: childView.model.url() + "/accept"
				});
			})

			this.listRegion.show(view)
		},
		onRender: function() {

			this.showInbox();
			this.showOutbox();
			this.showList();			
		}	
	})
	
	return lt;
})