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

module.exports.Router = function (MessageDB) {
	var router = express.Router();

	// get all new messages
	// grt

	// // new message
	// router.post('/', (req, res, next) => {
	// 	var url = req.body.url,
	// 		inTitleElem = false,
	// 		inImgElem = false;

	// 	req.body.domain = Url.parse(url).hostname;
	// 	req.body.senderId = req.user.id;

	// 	var parser = new htmlparser.WritableStream({
	// 		onopentag: function (name, attrs) {
	// 			if (name === 'title') {
	// 				inTitleElem = true;
	// 			}

	// 			if (name === 'img') {
	// 				if (attrs.src) {
	// 					req.body.imgUrl = req.body.imgUrl ? req.body.imgUrl : attrs.src;
	// 				}
	// 			}

	// 			if (name === 'meta') {
	// 				var prop = attrs.property,
	// 					nameAttr = attrs.name;
	// 				if (prop) {
	// 					switch(prop) {
	// 						case 'og:image': 
	// 							req.body.imgUrl = attrs.content;
	// 							break;

	// 						case 'og:title': 
	// 							req.body.title = attrs.content;
	// 							break;

	// 						case 'og:description':
	// 							req.body.description = attrs.content;
	// 							break;							
	// 					}
	// 				}

	// 				if (nameAttr) {
	// 					switch(nameAttr) {
	// 						case 'description':
	// 							req.body.description = req.body.description ? req.body.description : attrs.content;
	// 					}
	// 				}

	// 			}
	// 		},

	// 		ontext: function (text) {
	// 			if (inTitleElem) {
	// 				if (!req.body.title) {
	// 					req.body.title = text;
	// 				}
	// 			}
	// 		},

	// 		onclosetag: function () {
	// 			inTitleElem = false;
	// 		}

	// 	}, {decodeEntities: true});

	// 	request.get(url, {followRedirect: false})
	// 		.on('error', function () {
	// 			console.error('error requesting page ' + url);
	// 		})
	// 		.on('end', function () {
	// 			MessageDB.newMessage(req.body)
	// 				.then(rows => res.json(rows));
				
	// 		})
	// 		.pipe(parser);
	// });

	// router.get('/', (req, res, next) => {
	// 	MessageDB.getMessages(req.user.id) 
	// 		.then(rows => {
	// 			res.json(mergeOnCategory(rows))
	// 		})
	// 		.catch(next);
	// });

	// router.get('/sent', (req, res, next) => {
	// 	MessageDB.getSentMessages(req.user.id)
	// 		.then(rows => res.json(mergeOnCategory(rows)))
	// 		.catch(next);
	// });	

	// router.get('/received', (req, res, next) => {
	// 	MessageDB.getRecievedMessages(req.user.id)
	// 		.then(rows => res.json(mergeOnCategory(rows)))
	// 		.catch(next);
	// });	

	// router.get('/starred', (req, res, next) => {
	// 	MessageDB.getStarredMessages(req.user.id)
	// 		.then(rows => {
				
	// 			res.json(mergeOnCategory(rows))
	// 		})
	// 		.catch(next);
	// })

	// router.get('/favorite/:messageId', (req, res, next) => {
	// 	var messageId = req.params.messageId;
	// 	MessageDB.favoriteMessage(messageId)
	// 		.then(() => res.json(messageId));
	// });

	// router.get('/delete/:messageId', (req, res, next) => {
	// 	var messageId = req.params.messageId;
	// 	MessageDB.markDeleted(messageId)
	// 		.then(() => res.json(messageId));
	// })

	router.get('/new', (req, res, next) => {
		// MessageDB.getUnreadMessages(req.user.user_id)
		res.send("getting all new messages")
	})

	router.get('/old', (req, res, next) => {
		// MessageDB.getReadMessages(req.user.user_id)
		res.send("getting all old messages")
	})

	router.get('/tag/:tag', (req, red, next) => {
		const tag = req.params.tag
		const userId = req.user.user_id
		// MessageDB.getMessagesWithTag(userId, tag)
		res.send("getting messages with tag: " + tag)
	})

	router.get('/new/type/:type', (req, res, next) => {
		const type = req.params.type
		const userId = req.user.user_id
		// MessageDB.getNewMessagesWithType(userId, type)
		res.send("getting new messages of type: " + type)
	})

	router.get('/old/type/:type', (req, res, next) => {
		const type = req.params.type
		const userId = req.user.user_id
		// MessageDB.getOldMessagesWithType(userId, type)
		res.send("getting old messages of type: " + type)
	})

	router.get('/domain/:domain', (req, red, next) => {
		const domain = req.params.domain
		const userId = req.user.user_id
		// MessageDb.getMessagesWithDomain(userId, domain)
		res.send("getting messages with domain: " + domain)
	})

	router.patch('/:messageId', (req, res, next) => {
		const messageId = req.params.messageId
		// MessageDb.markRead(messageId)
		res.send("marking message with id: " + messageId + " as read")
	})
	

	return router;
}
