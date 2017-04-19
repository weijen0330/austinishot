var express = require('express');

module.exports.Router = function (UserDB) {
	var router = express.Router();

	router.get('/me', (req, res) => {		
		res.json({
			firstName: req.user.firstName,
			lastName: req.user.lastName,
			email: req.user.email,
			imgUrl: req.user.imgUrl
		});
	});
	
	router.get('/friends', (req, res, next) => {
		UserDB.getFriends(req.user.id)
			.then(rows => res.json(rows))
			.catch(next);
	});

	return router;
}