var express = require('express');
var _ = require('lodash');

module.exports.Router = function (DomainDB) {
	var router = express.Router();

	router.get('/', (req, res, next) => {
		// DomainDB.getDomains(req.user.id)
		// 	.then(rows => res.json(_.map(rows, 'name')))
		// 	.catch(next);

		res.send("sending all domains the user has sent")
	});

	return router;
}

