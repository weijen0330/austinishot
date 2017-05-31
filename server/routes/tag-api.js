var express = require('express');
var _ = require('lodash');

const fs = require("fs")
const messages = JSON.parse(fs.readFileSync(__dirname + "/data.json", "utf-8")).messages

module.exports.Router = function (TagDB) {
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
		TagDB.getTags().then(rows => {
			console.log(rows)
		})

		let tags = []
		messages.forEach(msg => {
			tags = tags.concat(msg.tags)
		})
		res.json(tags)
	});	

	return router;
}