var UserDB = {
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

	// Given a userId, returns a promise containing all users that have send
	// or received a message from the authenticated user
	// If userId does not exist in db or no 'friends' have been found, returns
	// a promise containing null
	getFriends(userId) {
		return this._getObjects(
			(
				'SELECT DISTINCT u.id, u.email, u.imgUrl FROM user u ' + 
				'JOIN message m1 ON u.id = m1.recipientId ' + 
				'JOIN message m2 ON u.id = m2.senderId ' +
				'WHERE m1.senderId = :id AND m2.recipientId = :id'
			),
			{
				id: userId
			}
		);
	},	

	// if user already exists -> promise resolves with null
	// if not
	addUser(firstName, lastName, email, passwordHash) {	
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
								'INSERT INTO user (firstName, lastName, email, passwordHash) ' + 
								'VALUES (:firstName, :lastName, :email, :passwordHash)'
							), 
							{
								firstName: firstName,
								lastName: lastName,
								email: email,
								passwordHash: passwordHash
							}
						)
						.then(() => {
							return _this.getUserById(_this._connection.lastInsertId())
								.then(rows => {		
									return rows ? rows : new Error('DB sad');
								});
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
	var userDD = Object.create(UserDB);
	userDD._connection = connection;
	return userDD;
}