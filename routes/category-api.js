var express = require('express');
var _ = require('lodash');

module.exports.Router = function (CategoryDB) {
	var router = express.Router();

	/*
	delete specific category 
	app.delete('/:cat', function (req, res, next) {
		req.params.cat <- get the param passes in
	});

	get messages with specific category?
	app.get('/:cat/mesages', function (req, res, next) {
		req.params.cat
	})

	get messages but execute specific query
	app.get('/messages?query=jsdhfs', function req, res, next) {
		req.query.query <- getting the query
	});
	 */


	router.get('/', (req, res, next) => {
		CategoryDB.getCategories(req.user.id)
			.then(rows => res.json(_.map(rows, 'name')))
			.catch(next);
	});	

	router.get('/:messageId', (req, res, next) => {
		CategoryDB.getCategoriesByMessageId(req.params.messageId)
		.then(rows => res.json(_.map(rows, 'name')))
		.catch(next);
	});

	return router;
}