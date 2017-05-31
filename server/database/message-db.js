var MessageDB = {
	insertMessage(userId, messageData) {				
		/*
		messageData = {
			url -> url that was sent in the message
			platform -> platform it came from
			domain -> url's domain name
			title -> from 344 api, title of article
			description -> from 344 api, description of article
			type -> from 344 
			imgUrl -> from 344 api, image in article
			sender -> who sent the link 
			note -> the text of the message
			timeStamp -> string timestamp of when the message was sent
		}

		1. check if link exists
			if does -> go to step 3 with link id	
			if doesnt -> do step 2, do step 3				
		2. check if domain exists
			if does -> get id
			if doesnt -> insert domain, insert user_domains
			insert link
		3. get platform id
		4. insert message w/ platform id, link id, & recipient id
		5. insert to user_messages		
		*/
		
		// TODO: check if message is already if there before adding again
		return this._connection.queryAsync(
			"SELECT link_id FROM LINKS WHERE url = :url",
			{url: messageData.url}
		).then(linkRows => {
			if (linkRows && linkRows.length > 0) {
				return linkRows[0].link_id		
			} else {
				// link doesnt exist

				//check if domain exists
				return this._connection.queryAsync(
					"SELECT domain_id FROM DOMAIN WHERE domain_name = :domain",
					{domain: messageData.domain}
				).then(domainRows => {
					if (domainRows && domainRows.length > 0) {
						return domainRows[0].domainId
					} else {
						return this._connection.queryAsync(
							"INSERT INTO DOMAIN (domain_name) VALUES (:domain)",
							{domain: messageData.domain}
						).then(() => {							
							return this._connection.lastInsertId()
						}).then(domainId => {
							
							this._connection.queryAsync(
								"INSERT INTO USER_DOMAINS VALUES (:userId, :domainId)",
								{userId: userId, domainId: domainId}
							)
							return domainId
						})
					}
				}).then(domainId => {
					// insert link, return id
					return this._connection.queryAsync(
						"INSERT INTO LINKS (title, description, type, domain_id, url, img_url) " +
						"VALUES (:title, :description, :type, :domainId, :url, :imgUrl)",
						{
							title: messageData.title,
							description: messageData.description,
							type: messageData.type,
							domainId: domainId,
							url: messageData.url,
							imgUrl: messageData.imgUrl
						}
					).then(() => {
						return this._connection.lastInsertId()
					})
				}) 
			}
		}).then(linkId => {
			// get platform id
			return this._connection.queryAsync(
				"SELECT platform_id FROM PLATFORM WHERE platform_name = :platform",
				{platform: messageData.platform}
			).then(platformRows => {
				return {
					platformId: platformRows[0].platform_id,
					linkId: linkId
				}
			})
		}).then(ids => {
			return this._connection.queryAsync(
				"INSERT INTO MESSAGE (link_id, sender, recipient_id, platform_id, note, timeSent, is_read, deleted) " + 
				"VALUES (:linkId, :sender, :recipId, :platId, :note, :time, :isRead, :deleted)",
				{
					linkId: ids.linkId,
					sender: messageData.sender,
					recipId: userId,
					platId: ids.platformId,
					note: messageData.note,
					time: messageData.timeStamp,
					isRead: false,
					deleted: false
				}
			).then(() => {
				return this._connection.lastInsertId()
			})
		}).then(messageId => {
			return this._connection.queryAsync(
				"INSERT INTO USER_MESSAGES (user_id, message_id) VALUES (:userId, :messageId)",
				{userId: userId, messageId: messageId}
			)
		}).then((data) => {
			this._connection.end()
			return data;
		})

	},

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

	getNewMessagesWithType(userId, type) {
		return this.getMessages(
			(
				'WHERE m.recipient_id = :userId ' +
				'AND m.is_read = :isRead ' + 
				'AND l.type = :type ' + 
				'AND m.deleted = :isDeleted'
			),
			{
				userId: userId,
				isRead: false,
				type: type,
				isDeleted: false
			}
		)
	},

	getOldMessagesWithType(userId, type) {
		return this.getMessages(
			(
				'WHERE m.recipient_id = :userId ' +
				'AND m.is_read = :isRead ' + 
				'AND l.type = :type ' + 
				'AND m.deleted = :isDeleted'
			),
			{
				userId: userId,
				isRead: true,
				type: type,
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
/*
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
*/
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