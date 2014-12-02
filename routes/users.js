var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/User').User;

module.exports = function(app) {

	var router = express.Router();

	router.get('/current', function(req, res, next) {
		User.findOne({_id: req.user._id}, function(err, user) {
			if (err) return next(err);
			else {
				res.send(user);
			}
		})
	})

	router.get('/', function(req, res, next) {

		var isSearch = req.query.search;

		if (!isSearch) {
			User.find(function(err, orders) {
				if (err) next(err);
				else res.send(orders);
			})
		} else {
			User.find({name: isSearch}, function(err, orders) {
				if (err) next(err);
				else res.send(orders);
			})
		}
	});

	router.get('/:id', function(req, res) {
		User.findOne(req.params.id, function(err, order) {
			if (err) next(err);
			else res.send(order);
		})
	});

	router.post('/', function(req, res, next) {

		req.body.userId = req.user._id;
		req.body.saveTime = Date.now();

		User.insert(req.body, function(err, order) {
			if (err) next(err);
			else res.send(order);
		})
	});

	router.put('/:id', function(req, res, next) {

		if (req.params.id) {
			User.update(req.params.id, {$set: req.body}, function(err, order) {
				if (err) next(err);
				else res.send(order);
			})
		} else {
			res.status(500).send('No id is supplied!');
		}
	});
	
	app.use('/users', router);
};