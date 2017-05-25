var express = require('express');
var _ = require('lodash');


// put stuff here

module.exports.Router = function () {
	var router = express.Router();

    router.get('/slack', (req, res, next) => {        
        // authorrize slack

        res.send("turned on slack")
    });

    router.get('/facebook', (req, res, next) => {
        // authorize facebook
        res.send("turned on facebook")
    });

    router.get('/gmail', (req, res, next) => {
        res.send("turned on gmail")
    })

	return router;
}