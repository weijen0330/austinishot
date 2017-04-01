var MessageDB = {
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
					// 'sender.displayName AS senderName, ' +
					'sender.firstName AS senderFirstName, ' +
					'sender.lastName AS senderLastName, ' +
					
					'sender.imgUrl AS senderImg, ' +
					'c.name AS categoryName ' +
				'FROM message m ' + 
				'JOIN link l on m.linkId = l.id ' + 
				'JOIN user sender on m.senderId = sender.id ' +
				'JOIN message_category mc on mc.messageId = m.id ' + 
				'JOIN category c on mc.categoryId = c.id ' +  
				'WHERE (m.senderId = :id OR m.recipientId = :id) ' +
					'AND m.deleted = 0 ' +
				'ORDER BY timeSent DESC'
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
					// 'sender.displayName AS senderName, ' +
					'sender.firstName AS senderFirstName, ' +
					'sender.lastName AS senderLastName, ' +

					'sender.imgUrl AS senderImg, ' +
					'c.name AS categoryName ' +
				'FROM message m ' + 
				'JOIN link l on m.linkId = l.id ' + 
				'JOIN user sender on m.senderId = sender.id ' + 
				'JOIN message_category mc on mc.messageId = m.id ' + 
				'JOIN category c on mc.categoryId = c.id ' + 
				'WHERE senderId = :id ' +
					'AND m.deleted = 0 ' +
				'ORDER BY timeSent DESC'	
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
					// 'sender.displayName AS senderName, ' +
					'sender.firstName AS senderFirstName, ' +
					'sender.lastName AS senderLastName, ' +

					'sender.imgUrl AS senderImg, ' +
					'c.name AS categoryName ' +
				'FROM message m ' + 
				'JOIN link l on m.linkId = l.id ' + 
				'JOIN user sender on m.senderId = sender.id ' + 
				'JOIN message_category mc on mc.messageId = m.id ' + 
				'JOIN category c on mc.categoryId = c.id ' + 
				'WHERE m.recipientId = :id ' +
					'AND m.deleted = 0 ' +
				'ORDER BY timeSent DESC'  
			),
			{
				id: userId
			}
		);
	},	

	getStarredMessages(userId) {
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
					// 'sender.displayName AS senderName, ' +
					'sender.firstName AS senderFirstName, ' +
					'sender.lastName AS senderLastName, ' +
					
					'sender.imgUrl AS senderImg, ' +
					'c.name AS categoryName ' +
				'FROM message m ' + 
				'JOIN link l on m.linkId = l.id ' + 
				'JOIN user sender on m.senderId = sender.id ' +
				'JOIN message_category mc on mc.messageId = m.id ' + 
				'JOIN category c on mc.categoryId = c.id ' +  
				'WHERE (m.senderId = :id OR m.recipientId = :id) ' + 
					'AND m.favorited = 1 ' +
					'AND m.deleted = 0 ' +
				'ORDER BY timeSent DESC'
			),
			{
				id: userId
			}
		);
	},

	favoriteMessage(messageId) {
		var hello, goodbye;
		return this._connection
			.queryAsync(
				'UPDATE message SET favorited = NOT favorited WHERE id = :id', 
				{id: messageId}
			);
	},

	markDeleted(messageId) {
		return this._connection
			.queryAsync(
				'UPDATE message SET deleted = 1 WHERE id = :id',
				{id: messageId}
			);
	},

	newMessage(data) {
		//data =>senderId, url, recipientEmail, note, imgUrl, title, domain, description
		var recipientId,
			checkLink = this._connection.queryAsync('SELECT id FROM link WHERE url = :url', {url: data.url}),
			getRecipient = this._connection.queryAsync('SELECT id FROM user WHERE email = :email', {email: data.recipientEmail});

		return Promise.all([checkLink, getRecipient])
			.then(values => {
				recipientId = values[1][0].id;

				var link = values[0];

				if (link && link.length > 0) {
					return this._connection.queryAsync(
						'INSERT INTO message (linkId, senderId, recipientId, note) ' +
						'VALUES (:linkId, :senderId, :recipientId, :note)',
						{
							linkId: link[0].id,
							senderId: data.senderId,
							recipientId: recipientId,
							note: data.note	
						})						
				} else {
					return this._connection.queryAsync(
						'SELECT id FROM domain WHERE name = :name', 
						{name: data.domain})
						.then(domainRows => {				
							if (domainRows && domainRows.length > 0) {								
								return domainRows[0].id;
							} else {
								return this._connection.queryAsync(
									'INSERT INTO domain (name) VALUES (:name)',
									{name: data.domain})	
									.then(insertData => {
										return insertData.info.insertId;
									})
							}
						})
						.then(domainId => {											
							return this._connection.queryAsync(
								'INSERT INTO link (domainId, url, title, description, imgUrl) ' + 
								'VALUES (:domainId, :url, :title, :description, :imgUrl)',
								{
									domainId: domainId,
									url: data.url,
									title: data.title,
									description: data.description,
									imgUrl: data.imgUrl
								})
						})
						.then(insertData => {
							var linkId = insertData.info.insertId;							
							return this._connection.queryAsync(
								'INSERT INTO message (linkId, senderId, recipientId, note) ' +
								'VALUES (:linkId, :senderId, :recipientId, :note)',
								{
									linkId: linkId,
									senderId: data.senderId,
									recipientId: recipientId,
									note: data.note
								})								
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
	var messageDB = Object.create(MessageDB);
	messageDB._connection = connection;
	return messageDB;
}