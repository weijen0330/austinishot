var express = require('express');           //sub-routers 
var request = require('request');           //request URLs
var htmlparser = require('htmlparser2');    //parse html

module.exports.Router = function (Database) {
	var router = express.Router();

	router.post('/linkdata', (req, res, next) => {
		var parser = htmlparser.WritableStream({
			onopentag: function (name, attrs) {
				if (name === 'meta') {
					console.log(attrs);
				}
			}			
		}, {decodeEntities: true});

		request.get(req.body.url, {followRedirect: false})

			.on('error', () => {
				console.log('error');
			})
			.on('end', () => {
				console.log('ended');
			})
			.pipe(parser)
	});

	return router;
}