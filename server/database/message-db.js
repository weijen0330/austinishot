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

	// connection gets passed in, connection must be closed by caller
	getMessages(connection, whereClauseStr, options) {
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
			whereClauseStr +
			'ORDER BY m.message_id DESC'
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
		})

	},

	simpleSearch(criteria) {
		const connection = bluebird.promisifyAll(new MariaSql(dbConfig));
		const keywords = criteria.keywords

		let whereClauseStr = "WHERE m.deleted = 0 "
		if (keywords && keywords.length) {
			whereClauseStr += (
				'AND (m.sender LIKE \"%' + keywords + '%\" OR ' +
				'm.note LIKE \"%' + keywords + '%\" OR ' +
				'p.platform_name LIKE \"%' + keywords + '%\" OR ' +
				'l.title LIKE \"%' + keywords + '%\" OR ' +
				'l.description LIKE \"%' + keywords + '%\" OR ' +
				'l.type LIKE \"%' + keywords + '%\" OR ' +
				'l.url LIKE \"%' + keywords + '%\" OR ' +
				'd.domain_name LIKE \"%' + keywords + '%\") ' 
			)
		}

		return this.getMessages(connection, whereClauseStr, {}).then(allMessages => {
			connection.end()
			return allMessages
		})
	},

	advancedSearch(criteria) {	
		const connection = bluebird.promisifyAll(new MariaSql(dbConfig));	

		const keywords = criteria.keywords
		// tags is an array?
		const tags = criteria.tags		
		const platform = criteria.integration
		const type = criteria.linkType		
		const domain = criteria.domain
		const sender = criteria.sender

		// how to use timeSent?
		const timeSent = criteria.timeSent 

		let whereClauseStr = "WHERE m.deleted = 0 AND "
		let whereClause = []
		
		if(keywords && keywords.length) {
			whereClause.push((				
				'(m.note LIKE \"%' + keywords + '%\" OR ' +				
				'l.title LIKE \"%' + keywords + '%\" OR ' +
				'l.description LIKE \"%' + keywords + '%\" OR ' +				
				'l.url LIKE \"%' + keywords + '%\") '
			))
		}
		if (platform && platform.length) {
			whereClause.push('p.platform_name LIKE \"' + platform + '\" ')			
		}

		if (type && type.length) {
			whereClause.push('l.type LIKE \"' + type + '\" ')			
		}

		if (domain && domain.length) {
			whereClause.push('d.domain_name LIKE \"%' + domain + '%\" ')			
		}

		if (sender && sender.length) {
			whereClause.push('m.sender LIKE \"%' + sender + '%\" ')			
		}

		if (!whereClause.length) {
			whereClauseStr = "WHERE m.deleted = 0 "
		} 
		
		whereClause.forEach((where, i) => {
			whereClauseStr += where 
			if (i < whereClause.length - 1) {
				whereClauseStr += ' AND '
			}
		})

		return this.getMessages(connection, whereClauseStr, {}).then(allMessages => {
			if (tags && tags.length) {
				allMessages = allMessages.filter(msg => {
					let foundTag = false
					tags.forEach(tag => {
						if (msg.tags.includes(tag)) {
							foundTag = true
						}
					})
					return foundTag
				})				
			}
			connection.end()
			return allMessages
		})

	},

	getUnreadMessages() {
		const connection = bluebird.promisifyAll(new MariaSql(dbConfig));
		
		const whereClause = (
			'WHERE m.recipient_id = 1 ' + 
			'AND m.is_read = 0 ' + 
			'AND m.deleted = 0 '
		)		

		return this.getMessages(connection, whereClause, {}).then(allMessages => {
			connection.end()
			return allMessages
		})
	},	

	getReadMessages(userId) {
		const connection = bluebird.promisifyAll(new MariaSql(dbConfig));
		
		const whereClause = (
			'WHERE m.recipient_id = 1 ' + 
			'AND m.is_read = 1 ' + 
			'AND m.deleted = 0 '
		)		

		return this.getMessages(connection, whereClause, {}).then(allMessages => {
			connection.end()
			return allMessages
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