var Database = {
	// Given a username, returns a promise containing that user's info from db
	// If username does not exist in db, returns a promise containing null
	getUserByEmail(email) { //singleton!
		return this._getSingleObject(
			(
				'SELECT * FROM USERS ' + 
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
				'SELECT * FROM USERS u ' + 
				'WHERE u.user_id = :id'
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
	getTags(userId) {
		return this._getObjects(
			(
				'SELECT DISTINCT t.tag_text FROM TAGS t ' + 
				'JOIN LINKS_TAGS lt ON t.tag_id = lt.tag_id ' +
				'JOIN LINKS l ON lt.link_id = l.link_id' +
				'JOIN MESSAGE m ON l.link_id = m.link)id ' + 
				'WHERE m.sender_id = :id OR m.recipient_id = :id'
			),
			{
				id: userId
			}
		);
	},

	// Given a messageId, returns a promise containing the categories that 
	// belong to a message with that message id. 
	// getCategoriesByMessageId(messageId) {
	// 	return this._getObjects(
	// 		(
	// 			'SELECT DISTINCT c.name FROM message m ' + 
	// 			'JOIN message_category mc ON m.id = mc.messageId ' + 
	// 			'JOIN category c ON mc.categoryId = c.id ' + 
	// 			'WHERE m.id = :id'
	// 		),
	// 		{
	// 			id: messageId
	// 		}
	// 	)
	// },

	// Given a userId, returns a promise containing the domains that have
	// appeared in messages that user has sent/received
	// If userId does not exist in db or no domains have been found in relation
	// to that user, returns a promise containing null
	// getDomains(userId) {
	// 	return this._getObjects(
	// 		(
	// 			'SELECT DISTINCT d.name FROM domain d ' + 
	// 			'JOIN link l ON d.id = l.domainId ' +
	// 			'JOIN message m ON l.id = m.linkId ' +
	// 			'WHERE m.senderId = :id OR m.recipientId = :id'
	// 		), 
	// 		{
	// 			id: userId
	// 		}
	// 	);
	// },

	// Given a userId, returns a promise containing all users that have send
	// or received a message from the authenticated user
	// If userId does not exist in db or no 'friends' have been found, returns
	// a promise containing null
	getFriends(userId) {
		return this._getObjects(
			(
				'SELECT DISTINCT u.user_id, u.first_name, u.last_name FROM USERS u ' + 
				'JOIN MESSAGES m1 ON u.id = m1.recipient_id ' + 
				'JOIN MESSAGES m2 ON u.id = m2.sender_id ' +
				'WHERE m1.sender_id = :id AND m2.recipient_id = :id'
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
					'm.message_id, ' +
					'm.link_id, ' +
					'm.note, ' +
					'UNIX_TIMESTAMP(m.timeSent) AS timeSent, ' +
					'm.isRead, ' + 
					'm.favorited, ' +
					'l.url, ' + 
					'l.title, ' + 
					'l.description, ' + 
					'sender.email AS senderEmail, ' + 
					'sender.displayName AS senderName, ' +
				'FROM message m ' + 
				'JOIN link l on m.link_id = l.link_id ' + 
				'JOIN USERS sender on m.sender_id = sender.user_id ' + 
				'WHERE m.sender_id = :id OR m.recipient_id = :id'
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
					'm.message_id, ' +
					'm.link_id, ' +
					'm.note, ' +
					'UNIX_TIMESTAMP(m.timeSent) AS timeSent, ' +
					'm.isRead, ' + 
					'm.favorited, ' +
					'l.url, ' + 
					'l.title, ' + 
					'l.description, ' + 
					'sender.email AS senderEmail, ' + 
					'sender.displayName AS senderName, ' +
					'sender.imgUrl AS senderImg ' +
				'FROM message m ' + 
				'JOIN link l on m.link_id = l.link_id ' + 
				'JOIN USERS sender on m.sender_id = sender.user_id ' + 
				'WHERE m.recipient_id = :id'
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
					'm.message_id, ' +
					'm.link_id, ' +
					'm.note, ' +
					'UNIX_TIMESTAMP(m.timeSent) AS timeSent, ' +
					'm.isRead, ' + 
					'm.favorited, ' +
					'l.url, ' + 
					'l.title, ' + 
					'l.description, ' + 
					'sender.email AS senderEmail, ' + 
					'sender.displayName AS senderName, ' +
					'sender.imgUrl AS senderImg ' +
				'FROM message m ' + 
				'JOIN link l on m.link_id = l.link_id ' + 
				'JOIN USERS sender on m.sender_id = sender.user_id ' + 
				'WHERE m.sender_id = :id'	
			),
			{
				id: userId
			}
		);
	},

	favoriteMessage(messageId) {
		return this._connection
			.queryAsync(
				'UPDATE message SET favorited = NOT favorited WHERE message_id = :id', 
				{id: messageId}
			);
	},


	// if user already exists -> promise resolves with null
	// if not
	addUser(first_name, last_name, email, passwordHash) {	
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
								'INSERT INTO user (first_name, last_name, email, passwordHash) ' + 
								'VALUES (:first_name, :last_name, :email, :passwordHash)'
							), 
							{
								first_name: first_name,
								last_name: last_name,
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

	// // check this
	// getDomain(domainName) {
	// 	// if domainName already exists, return id
	// 	// else add that domain name.
	// 	var _this = this;
		
	// 	return _this._connection
	// 		.queryAsync(
	// 			(
	// 				'SELECT id FROM domain ' +
	// 				'WHERE name LIKE :name ' + 
	// 				'LIMIT 1'
	// 			),
	// 			{
	// 				name: domainName
	// 			}
	// 		)
	// 		.then(rows => {
	// 			if (rows && rows.length) {
	// 				return rows[0].id;
	// 			} else {
	// 				return _this._connection
	// 					.queryAsync(
	// 						(
	// 							'INSERT INTO domain (name) ' +
	// 							'VALUES (:name)'  
	// 						),
	// 						{
	// 							name: domainName
	// 						}
	// 					)
	// 					.then(() => {
	// 						return _this._connection.lastInsertId()
	// 					});
	// 			}
	// 		});	
	// },

	getTag(tagName) {
		var _this = this;

		return _this._connection
			.queryAsync(
				(
					'SELECT tag_id FROM TAG ' + 
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
								'INSERT INTO TAG (tag_text)' + 
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
	var database = Object.create(Database);
	database._connection = connection;
	return database;
}