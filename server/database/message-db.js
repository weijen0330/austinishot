var MessageDB = {
	getMessages(userId) {
		return this._getObjects(
			(
				'SELECT ' + 
					'm.message_id, ' +
					'm.link_id, ' +
					'm.note, ' +
					'UNIX_TIMESTAMP(m.timeSent) AS timeSent, ' +
					'm.is_read, ' + 
					'l.url, ' + 
					'l.img_url ' +
					'l.title, ' + 
					'l.description, ' + 
					'sender.email AS senderEmail, ' + 
					'sender.first_name AS senderName ' +
				'FROM MESSAGE m ' + 
				'JOIN LINKS l on m.link_id = l.link_id ' + 
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
	getSentMessages(userId) {
		return this._getObjects(
			(
				'SELECT ' + 
					'm.message_id, ' +
					'm.link_id, ' +
					'm.note, ' +
					'UNIX_TIMESTAMP(m.timeSent) AS timeSent, ' +
					'm.is_read, ' + 
					'l.url, ' + 
					'l.img_url ' +
					'l.title, ' + 
					'l.description, ' + 
					'sender.email AS senderEmail, ' + 
					'sender.first_name AS senderName ' +
				'FROM MESSAGE m ' + 
				'JOIN LINKS l on m.link_id = l.link_id ' + 
				'JOIN USERS sender on m.sender_id = sender.user_id ' + 
				'WHERE m.sender_id = :id'	
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
					'l.url, ' + 
					'l.img_url ' +
					'l.title, ' + 
					'l.description, ' + 
					'sender.email AS senderEmail, ' + 
					'sender.first_name AS senderName ' +
				'FROM MESSAGE m ' + 
				'JOIN LINKS l on m.link_id = l.link_id ' + 
				'JOIN USERS sender on m.sender_id = sender.user_id ' + 
				'WHERE m.recipient_id = :id'
			),
			{
				id: userId
			}
		);
	},

	markDeleted(messageId) {
		return this._connection
			.queryAsync(
				'UPDATE MESSAGE SET deleted = 1 WHERE id = :id',
				{id: messageId}
			);
	},

	newMessage(data) {
		//data =>senderId, url, recipientEmail, note, imgUrl, title, domain, description
		var recipientId,
			checkLink = this._connection.queryAsync('SELECT link_id FROM LINKS WHERE url = :url', {url: data.url}),
			getRecipient = this._connection.queryAsync('SELECT user_id FROM USERS WHERE email = :email', {email: data.recipientEmail});

		return Promise.all([checkLink, getRecipient])
			.then(values => {
				recipientId = values[1][0].id;

				var link = values[0];

				if (link && link.length > 0) {
					return this._connection.queryAsync(
						'INSERT INTO MESSAGE (link_id, sender_id, recipient_id, note) ' +
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

/*
	getSearchResults (keyword, platform, direction, type, time, domain, friend, tags)
		return this._getObjects(
			(
				SELECT * FROM MESSAGE m
				JOIN LINKS l ON m.link_id = l.link_id
				JOIN LINKS_TAGS lt ON l.link_id = lt.link_id
				JOIN TAGS t ON lt.tag_id = t.tag_link 
				JOIN DOMAIN d ON l.domain_id = d.domain_id
				JOIN PLATFORM p ON l.platform_id = p.platform_id
				WHERE CONTAINS(m.note, :key)
				AND CONTAINS (t.tag_text, @tags)
				AND p.platform_id = :platform_id
				//Need to get platform id
				//direction
				AND l.type == :type 
				//time
				AND d.domain_name = :domain
				AND m.sender_id = :friend OR m.recipient_id = :friend
				// Need to retrieve friend id
			),
			{
				keyword: keyword,
				platform: platform,
				direction: direction,
				type: type,
				time: time,
				domain: domain,
				friend: friend,
				tags: tags
			}
		);
	},
	*/