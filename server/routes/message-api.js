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

	// new message
	router.post('/', (req, res, next) => {
		var url = req.body.url,
			inTitleElem = false,
			inImgElem = false;

		req.body.domain = Url.parse(url).hostname;
		req.body.senderId = req.user.id;

		var parser = new htmlparser.WritableStream({
			onopentag: function (name, attrs) {
				if (name === 'title') {
					inTitleElem = true;
				}

				if (name === 'img') {
					if (attrs.src) {
						req.body.imgUrl = req.body.imgUrl ? req.body.imgUrl : attrs.src;
					}
				}

				if (name === 'meta') {
					var prop = attrs.property,
						nameAttr = attrs.name;
					if (prop) {
						switch(prop) {
							case 'og:image': 
								req.body.imgUrl = attrs.content;
								break;

							case 'og:title': 
								req.body.title = attrs.content;
								break;

							case 'og:description':
								req.body.description = attrs.content;
								break;							
						}
					}

					if (nameAttr) {
						switch(nameAttr) {
							case 'description':
								req.body.description = req.body.description ? req.body.description : attrs.content;
						}
					}

				}
			},

			ontext: function (text) {
				if (inTitleElem) {
					if (!req.body.title) {
						req.body.title = text;
					}
				}
			},

			onclosetag: function () {
				inTitleElem = false;
			}

		}, {decodeEntities: true});

		request.get(url, {followRedirect: false})
			.on('error', function () {
				console.error('error requesting page ' + url);
			})
			.on('end', function () {
				MessageDB.newMessage(req.body)
					.then(rows => res.json(rows));
				
			})
			.pipe(parser);
	});

	router.get('/', (req, res, next) => {
		MessageDB.getMessages(req.user.id) 
			.then(rows => {
				res.json(mergeOnCategory(rows))
			})
			.catch(next);
	});

	router.get('/sent', (req, res, next) => {
		MessageDB.getSentMessages(req.user.id)
			.then(rows => res.json(mergeOnCategory(rows)))
			.catch(next);
	});	

	router.get('/received', (req, res, next) => {
		MessageDB.getRecievedMessages(req.user.id)
			.then(rows => res.json(mergeOnCategory(rows)))
			.catch(next);
	});	

	router.get('/starred', (req, res, next) => {
		MessageDB.getStarredMessages(req.user.id)
			.then(rows => {
				
				res.json(mergeOnCategory(rows))
			})
			.catch(next);
	})

	router.get('/favorite/:messageId', (req, res, next) => {
		var messageId = req.params.messageId;
		MessageDB.favoriteMessage(messageId)
			.then(() => res.json(messageId));
	});

	router.get('/delete/:messageId', (req, res, next) => {
		var messageId = req.params.messageId;
		MessageDB.markDeleted(messageId)
			.then(() => res.json(messageId));
	})

	

	return router;
}
