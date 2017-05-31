var dbConfig = require(__base + 'secret/config-db.json');
var MariaSql = require('mariasql');
var bluebird = require('bluebird');

var DomainDB = {
	// Given a userId, returns a promise containing the domains that have
	// appeared in messages that user has sent/received
	// If userId does not exist in db or no domains have been found in relation
	// to that user, returns a promise containing null
	getDomains(userId) {
		const connection = bluebird.promisifyAll(new MariaSql(dbConfig));
		const query = (
			'SELECT DISTINCT d.domain_name AS domain FROM DOMAIN d ' +
			'JOIN USER_DOMAINS ud ON d.domain_id = ud.domain_id ' + 
			'WHERE ud.user_id = :userId'
		)
		return connection.queryAsync(query, {userId: 1}, {useArray: true}).then(rows => {
			connection.end()
			return rows.map(row => row[0])			
		})
	}
}

module.exports = function (connection) {
	var domainDB = Object.create(DomainDB);
	domainDB._connection = connection;
	return domainDB;
}