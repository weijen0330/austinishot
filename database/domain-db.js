var DomainDB = {
	// Given a userId, returns a promise containing the domains that have
	// appeared in messages that user has sent/received
	// If userId does not exist in db or no domains have been found in relation
	// to that user, returns a promise containing null
	getDomains(userId) {
		return this._getObjects(
			(
				'SELECT DISTINCT d.name FROM domain d ' + 
				'JOIN link l ON d.id = l.domainId ' +
				'JOIN message m ON l.id = m.linkId ' +
				'WHERE m.senderId = :id OR m.recipientId = :id'
			), 
			{
				id: userId
			}
		);
	},

	// check this
	getDomain(domainName) {
		// if domainName already exists, return id
		// else add that domain name.
		var _this = this;
		
		return _this._connection
			.queryAsync(
				(
					'SELECT id FROM domain ' +
					'WHERE name LIKE :name ' + 
					'LIMIT 1'
				),
				{
					name: domainName
				}
			)
			.then(rows => {
				if (rows && rows.length) {
					return rows[0].id;
				} else {
					return _this._connection
						.queryAsync(
							(
								'INSERT INTO domain (name) ' +
								'VALUES (:name)'  
							),
							{
								name: domainName
							}
						)
						.then(() => {
							return _this._connection.lastInsertId()
						});
				}
			});	
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