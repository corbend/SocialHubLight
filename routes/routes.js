
var mongoose = require('mongoose');

module.exports = function(app) {

	app.get('/', function(req, res) {

		if (req.isAuthenticated()) {

			var Friend = mongoose.model('Friend');
			Friend.findOne({userId: req.user._id}, function(err, friend) {
				if (!err && !friend) {
					Friend.create({
						userId: req.user._id,
						name: req.user.name,
						dateOfRegistration: req.user.dateOfRegistration
					}, function(err, created) {
						if (!err) {
							console.log("CREATE PROFILE START->", req.user._id);
							res.render('main');
						} else {
							res.status(500).send(err);
						}
					})
				} else {
					if (err) res.status(500).send(err);
					else {
						console.log("BYPASS START->");
						res.render('main');
					}
				}
			})

		} else {
		 	res.render('auth');
		}
	});
}