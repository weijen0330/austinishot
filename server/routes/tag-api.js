var express = require('express');
var _ = require('lodash');

const fs = require("fs")
const messages = JSON.parse(fs.readFileSync(__dirname + "/data.json", "utf-8")).messages

module.exports.Router = function (TagDB) {
	var router = express.Router();

	router.get('/', (req, res, next) => {
		TagDB.getTags().then(rows => {
			res.json(rows)
		})
	});	

	// adds tags to message
	router.post('/:messageId', (req, res, next) => {
		const messageId = req.params.messageId
		const tags = req.body.tags

		if (tags && tags.length) {
			TagDB.addTags(messageId, tags).then(() => {
				res.send("done adding")
			}).catch(next)
		} else {
			res.send("no tags to add")
		}
	})

	return router;
}