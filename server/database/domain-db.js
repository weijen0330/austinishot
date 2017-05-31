var DomainDB = {
	// Given a userId, returns a promise containing the domains that have
	// appeared in messages that user has sent/received
	// If userId does not exist in db or no domains have been found in relation
	// to that user, returns a promise containing null
	getDomains(userId) {
		const query = (
			'SELECT d.domain_name AS domain FROM DOMAIN d ' +
			'JOIN USER_DOMAINS ud ON d.domain_id = ud.domain_id ' + 
			'WHERE ud.user_id = :userId'
		)
		return this._connection.queryAsync(query, {userId: 1}).then(rows => {
			this._connection.end()
			return rows
		})
		// return this._getObjects(
		// 	(
		// 		'SELECT d.domain_name AS domain FROM DOMAIN d ' +
		// 		'JOIN USER_DOMAINS ud ON d.domain_id = ud.domain_id ' + 
		// 		'WHERE ud.user_id = :userId'
		// 	),
		// 	{
		// 		userId: userId
		// 	}
		// )
	},

	// Given connection, query and params, returns a promise containing query contents
	// If query returns no results, returns a promise containing null
	_getSingleObject(query, params) {
		return this._connection
			.queryAsync(query, {id: params.id || '', email: params.email || ''})
			.then(rows => {
				return rows && rows.length > 0 ? rows[0] : null;
			});
	},

	_getObjects(query, params) {
		return this._connection
			.queryAsync(query, {id: params.id})
			.then(rows => {
				return rows && rows.length > 0 ? rows : null;
			});
	}
}

module.exports = function (connection) {
	var domainDB = Object.create(DomainDB);
	domainDB._connection = connection;
	return domainDB;
}