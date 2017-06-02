var dbConfig = require(__base + 'secret/config-db.json');
var MariaSql = require('mariasql');
var bluebird = require('bluebird');

var MessageDB = {
	insertMessage(userId, messageData) {	
		const connection = bluebird.promisifyAll(new MariaSql(dbConfig));			
		/*
		messageData = {
			url -> url that was sent in the message
			platformName -> platform it came from
			domainName -> url's domain name
			title -> from 344 api, title of article
			description -> from 344 api, description of article
			type -> from 344 
			imageUrl -> from 344 api, image in article
			sender -> who sent the link 
			note -> the text of the message
			timeSent -> string timestamp of when the message was sent
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
		return connection.queryAsync(
			"SELECT link_id FROM LINKS WHERE url = :url",
			{url: messageData.url}
		).then(linkRows => {
			if (linkRows && linkRows.length > 0) {
				return linkRows[0].link_id		
			} else {
				// link doesnt exist

				//check if domain exists
				return connection.queryAsync(
					"SELECT domain_id FROM DOMAIN WHERE domain_name = :domain",
					{domain: messageData.domainName},
					{useArray: true}
				).then(domainRows => {
					if (domainRows && domainRows.length) {
						console.log("print domain rows", domainRows[0][0])
						return domainRows[0][0]
					} else {
						return connection.queryAsync(
							"INSERT INTO DOMAIN (domain_name) VALUES (:domain)",
							{domain: messageData.domainName}
						).then(() => {							
							return connection.lastInsertId()
						}).then(domainId => {
							
							connection.queryAsync(
								"INSERT INTO USER_DOMAINS VALUES (:userId, :domainId)",
								{userId: userId, domainId: domainId}
							)
							return domainId
						})
					}
				}).then(domainId => {
					// insert link, return id

					// console.log("inserting link, domain id", domainId) domain id is undefined
					return connection.queryAsync(
						"INSERT INTO LINKS (title, description, type, domain_id, url, img_url) " +
						"VALUES (:title, :description, :type, :domainId, :url, :imgUrl)",
						{
							title: messageData.title,
							description: messageData.description,
							type: messageData.type,
							domainId: domainId,
							url: messageData.url,
							imgUrl: messageData.imageUrl
						}
					).then(() => {
						return connection.lastInsertId()
					})
				}) 
			}
		}).then(linkId => {
			// get platform id
			return connection.queryAsync(
				"SELECT platform_id FROM PLATFORM WHERE platform_name = :platform",
				{platform: messageData.platformName}
			).then(platformRows => {
				return {
					platformId: platformRows[0].platform_id,
					linkId: linkId
				}
			})
		}).then(ids => {
			return connection.queryAsync(
				"INSERT INTO MESSAGE (link_id, sender, recipient_id, platform_id, note, timeSent, is_read, deleted) " + 
				"VALUES (:linkId, :sender, :recipId, :platId, :note, :time, :isRead, :deleted)",
				{
					linkId: ids.linkId,
					sender: messageData.sender,
					recipId: userId,
					platId: ids.platformId,
					note: messageData.note,
					time: messageData.timeSent,
					isRead: false,
					deleted: false
				}
			).then(() => {
				return connection.lastInsertId()
			})
		}).then(messageId => {
			return connection.queryAsync(
				"INSERT INTO USER_MESSAGES (user_id, message_id) VALUES (:userId, :messageId)",
				{userId: userId, messageId: messageId}
			).then(() => {
				return messageId
			})
		}).then((messageId) => {
			connection.end()
			messageData.messageId = messageId
			return messageData
		})

	},

	searchMessages(criteria) {	
		const connection = bluebird.promisifyAll(new MariaSql(dbConfig));	

		const keywords = criteria.keywords
		// tags is an array?
		const tags = criteria.tags		
		const platform = criteria.integration
		const type = criteria.linkType
		// how to use timeSent?
		const timeSent = criteria.timeSent 
		const domain = criteria.domain
		const sender = criteria.sender

		let whereClauseStr = "WHERE m.deleted = 0 AND ("
		let whereClause = []
		let options = {}
		
		if(keywords && keywords.length) {
			whereClause.push((
				'm.sender LIKE %:keywords% OR ' +
				'm.note LIKE %:keywords% OR ' +
				'p.platform_name LIKE %:keywords% OR ' +
				'l.title LIKE %:keywords% OR ' +
				'l.description LIKE %:keywords% OR ' +
				'l.type LIKE %:keywords% OR ' +
				'l.url LIKE %:keywords% OR ' +
				'd.domain_name LIKE %:keywords%'
			))
			options.keywords = keywords
		} else {
			if (platform && platform.length) {
				whereClause.push('p.platform_name LIKE :platform')
				options.platform = platform
			}

			if (type && type.length) {
				whereClause.push('l.type LIKE :type')
				options.type = type
			}

			if (domain && domain.length) {
				whereClause.push('d.domain_name LIKE :domain')
				options.domain = domain
			}

			if (sender && sender.length) {
				whereClause.push('m.sender LIKE :sender')
				options.sender = sender
			}

			// TODO: timesent
		}
		whereClause.forEach((where, i) => {
			whereClause += where 
			if (i < whereClause.length - 1) {
				whereClause += ' OR '
			} else {
				whereClause += ')'
			}
		})

		console.log(whereClauseStr)

		const getMessages = (
			'SELECT ' +
				'm.message_id AS messageId, ' +
				'm.sender, ' +
				'm.note, ' +
				'm.timeSent, ' +
				'm.is_read AS isRead, ' +
				'p.platform_name AS platformName, ' +
				'l.title, ' +
				'l.description, ' +
				'l.type, ' +
				'l.url, ' +
				'l.img_url AS imageUrl, ' +
				'd.domain_name AS domainName ' +				
			'FROM MESSAGE m ' + 
			'JOIN PLATFORM p ON m.platform_id = p.platform_id ' + 
			'JOIN LINKS l ON m.link_id = l.link_id ' + 
			'JOIN DOMAIN d ON l.domain_id = d.domain_id ' +
			whereClauseStr
		)

		const getMessageLinks = (
			'SELECT m.message_id, t.tag_text FROM MESSAGE m ' + 
			'JOIN LINKS l on m.link_id = l.link_id ' +
			'JOIN LINKS_TAGS lt ON l.link_id = lt.link_id ' + 
			'JOIN TAGS t ON lt.tag_id = t.tag_id ' +
			'WHERE m.deleted = 0'			
		)

		return connection.queryAsync(getMessageLinks, {}, {useArray: true}).then(rows => {
			if (rows && rows.length) {
				let tagsForMessages = {}
				rows.forEach(row => {
					let messageId = row[0]
					let tag = row[1]
					if (!tagsForMessages[messageId]) {
						tagsForMessages[messageId] = []
					}
					tagsForMessages[messageId].push(tag)
				})
				return tagsForMessages
			}
			return {}			
		}).then(tagsForMessages => {
			return connection.queryAsync(getMessages, options).then(rows => {
				if (rows && rows.length) {
					rows.forEach(row => {						
						if (tagsForMessages[row.messageId]) {
							row.tags = tagsForMessages[row.messageId]
						} else {
							row.tags = []
						}
					})
					return rows
				}
				return []
			})
		}).then(allMessages => {
			if (tags && tags.length) {
				allMessages = allMessages.filter(msg => {
					tags.forEach(tag => {
						if (msg.tags.includes(tag)) {
							return true
						}
					})
				})
				return false
			}
			connection.end()
			return allMessages
		})

	},

	getUnreadMessages(userId) {
		const connection = bluebird.promisifyAll(new MariaSql(dbConfig));
		const query = (
			'SELECT ' +
					'm.message_id AS messageId, ' +
					'm.sender, ' +
					'm.note, ' +
					'm.timeSent, ' +
					'm.is_read AS isRead, ' +
					'p.platform_name AS platformName, ' +
					'l.title, ' +
					'l.description, ' +
					'l.type, ' +
					'l.url, ' +
					'l.img_url AS imageUrl, ' +
					'd.domain_name AS domainName ' +
					// 't.tag_text AS tag ' + 
				'FROM MESSAGE m ' + 
				'JOIN PLATFORM p ON m.platform_id = p.platform_id ' + 
				'JOIN LINKS l ON m.link_id = l.link_id ' + 
				'JOIN DOMAIN d ON l.domain_id = d.domain_id ' + 
				// 'JOIN LINKS_TAGS lt ON l.link_id = lt.link_id ' +
				// 'JOIN TAGS t ON lt.tag_id = t.tag_id ' +
				'WHERE m.recipient_id = :userId ' + 
				'AND m.is_read = :isRead ' + 
				'AND m.deleted = :deleted '
		)
		
		return connection.queryAsync(query, {userId: 1, isRead: 0, deleted: 0}).then(messages => {
			connection.end()
			return messages
		})
	},	

	getReadMessages(userId) {
		const connection = bluebird.promisifyAll(new MariaSql(dbConfig));
		const query = (
			'SELECT ' +
					'm.message_id AS messageId, ' +
					'm.sender, ' +
					'm.note, ' +
					'm.timeSent, ' +
					'm.is_read AS isRead, ' +
					'p.platform_name AS platformName, ' +
					'l.title, ' +
					'l.description, ' +
					'l.type, ' +
					'l.url, ' +
					'l.img_url AS imageUrl, ' +
					'd.domain_name AS domainName ' +
					// 't.tag_text AS tag ' + 
				'FROM MESSAGE m ' + 
				'JOIN PLATFORM p ON m.platform_id = p.platform_id ' + 
				'JOIN LINKS l ON m.link_id = l.link_id ' + 
				'JOIN DOMAIN d ON l.domain_id = d.domain_id ' + 
				// 'JOIN LINKS_TAGS lt ON l.link_id = lt.link_id ' +
				// 'JOIN TAGS t ON lt.tag_id = t.tag_id ' +
				'WHERE m.recipient_id = :userId ' + 
				'AND m.is_read = :isRead ' + 
				'AND m.deleted = :deleted '
		)
		
		return connection.queryAsync(query, {userId: 1, isRead: 1, deleted: 0}).then(messages => {
			connection.end()
			return messages
		})
	},

	markRead(messageId) {
		const connection = bluebird.promisifyAll(new MariaSql(dbConfig));	
		return connection.queryAsync(
			'UPDATE MESSAGE SET is_read = 1 WHERE message_id = :messageId',
			{messageId: messageId}
		).then((info) => {
			connection.end()
		})
	},

	markUnRead(messageId) {
		const connection = bluebird.promisifyAll(new MariaSql(dbConfig));	
		return connection.queryAsync(
			'UPDATE MESSAGE SET is_read = 0 WHERE message_id = :messageId',
			{messageId: messageId}
		).then((info) => {
			connection.end()
		})
	},

	markDeleted(messageId) {
		const connection = bluebird.promisifyAll(new MariaSql(dbConfig));		
		return connection.queryAsync(
			'UPDATE MESSAGE SET deleted = 1 WHERE message_id = :messageId',
			{messageId: messageId}
		).then(() => {
			connection.end()
		})
	},
}

module.exports = function (connection) {
	var messageDB = Object.create(MessageDB);
	messageDB._connection = connection;
	return messageDB;
}