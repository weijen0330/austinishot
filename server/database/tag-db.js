var TagDB = {
	getTags(userId) {
		return this._getObjects(
			(
				'SELECT DISTINCT t.tag_text AD tag FROM TAGS t ' +
				'JOIN USER_TAGS ut ON t.tag_id = ut.tag_id ' +
				'WHERE ur.user_id = :userId'
			),
			{
				userId: userId
			}
		)
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
	var tagDB = Object.create(TagDB);
	tagDB._connection = connection;
	return tagDB;
}
