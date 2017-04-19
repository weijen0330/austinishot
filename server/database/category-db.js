var CategoryDB = {
	// Given a userId, returns a promise containing the categories that have 
	// appeared in messages that user has sent/received
	// If userId does not exist in the db or no categories have been found
	// in relation to that user, returns a promise containing null
	getCategories(userId) {
		return this._getObjects(
			(
				'SELECT DISTINCT c.name FROM category c ' + 
				'JOIN message_category mc ON c.id = mc.categoryId ' +
				'JOIN message m ON mc.messageId = m.id ' + 
				'WHERE m.senderId = :id OR m.recipientId = :id'
			),
			{
				id: userId
			}
		);
	},

	// Given a messageId, returns a promise containing the categories that 
	// belong to a message with that message id. 
	getCategoriesByMessageId(messageId) {
		return this._getObjects(
			(
				'SELECT DISTINCT c.name FROM message m ' + 
				'JOIN message_category mc ON m.id = mc.messageId ' + 
				'JOIN category c ON mc.categoryId = c.id ' + 
				'WHERE m.id = :id'
			),
			{
				id: messageId
			}
		)
	},

	getCategory(categoryName) {
		var _this = this;

		return _this._connection
			.queryAsync(
				(
					'SELECT id FROM category ' + 
					'WHERE name LIKE :name ' + 
					'LIMIT 1'
				),
				{
					name : categoryName
				}
			)
			.then(rows => {
				if (rows && rows.length) {
					return rows[0].id;
				} else {
					return _this._connection
						.queryAsync(
							(
								'INSERT INTO category (name)' + 
								'VALUES (:name)'
							),
							{
								name: categoryName
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
	var categoryDB = Object.create(CategoryDB);
	categoryDB._connection = connection;
	return categoryDB;
}