var MessageDB = {
	getMessages(whereClause, options) {
		return this._getObjects(
			(
				'SELECT ' +
					'm.message_id AS messageId' +
					'm.sender, ' +
					'm.note, ' +
					'UNIX_TIMESTAMP(m.timeSent) AS timeSent, ' +
					'm.is_read AS isRead, ' +
					'p.platform_name AS platformName, ' +
					'l.title, ' +
					'l.description, ' +
					'l.type, ' +
					'l.url, ' +
					'l.img_url AS imgUrl, ' +
					'd.domain_name AS domainName' +
					't.tag_text AS tag ' + 
				'FROM MESSAGE ' + 
				'JOIN PLATFORM p ON m.platform_id = p.platform_id ' + 
				'JOIN LINKS l ON m.link_id = l.link_id ' + 
				'JOIN DOMAIN d ON l.domain_id = d.domain_id ' + 
				'JOIN LINKS_TAGS lt ON l.link_id = lt.link_id ' +
				'JOIN TAGS t ON lt.tag_id = t.tag_id' +
				whereClause
			), 
			options
		)
	},

	getUnreadMessages(userId) {
		return this.getMessages(
			(
				'WHERE m.recipient_id = :userId ' + 
				'AND m.is_read = :isRead ' + 
				'AND m.deleted = :isDeleted'
			),
			{
				userId: userId,
				isRead: false,
				isDeleted: false
			}
		)
	},	

	getReadMessages(userId) {
		return this.getMessages(
			(
				'WHERE m.recipient_id = :userId ' + 
				'AND m.is_read = :isRead ' + 
				'AND m.deleted = :isDeleted'
			),
			{
				userId: userId,
				isRead: true,
				isDeleted: false
			}
		)
	},

	getMessageWithTag(userId, tag) {
		return this.getMessages(
			(
				'WHERE m.recipient_id = :userId ' +
				'AND t.tag_text = :tag ' + 
				'AND m.deleted = :isDeleted'
			),
			{
				userId: userId,
				tag: tag,
				isDeleted: false
			}
		)
	},

	getMessagesWithDomain(userId, domain) {
		return this.getMessages(
			(
				'WHERE m.recipient_id = :userId ' +
				'AND d.domain_name = :domain ' + 
				'AND m.deleted = :isDeleted'
			),
			{
				userId: userId,
				domain: domain,
				isDeleted: false
			}
		)
	},

	markRead(messageId) {
		return this._connection.queryAsync(
			'UPDATE MESSAGE SET is_read = 1 WHERE message_id = :messageId',
			{messageId: messageId}
		)
	},

	markDeleted(messageId) {
		return this._connection.queryAsync(
			'UPDATE MESSAGE SET deleted = 1 WHERE message_id = :messageId',
			{messageId: messageId}
		);
	},

	// TODO: this probably has to be modified too
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