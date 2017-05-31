var dbConfig = require(__base + 'secret/config-db.json');
var MariaSql = require('mariasql');
var bluebird = require('bluebird');

var TagDB = {
	getTags() {	
		const connection = bluebird.promisifyAll(new MariaSql(dbConfig));	
		const query = (
			'SELECT DISTINCT t.tag_text AS tag FROM TAGS t ' +
			'JOIN USER_TAGS ut ON t.tag_id = ut.tag_id ' +
			'WHERE ut.user_id = :userId'
		)
		return connection.queryAsync(query, {userId: 1}, {useArray: true}).then(rows => {
			connection.end()
			return rows.map(row => row[0])			
		})
	},

	addTags(messageId, tags) {
		const connection = bluebird.promisifyAll(new MariaSql(dbConfig));	
		
	}
}

module.exports = function (connection) {
	var tagDB = Object.create(TagDB);
	tagDB._connection = connection;
	return tagDB;
}
