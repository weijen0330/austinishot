var TagDB = {
	// Given a userId, returns a promise containing the categories that have 
	// appeared in messages that user has sent/received
	// If userId does not exist in the db or no categories have been found
	// in relation to that user, returns a promise containing null
	getTags(userId) {
		return this._getObjects(
			(
				'SELECT DISTINCT t.tag_text FROM TAGS t ' + 
				'JOIN LINKS_TAGS lt ON t.tag_id = lt.tag_id ' +
				'JOIN LINKS l ON lt.link_id = l.link_id ' +
				'JOIN MESSAGE m ON l.link_id = m.link_id ' + 
				'WHERE m.sender_id = :id OR m.recipient_id = :id'
			),
			{
				id: userId
			}
		);
	},

	// Given a messageId, returns a promise containing the categories that 
	// belong to a message with that message id. 
	getTagsByMessageId(messageId) {
		return this._getObjects(
			(
				'SELECT DISTINCT t.tag_text FROM MESSAGE m ' + 
				'JOIN LINKS l ON m.link_id = l.link_id ' +
				'JOIN LINKS_TAGS lt ON l.link_id = lt.link_id ' +
				'JOIN TAGS t ON lt.tag_id = t.tag_id ' +
				'WHERE m.message_id = :id'
			),
			{
				id: messageId
			}
		)
	},

	getTag(tagName) {
		var _this = this;

		return _this._connection
			.queryAsync(
				(
					'SELECT tag_id FROM TAGS ' + 
					'WHERE tag_text LIKE :name ' + 
					'LIMIT 1'
				),
				{
					name : tagName
				}
			)
			.then(rows => {
				if (rows && rows.length) {
					return rows[0].id;
				} else {
					return _this._connection
						.queryAsync(
							(
								'INSERT INTO TAGS (tag_text) ' + 
								'VALUES (:name)'
							),
							{
								name: tagName
							}
						)
						.then(() => {
							return _this._connection.lastInsertId();
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
	var TagDB = Object.create(TagDB);
	TagDB._connection = connection;
	return TagDB;
}