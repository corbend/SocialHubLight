var mongoose = require('mongoose');
var _ = require("lodash");

module.exports = {
	changeStatus: function(userId, friendUserId, status, cb) {
		//меняем статус друга
		var User = mongoose.model('User');
		var Friend = mongoose.model('Friend');

		//от кого запрос на изменение статуса
		Friend.findOne({userId: userId.toString()}, function(err, friend) {

			if (!err && friend) {
				var targetFriendIdx = _.pluck(friend.friends, 'userId')
							.map(function(t) {return t.toString();}).indexOf(friendUserId);
				
				if (targetFriendIdx != -1) {
					var targetFriend = friend.friends[targetFriendIdx];
					targetFriend.status = status;
					//targetFriend.ortogonalId = friend._id;
					console.log("UPDATE STATUS->", status);
					friend.save(function(err, saved) {
						if (err) cb(err);
						else {
							targetFriend.ortogonalId = saved.friends[targetFriendIdx]._id;
							cb(null, targetFriend);
						}
					});
				} else {
					User.findOne({_id: friendUserId}, function(err, user) {
						if (!err && user) {
							var newFriendData = _.extend({userId: user._id}, user._doc, {status: status});
							delete newFriendData['_id'];
							delete newFriendData['passwordSalt'];
							delete newFriendData['passwordHash'];
							console.log("ADD TO FRIENDS->", newFriendData);
							friend.friends.push(newFriendData);

							friend.save(function(err, saved) {
								if (err) cb(err);
								else {
									newFriendData.ortogonalId = _.last(friend.friends)._id;
									cb(null, newFriendData);
								}
							});
						} else {
							cb(err);
						}
					})
				}
			} else {
				cb(err);
			}
		})
	},
	_removeOrtogonalFriend: function(userId, removedFriendUserId, cb) {
		var Friend = mongoose.model('Friend');

		Friend.findOne({userId: removedFriendUserId}, function(err, ortoFriend) {
			console.log("REMOVE ORTOGONAL->", ortoFriend);
			if (!err && ortoFriend) {
				var removeOrto = ortoFriend.friends.filter(
					function(t) {
						return t.userId.toString() == userId;
					});

				console.log("DELETE FRIEND->", removeOrto);
				removeOrto.forEach(function(rm, index) {
					ortoFriend.friends.id(rm._id).remove();
				})
				ortoFriend.save(cb);
			} else {
				cb(err);
			}
		})
	},
	removeFriend: function(userId, friendId, checkStatus, cb) {
		//удаляем из друзей
		var scope = this;
		var Friend = mongoose.model('Friend');

		Friend.findOne({userId: userId.toString()}, function(err, friend) {
			console.log("DELETE->", err, friend)
			if (!err && friend) {
				var removedFriend = friend.friends.id(friendId);
				console.log("REMOVE FRIEND->", removedFriend);
				if (removedFriend && removedFriend.status == checkStatus) {
					var removedFriendUserId = removedFriend.userId;
					removedFriend.remove();
					if (removedFriend.status == "accept") {
						//удаляем себя с другой стороны
						scope._removeOrtogonalFriend(userId, removedFriendUserId,
							function(err) {
								if (!err) {
									console.log("ALL FRIENDS CLEAR!");
									friend.save(cb);	
								} else {
									cb(err);
								}
							})	
					} else {
						friend.save(cb);
					}
				} else {
					cb(null);
				}
			} else {
				cb(err);
			}
		})
	},
	removeFromInbox: function(userId, friendId, cb) {
		//@userId - пользователь, который хочет отклонить заявку
		//@friendId - друг, который подал заявку
		var Friend = mongoose.model('Friend');

		Friend.findOne({'friends.userId': userId}, function(err, remFriend) {
			console.log("PRERATE TO DELETE->", remFriend);
			if (!err && remFriend) {
				//фильтруем и удаляем выбранного друга
				console.log("FIND FRIENDS TO DELETE->", remFriend.friends);
				remFriend.friends.forEach(function(f, index) {
					console.log("CHECK DELETE->", f);
					if (f.userId == userId) {
						console.log("REMOVE FRIEND->", f);
						remFriend.friends[index].remove();
					}
				})
				remFriend.save(cb);
			} else {
				cb(err);
			}
		});

	},
	addFriend: function(userId, friend, cb) {
		//добавляем нового друга
		var Friend = mongoose.model('Friend');

		Friend.findOne({userId: userId}, function(err, friend) {
			if (!err && friend) {
				friend.friends.push(friend);
				friend.save(cb);
			} else {
				cb(err);
			}
		})
	},

	addFriendByFriend: function(userId, friendId, cb) {

		var Friend = mongoose.model('Friend');

		Friend.findOne({userId: userId}, function(err, friend) {
			console.log("ERR->", err, friend)
			if (!err && friend) {
				Friend.findOne({userId: friendId}, function(err, friendWith) {
					if (!err && friendWith) {
						var friendWithData = _.extend({}, friendWith._doc, {status: 'inbox'});
						delete friendWithData._id;
						delete friendWithData.passwordSalt;
						delete friendWithData.passwordHash;
						//если пользователя нет в друзьях, то добавляем, иначе кидаем ошибку
						var friendIndex = _.pluck(friend.friends, 'userId')
						.map(function(t) {
							return t.toString();
						}).indexOf(friendWith.userId.toString());

						if (friendIndex == -1) {
							console.log("ADD TO INBOX->", friendWithData);
							friend.friends.push(friendWithData);
							friend.save(function(err, saved) {
								cb(err, friendWithData);
							})
						} else {
							console.log("ERR->user is already your friend");
							cb({error: 'user is already your friend'});
						}
					} else {
						cb(err);
					}
				})
			} else {
				cb(err);
			}
		})
	},

	getIncomes: function(inviteId, cb) {
		//найдем все приглашения
		var Friend = mongoose.model('Friend');
		console.log("inviteId->", inviteId);
		Friend.find(
			{'friends.userId': inviteId, 
			 'friends.status': 'outbox'},
			  function(err, incomeFriends) {

			incomeFriends.forEach(function(fr, index) {
				incomeFriends[index].status = "inbox";
			})
			console.log("INCOMES->", incomeFriends);
			cb(err, incomeFriends);
		})
	},
	getByStatus: function(userId, status, cb) {
		var Friend = mongoose.model('Friend');
		var queryParams = {userId: userId};

		Friend.findOne(queryParams, function(err, friend) {
			if (!err && friend) {
				var friends = _.where(friend.friends, {status: status});
				console.log(friend);
				console.log(friend.friends);
				console.log('FRIEND FRIENDS->', friends);
				cb(err, friends);
			} else {
				if (!friend) {
					Friend.create({
						userId: userId,
						friends: []
					}, function(err, friend) {
						console.log('FRIEND INIT!-')
						cb(err, []);
					})
				} else {
					cb(err, []);
				}
			}
		});
	},
	getFriendsByStatus: function(userId, status, cb) {
		//берем список друзей в зависимости от статуса
		var Friend = mongoose.model('Friend');
		var status = status || 'accepted';

		//для входящих отдельный запрос
		if (status == "inbox") {
			this.getIncomes(userId, cb);
		} else {
			this.getByStatus(userId, status, cb);
		}
	}
}