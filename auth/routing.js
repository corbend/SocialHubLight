var mongoose = require('mongoose');
var passport = require('passport');
var _ = require('lodash');
var UserUtils = require('../utils/users').Api;

module.exports = function(app) {
 
    app.get('/login', function (req, res, next) {

        res.render('auth', {
            'errors': req.flash('errors'),
            'message': req.flash('message')
        });
    });
 
    app.get('/sign-out', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    function validateAuth(username, password, name) {
        /**
         * проверка на символические характеристики данных пользователя
         */
        var errors = {};

        if (!username) {
            errors.username = "is required!";
        }

        if (!password) {
            errors.password = "is required!";
        }

        if (!(/^[a-zA-Z]{1}[a-zA-Zа-яА-Я\d]{3,7}$/.test(username))) {
            errors.username = "must start with alphabet character, contains alphaber or numeric, length >= 3 and <=7";
        }

        if (!(/^(?=.*\d)(?=.*[a-zA-Z]).{6,12}$/.test(password))) {
            errors.password = "must have at least one digit and one character, lenth >= 6 and <= 12";
        }

        console.log(errors);
        return !_.isEmpty(errors) && errors;
    }

    app.post('/auth', function(req, res, next) {
        var errors = validateAuth(req.body.username, req.body.password, req.body.name);
        if (errors) {
            req.flash('errors', errors);
            res.redirect('/login');
        } else {
            passport.authenticate('local', function(err, user, info) {
                if (err) { return next(err); }
                if (!user) {
                    var userData = _.extend({}, req.body);
                    var nameValid = /^[a-zA-Zа-яА-Я\s]{1,32}$/.test(req.body.name);
                    if (req.body.name && nameValid) {
                        UserUtils.createUser(
                            req.body.username, req.body.password,
                            function(err, inserted) {
                                if (err) {
                                    return next(err);
                                } else {
                                    req.flash('message', "Registration success! Please use new credentials to login");
                                    return res.redirect('/login');
                                }
                            }, userData)
                    } else {

                        info.errors = info.errors || {};

                        if (req.body.name && !nameValid) {
                            info.errors.name = "Field have incorrect value";
                        } else if (!req.body.name) {
                            info.errors.name = "Field is required for registration!";
                        }
                        req.flash('errors', info.errors);
                        return res.redirect('/login');
                    }
                } else {
                    req.logIn(user, function(err) {
                        if (err) {return next(err);}
                        if (req.body.name) {
                            user.name = req.body.name;
                            req.user.name = user.name;
                            user.save(function(err, saved) {
                                //ищем во всех сущностях, где встречается данный пользователь и изменяем его данные (пока только имя)
                                if (!err) {
                                    var Profile = mongoose.model('Profile');

                                    Profile.findOne({userId: user._id}, function(err, meProfile) {
                                        //При обновлении имени корневого пользователя нужно обновить 
                                        //модель профиля один к одному
                                        if (!err && meProfile) {
                                            meProfile.name = saved.name;
                                            meProfile.save();
                                        }
                                    })
                                    
                                    Profile.find({'friends.userId': user._id}, function(err, profileFriends) {
                                        if (!err && profileFriends) {
                                            profileFriends.forEach(function(f, idx) {
                                                var subMe = _.where(f.friends, {userId: user._id})[0];
                                                if (subMe) {
                                                    subMe.name = user.name;

                                                    profileFriends[idx].save();
                                                }
    
                                            })
                                        }
                                    })
                                    return res.redirect('/');
                                }
                            })
                        } else {
                            return res.redirect('/');
                        }
                    })
                }
                    
            })(req, res, next)
        }
    })
}