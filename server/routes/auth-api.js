var express = require('express');
var _ = require('lodash');


// put stuff here

module.exports.Router = function () {
	var router = express.Router();

    router.get('/slack', (req, res, next) => {        
        // talk to slack here

        res.send("turned on slack")
    });

	return router;
}