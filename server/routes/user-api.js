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

	return router;
}