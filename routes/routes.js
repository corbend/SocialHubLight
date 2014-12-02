
var mongoose = require('mongoose');

module.exports = function(app) {

	app.get('/', function(req, res) {

		if (req.isAuthenticated()) {

			var Profile = mongoose.model('Profile');
			//создадим профиль пользователя, если его еще не существует
			Profile.findOne({userId: req.user._id}, function(err, profile) {
				if (!err && !profile) {
					Profile.create({
						userId: req.user._id,
						name: req.user.name,
						dateOfRegistration: req.user.dateOfRegistration
					}, function(err, created) {
						if (!err) {
							res.render('main');
						} else {
							res.status(500).send(err);
						}
					})
				} else {
					if (err) res.status(500).send(err);
					else {
						res.render('main');
					}
				}
			})

		} else {
		 	res.render('auth');
		}
	});
}