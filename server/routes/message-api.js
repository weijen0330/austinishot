var express = require('express');
var _ = require('lodash');
var request = require('request');
var htmlparser = require('htmlparser2');
var Url = require('url');

function mergeOnCategory(rows) {
	var arr = [],
		obj = {},					
		category;

	_.forEach(rows, (row, i) => {
		category = row.categoryName;
		
		if (_.isNil(obj[row.id])) {	
			row.categoryName = [];
			arr.push(row);
			obj[row.id] = arr.length - 1;
		}
		
		arr[obj[row.id]].categoryName.push(category);

	});
	
	return arr;
}

const fs = require("fs")
const messages = JSON.parse(fs.readFileSync(__dirname + "/data.json", "utf-8")).messages

module.exports.Router = function (MessageDB) {
	var router = express.Router();
	
	router.post("/search", (req, res, next) => {		
		MessageDB.searchMessages(req.body).then(filteredMessages => {
			res.json(filteredMessages)
		})
	})

	router.get('/new', (req, res, next) => {
		MessageDB.getUnreadMessages(1).then(messages => {
			res.json(messages);
		}).catch(next)		
	})

	router.get('/old', (req, res, next) => {
		MessageDB.getReadMessages(1).then(messages => {
			res.json(messages)
		}).catch(next)
	})

	router.patch('/read/:messageId', (req, res, next) => {
		const messageId = req.params.messageId
		MessageDB.markRead(messageId).then(() => {
			res.send("marking message with id: " + messageId + " as read")
		})		
	})

	router.patch("/unread/:messageId", (req, res, next) => {
		const messageId = req.params.messageId
		MessageDB.markUnRead(messageId).then(() => {
			res.send("marking message with id: " + messageId + " as unread")	
		})		
	})

	router.delete("/:messageId", (req, res, next) => {
		const messageId = req.params.messageId
		MessageDB.markDeleted(messageId).then(() => {
			res.send("marking message with id: " + messageId + " as deleted")
		}).catch(next)	
	})


	return router;
}
