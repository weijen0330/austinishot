var Database = {
	// Given a username, returns a promise containing that user's info from db
	// If username does not exist in db, returns a promise containing null
	getUserByEmail(email) { //singleton!
		return this._getSingleObject(
			(
				'SELECT * FROM user ' + 
				'WHERE email = :email'
			), 
			{
				email: email
			}
		);
	},

	// Given a userId, returns a promise containing that user's info from the db
	// If userId does not exist in db, returns a promise containing null
	getUserById(userId) { //singleton!
		return this._getSingleObject(
			(
				'SELECT * FROM user u ' + 
				'WHERE u.id = :id'
			), 
			{
				id: userId
			}
		);
	},

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

	// Given a userId, returns a promise containing all users that have send
	// or received a message from the authenticated user
	// If userId does not exist in db or no 'friends' have been found, returns
	// a promise containing null
	getFriends(userId) {
		return this._getObjects(
			(
				'SELECT DISTINCT u.id, u.displayName, u.imgUrl FROM user u ' + 
				'JOIN message m1 ON u.id = m1.recipientId ' + 
				'JOIN message m2 ON u.id = m2.senderId ' +
				'WHERE m1.senderId = :id AND m2.recipientId = :id'
			),
			{
				id: userId
			}
		);
	},

	getMessages(userId) {
		return this._getObjects(
			(
				'SELECT ' + 
					'm.id, ' +
					'm.linkId, ' +
					'm.note, ' +
					'UNIX_TIMESTAMP(m.timeSent) AS timeSent, ' +
					'm.isRead, ' + 
					'm.favorited, ' +
					'l.url, ' + 
					'l.title, ' + 
					'l.description, ' + 
					'l.imgUrl, ' + 
					'sender.email AS senderEmail, ' + 
					'sender.displayName AS senderName, ' +
					'sender.imgUrl AS senderImg ' +
				'FROM message m ' + 
				'JOIN link l on m.linkId = l.id ' + 
				'JOIN user sender on m.senderId = sender.id ' + 
				'WHERE m.senderId = :id OR m.recipientId = :id'
			),
			{
				id: userId
			}
		);
	},

	// Given a userId, returns a promise containing all messages the user has received
	// If userId does not exist in db or no messages have been found in relation
	// to the user, returns a promise containing null
	getRecievedMessages(userId) {
		return this._getObjects(
			(
				'SELECT ' + 
					'm.id, ' +
					'm.linkId, ' +
					'm.note, ' +
					'UNIX_TIMESTAMP(m.timeSent) AS timeSent, ' +
					'm.isRead, ' + 
					'm.favorited, ' +
					'l.url, ' + 
					'l.title, ' + 
					'l.description, ' + 
					'l.imgUrl, ' + 
					'sender.email AS senderEmail, ' + 
					'sender.displayName AS senderName, ' +
					'sender.imgUrl AS senderImg ' +
				'FROM message m ' + 
				'JOIN link l on m.linkId = l.id ' + 
				'JOIN user sender on m.senderId = sender.id ' + 
				'WHERE m.recipientId = :id' 
			),
			{
				id: userId
			}
		);
	},


	// Given a userId, returns a promise containing all messages the user has received
	// If userId does not exist in db or no messages have been found in relation
	// to the user, returns a promise containing null
	getSentMessages(userId) {
		return this._getObjects(
			(
				'SELECT ' + 
					'm.id, ' +
					'm.linkId, ' +
					'm.note, ' +
					'UNIX_TIMESTAMP(m.timeSent) AS timeSent, ' +
					'm.isRead, ' + 
					'm.favorited, ' +
					'l.url, ' + 
					'l.title, ' + 
					'l.description, ' + 
					'l.imgUrl, ' + 
					'sender.email AS senderEmail, ' + 
					'sender.displayName AS senderName, ' +
					'sender.imgUrl AS senderImg ' +
				'FROM message m ' + 
				'JOIN link l on m.linkId = l.id ' + 
				'JOIN user sender on m.recipientId = sender.id ' + 
				'WHERE senderId = :id'	
			),
			{
				id: userId
			}
		);
	},

	favoriteMessage(messageId) {
		return this._connection
			.queryAsync(
				'UPDATE message SET favorited = NOT favorited WHERE id = :id', 
				{id: messageId}
			);
	},


	// if user already exists -> promise resolves with null
	// if not
	addUser(displayName, email, passwordHash) {	
		var _this = this;
		//see notes
		
		return _this.getUserByEmail(email)
			.then(rows => {
				if (rows) {
					var err = new Error('User already exists');
					err.status = 409;
					return err;
				} else {
					return _this._connection
						.queryAsync(
							(
								'INSERT INTO user (displayName, email, passwordHash) ' + 
								'VALUES (:displayName, :email, :passwordHash)'
							), 
							{
								displayName: displayName,
								email: email,
								passwordHash: passwordHash
							}
						)
						.then(() => {
							return _this.getUserById(_this._connection.lastInsertId())
								.then(rows => {		
									return rows ? rows : new Error('AHHHHHHH!');
								});
						});							
				}
			});
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
	var database = Object.create(Database);
	database._connection = connection;
	return database;
}