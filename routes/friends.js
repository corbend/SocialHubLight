var express = require('express');
var mongoose = require('mongoose');
var _ = require('lodash');

var FriendAPI = require('../utils/friends');

module.exports = function(app) {

	var router = express.Router();

	router.use('all', function(req, res, next) {
		if (req.isAuthenticated()) {
			next(null);
		} else {
			next(new Error("not authorize!"));
		}
	})

	router.put('/:id/accept', function(req, res) {
		var callUserId = req.user._id;
		var friendId = req.params.id;
		var updateData = _.extend({}, req.body);
		var inviteUserId = req.body.userId;

		//меняем статус у того, кто послал заявку
		FriendAPI.changeStatus(callUserId, inviteUserId, req.body.status,
			function(err, friend) {

				if (!err) {
					FriendAPI.changeStatus(inviteUserId, callUserId, req.body.status, 
						function(err) {
							cb(null, friends);
						}
					)
					
				} else {
					cb(err, friend);
				}
			}
		)
	})

	router.put('/:id', function(req, res) {
		//разрешаем добавится в друзья
		var callUserId = req.user._id;
		var friendId = req.params.id;
		var updateData = _.extend({}, req.body);
		var inviteFriendId = req.params.id
		var inviteUserId = req.body.userId;

		FriendAPI.changeStatus(callUserId, inviteUserId, req.body.status,
			function(err, updatedFriend) {
				if (!err) {
					if (req.body.status == "accept") {
						//если есть подтверждение дружбы - делаем изменение статуса на другой стороне
						FriendAPI.changeStatus(inviteUserId, callUserId, req.body.status, 
							function(err) {
								if (!err) {
									res.send(updatedFriend);
								} else {
									res.status(500).send(err);
								}
							}
						)
					} else {
						res.send(updatedFriend);
					}
				} else {
					res.status(500).send(err);
				}
			}
		)
	})

	router.post('/', function(req, res) {
		var userId = req.user._id;
		var newFriend = _.extend({}, req.body);

		FriendAPI.addFriend(userId, newFriend, function(err, friend) {
			if (err) res.status(500).send({error: err})
			else {
				res.send(newFriend);
			}
		});
	})


	function searchUsers(iAmProfile, isSearch, cb) {
		var Profile = mongoose.model('Profile');

		var queryParams = {userId: {$ne: iAmProfile.userId}};
		if (isSearch) {
			queryParams.name = {$regex: new RegExp(isSearch)};
		}

		Profile.find(queryParams,
		function(err, profiles) {
			if (err) cb(err);
			else {
				var clone = _.clone(profiles);
				var isOutboxed = false;
				var isAccepted = false;

				clone.forEach(function(fr, index) {

					var mod = clone[index].toObject();

					if (iAmProfile && iAmProfile.friends) {
						iAmProfile.friends.forEach(function(f) {
							if (f.userId.toString() == mod.userId.toString()) {

								mod.isMyFriend = true;
								mod.status = f.status;
								mod.ortogonalId = f._id;
							}
						})
					}

					var isInOtherInbox = _.where(mod.friends, {userId: iAmProfile.userId})[0];
					if (isInOtherInbox) {
						mod.isMyFriend = true;
						mod.status = 'inbox';
						mod.ortogonalId = isInOtherInbox._id;
					}

					clone[index] = mod;
				})

				cb(null, clone);
			};
		})
	}

	router.get('/all', function(req, res) {

		var Profile = mongoose.model('Profile');
		var isSearch = req.query.search;

		Profile.findOne({userId: req.user._id}, function(err, iAm) {
			if (err) res.status(500).send(err);
			else {
				if (iAm) {
					searchUsers(iAm, isSearch, function(err, users) {
						if (err) res.status(500).send(err);
						else {
							res.send(users);
						}
					});
				} else {
					res.send([]);
				}
			}
		})
			
	})

	router.get('/', function(req, res) {
		var userId = req.user._id;

		var statusCodes = ['accept', 'inbox', 'outbox'];
		var queryStatus = req.query.status;

		if (req.query.search) {
			queryParams
		}

		if (_.indexOf(statusCodes, queryStatus) == -1) {
			res.status(500).send({error: 'not allowed status'});
			return;
		}

		FriendAPI.getFriendsByStatus(userId, queryStatus, function(err, friends) {
			if (!err) {
				res.send(friends);
			} else {
				res.status(500).send({error: err});
			}
		})
	});

	router.delete('/:id/inbox', function(req, res) {
		var userId = req.user._id;
		var friendId = req.params.id;

		FriendAPI.removeFromInbox(userId, friendId, function(err, removedCnt) {
			if (!err) {
				res.send({error: null});
			} else {
				res.status(500).send({error: err});
			}
		})

	})

	router.delete('/:id/outbox', function(req, res) {
		var userId = req.user._id;
		var friendId = req.params.id;

		FriendAPI.removeFriend(userId, friendId, 'outbox', function(err, removedCnt) {
			if (!err) {
				res.send({error: null});
			} else {
				res.status(500).send({error: err});
			}
		})

	})

	router.delete('/:id/accept', function(req, res) {
		var userId = req.user._id;
		var friendId = req.params.id;

		FriendAPI.removeFriend(userId, friendId, 'accept', function(err, removedCnt) {
			if (!err) {
				res.send({error: null});
			} else {
				res.status(500).send({error: err});
			}
		})

	})

	router.delete('/:id', function(req, res) {
		//отмена заявки добавления в друзья
		var userId = req.user._id;
		var friendId = req.params.id;

		FriendAPI.removeFriend(userId, friendId, function(err, removedCnt) {
			if (!err) {
				res.send({error: null});
			} else {
				res.status(500).send({error: err});
			}
		})

	})

	app.use('/friends', router);
}