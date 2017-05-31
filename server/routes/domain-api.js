var express = require('express');
var _ = require('lodash');

const fs = require("fs")
const messages = JSON.parse(fs.readFileSync(__dirname + "/data.json", "utf-8")).messages

module.exports.Router = function (DomainDB) {
	var router = express.Router();

	router.get('/', (req, res, next) => {
		DomainDB.getDomains(1).then(rows => {
			res.json(rows)
		}).catch(next)

		// let domains = []
		// messages.forEach(msg => {
		// 	domains.push(msg.domainName)
		// })
		// res.json(domains)
	});

	return router;
}

