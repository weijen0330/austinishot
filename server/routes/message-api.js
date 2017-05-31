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

	router.get('/new', (req, res, next) => {
		MessageDB.getUnreadMessages(1).then(messages => {
			res.json(messages);
		}).catch(next)

		// const newMsgs = messages.filter(msg => {
		// 	return !msg.isRead
		// })
		// res.json(newMsgs)		
	})

	router.get('/old', (req, res, next) => {
		MessageDB.getReadMessages(1).then(messages => {
			res.json(messages)
		}).catch(next)

		// const oldMsgs = messages.filter(msg => {
		// 	return msg.isRead
		// })
		// res.json(oldMsgs)
	})

	router.get('/tag/:tag', (req, res, next) => {
		const tag = req.params.tag
		// const userId = req.user.user_id
		// MessageDB.getMessagesWithTag(userId, tag)

		const msgs = messages.filter(msg => {
			return msg.tags.includes(tag)
		})
		res.json(msgs)
	})

	router.get('/new/type/:type', (req, res, next) => {
		const type = req.params.type
		// const userId = req.user.user_id
		// MessageDB.getNewMessagesWithType(userId, type)

		const msgs = messages.filter(msg => {
			return (msg.type == type) && !msg.isRead
		})
		res.json(msgs)
	})

	router.get('/old/type/:type', (req, res, next) => {
		const type = req.params.type
		// const userId = req.user.user_id
		// MessageDB.getOldMessagesWithType(userId, type)
		
		const msgs = messages.filter(msg => {
			return (msg.type == type) && msg.isRead
		})
		res.json(msgs)
	})

	router.get('/domain/:domain', (req, res, next) => {
		const domain = req.params.domain
		// const userId = req.user.user_id
		// MessageDb.getMessagesWithDomain(userId, domain)
		
		const msgs = messages.filter(msg => {
			return msg.domainName == domain
		})
		res.json(msgs)
	})

	// router.patch('read/:messageId', (req, res, next) => {
	// 	const messageId = req.params.messageId
	// 	MessageDb.markRead(messageId).then(() => {
	// 		res.send("marking message with id: " + messageId + " as read")
	// 	})		
	// })

	router.get('unread/:messageId', (req, res, next) => {
		const messageId = req.params.messageId
		MessageDb.markUnRead(messageId).then(() => {
			res.send("marking message with id: " + messageId + " as unread")	
		})		
	})

	router.delete("/:messageId", (req, res, next) => {
		const messageId = req.params.messageId
		MessageDB.markDeleted(messageId).then(() => {
			res.send("marking message with id: " + messageId + " as deleted")
		}).catch(next)	
	})

	router.post('/search', (req, res, next) => {
		console.log(req.body)
		res.json(req.body)
	})
	

	return router;
}
