var mongoose = require('mongoose');
var _ = require("lodash");

module.exports = {
	changeStatus: function(userId, friendUserId, status, cb) {
		//меняем статус друга
		var User = mongoose.model('User');
		var Profile = mongoose.model('Profile');

		//от кого запрос на изменение статуса
		Profile.findOne({userId: userId.toString()}, function(err, profile) {

			if (!err && profile) {
				var targetFriendIdx = _.pluck(profile.friends, 'userId')
							.map(function(t) {return t.toString();}).indexOf(friendUserId);
				
				if (targetFriendIdx != -1) {
					var targetFriend = profile.friends[targetFriendIdx];
					targetFriend.status = status;
					profile.save(function(err, saved) {
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

							profile.friends.push(newFriendData);

							profile.save(function(err, saved) {
								if (err) cb(err);
								else {
									newFriendData.ortogonalId = _.last(profile.friends)._id;
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
		var Profile = mongoose.model('Profile');

		Profile.findOne({userId: removedFriendUserId}, function(err, ortoFriend) {

			if (!err && ortoFriend) {
				var removeOrto = ortoFriend.friends.filter(
					function(t) {
						return t.userId.toString() == userId;
					});

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
		var Profile = mongoose.model('Profile');

		Profile.findOne({userId: userId.toString()}, function(err, profile) {

			if (!err && profile) {
				var removedFriend = profile.friends.id(friendId);

				if (removedFriend && removedFriend.status == checkStatus) {
					var removedFriendUserId = removedFriend.userId;
					removedFriend.remove();
					if (removedFriend.status == "accept") {
						//удаляем себя с другой стороны
						scope._removeOrtogonalFriend(userId, removedFriendUserId,
							function(err) {
								if (!err) {

									profile.save(cb);	
								} else {
									cb(err);
								}
							})	
					} else {
						profile.save(cb);
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
		//удаляем из входящих
		//@userId - пользователь, который хочет отклонить заявку
		//@friendId - друг, который подал заявку
		var Profile = mongoose.model('Profile');

		Profile.findOne({'friends.userId': userId}, function(err, remFriend) {

			if (!err && remFriend) {
				//фильтруем и удаляем выбранного друга

				remFriend.friends.forEach(function(f, index) {

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
	addFriend: function(userId, addFriend, cb) {
		//добавляем нового друга
		var Profile = mongoose.model('Profile');

		Profile.findOne({userId: userId}, function(err, profile) {
			if (!err && profile) {
				profile.friends.push(addFriend);
				profile.save(cb);
			} else {
				cb(err);
			}
		})
	},

	addFriendByFriend: function(userId, friendId, cb) {

		var Profile = mongoose.model('Profile');

		Profile.findOne({userId: userId}, function(err, myProfile) {

			if (!err && myProfile) {
				Profile.findOne({userId: friendId}, function(err, friendProfile) {
					if (!err && friendProfile) {
						var friendWithData = _.extend({}, friendProfile._doc, {status: 'inbox'});
						delete friendWithData._id;
						delete friendWithData.passwordSalt;
						delete friendWithData.passwordHash;
						//если пользователя нет в друзьях, то добавляем, иначе кидаем ошибку
						var friendIndex = _.pluck(myProfile.friends, 'userId')
						.map(function(t) {
							return t.toString();
						}).indexOf(friendProfile.userId.toString());

						if (friendIndex == -1) {

							myProfile.friends.push(friendWithData);
							myProfile.save(function(err, saved) {
								cb(err, friendWithData);
							})
						} else {

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
		//находим все приглашения
		var Profile = mongoose.model('Profile');

		Profile.find(
			{'friends.userId': inviteId, 
			 'friends.status': 'outbox'},
			  function(err, incomeProfile) {

			incomeProfile.forEach(function(fr, index) {
				incomeProfile[index].status = "inbox";
			})

			cb(err, incomeProfile);
		})
	},
	getByStatus: function(userId, status, cb) {

		var Profile = mongoose.model('Profile');
		var queryParams = {userId: userId};

		Profile.findOne(queryParams, function(err, profile) {
			if (!err && profile) {
				var friends = _.where(profile.friends, {status: status});
				cb(err, friends);
			} else {
				if (!profile) {
					Profile.create({
						userId: userId,
						friends: []
					}, function(err, created) {
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
		var status = status || 'accepted';

		//для входящих отдельный запрос
		if (status == "inbox") {
			this.getIncomes(userId, cb);
		} else {
			this.getByStatus(userId, status, cb);
		}
	}
}