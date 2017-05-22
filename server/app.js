// const express = require('express');
// const app = express();
// const session = require('express-session');
// const RedisStore = require('connect-redis')(session);

// const bcrypt = require('bcryptjs');
// const bodyParser = require('body-parser');
// const morgan = require('morgan');

// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;

// const server = require('http').createServer(app)
// const io = require('socket.io')(server)

// const cookieSigSecret = process.env.SIGSECRET;
// if (!cookieSigSecret) {
// 	console.error('Please set SIGSECRET');
// 	process.exit(1);
// }

// app.use(morgan('dev'));
// app.use(bodyParser.json());
// app.use(session({
//     secret: cookieSigSecret,
//     resave: false,
//     saveUninitialized: false,
//     store: new RedisStore()
// }));
// app.use(express.static(__base + '../client'));

module.exports.start = function (connection) {
    const express = require('express');
    const app = express();
    const session = require('express-session');
    const RedisStore = require('connect-redis')(session);

    const bcrypt = require('bcrypt');
    const bodyParser = require('body-parser');
    const morgan = require('morgan');

    const server = require('http').createServer(app)
    const io = require('socket.io')(server)


    const UserDB = require(__base + '/database/user-db')(connection),
        DomainDB = require(__base + '/database/domain-db')(connection),
        MessageDB = require(__base + '/database/message-db')(connection),
        Database = require(__base + '/database/database-module')(connection);
    
    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy; 

    const cookieSigSecret = process.env.SIGSECRET;
    if (!cookieSigSecret) {
        console.error('Please set SIGSECRET');
        process.exit(1);
    }

    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use(session({
        secret: cookieSigSecret,
        resave: false,
        saveUninitialized: false,
        store: new RedisStore()
    }));

    app.use(passport.initialize());
    //looks at req.session and pulls data off of it and sets on req.user
    app.use(passport.session());   
    
    /////////////////////////////////////////////////////////////////////////////////////////////
    // Authentication
    //
    passport.use(new LocalStrategy({usernameField: 'email'}, function (email, password, done) {
        UserDB.getUserByEmail(email)
            .then(function (dbUser) {	                                       
                if (!dbUser) return done(null, false, {message: 'Incorrect credentials.'});
                
                bcrypt.compare(password.trim(), dbUser.passwordHash, function (err, matches) {
                    if (err) return done(err);			
                    
                    if (!matches) return done(new Error('incorrect creds'), false);

                    return done(null, dbUser);
                });

            }).catch(err => console.log(err));
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.user_id); 
    });

    passport.deserializeUser(function (id, done) {
        UserDB.getUserById(id)
            .then(function (dbUser) {
                if (!dbUser) {
                    req.logout();
                    return done(null, false);
                }
                return done(null, dbUser);
            })
            .catch(done);
    });


    app.use(express.static(__base + '../client'));

    /////////////////////////////////////////////////////////////////////////////////////////////
    // API
    //

    // public
    app.post('/api/signin', passport.authenticate('local'), function (req, res) {
        res.json({message: 'Authenticated'});
    });

    // public
    app.get('/api/signout', function (req, res) {	
        req.logout();		
        res.json({message: 'You have been logged out.'});
    });

    // public
    app.post('/api/signup', function (req, res, next) {
        //might want to do error checking
        //posts new username and new password and other info -> new user obj
        //field validation will be done on the client.
        const salt = bcrypt.genSaltSync(10);
        bcrypt.hash(req.body.password.trim(), salt, function (err, passwordHash) {
            if (err) return next(err);
            // if username is already in db, returns error
            // if not, adds new user to db, returns user information
            UserDB.addUser(req.body.firstName, req.body.lastName, req.body.email, passwordHash)
                .then(user => {				
                    req.body = user; 
                    req.login(req.body, err => {
                        if (err) return next(err);
                        res.json({message: 'signed up'});
                    }); 
                })
                .catch(next);
        });
    });

    // MOVE THIS LATER
    const authApi = require(__base + 'routes/auth-api.js');
    app.use('/api/auth', authApi.Router());

    /////////////////////////////////////////////////////////////////////////////////////////////
    // Api endpoints - only authenticated users reach past this point
    //
    app.use(function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.status(401).json({message: 'Must sign in.'});		
        }
    });

    const usersApi = require(__base + 'routes/user-api.js'),
        domainApi = require(__base + 'routes/domain-api.js'),
        messageApi = require(__base + 'routes/message-api.js');

    app.use('/api/user', usersApi.Router(UserDB));
    app.use('/api/domain', domainApi.Router(DomainDB));
    app.use('/api/message', messageApi.Router(MessageDB));    

    app.use(function (err, req, res, next) {
        console.error(err.stack);
        res.status(err.status || 500).send({message: err.message});
    });

    
    io.on('connection', socket => {
        socket.on('message', data => {
            console.log(data)
        })
    })
    

    server.listen(80, () => {
        console.log('listening at http://localhost:1234 (mapped from :80)');
    });    
};