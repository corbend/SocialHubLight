var crypto = require('crypto');
var passport = require('passport');
var userUtils = require('../utils/users').Api;
var mongoose = require('mongoose');
var AuthLocalStrategy = require('passport-local').Strategy;
 
passport.use('local', new AuthLocalStrategy(
    function (username, password, done) {
        
        console.log("authorization!");
        console.log("username=" + username);
        console.log("password=" + password);
        var User = mongoose.model('User');
        User.findOne({username: username}, function(err, user) {
            if (err) done(null, false, {message: 'authorization error!'});
            else {
                //если пользователь найден
                if (user) {
                    userUtils.checkPassword(user, password, done);
                } else {//если пользователь не найден, то создаем нового
                    done(null, null, {});
                }
            }
        })
    }
));
  
passport.serializeUser(function (user, done) {
    console.log(user);
    done(null, JSON.stringify(user));
});
 
passport.deserializeUser(function (data, done) {
    //console.log("deserializeUser", data);
    try {
        done(null, JSON.parse(data));
    } catch (e) {
        done(err)
    }
});

exports.init = function() {}