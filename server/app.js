var express = require('express');
var https = require('https');
var fs = require('fs');
var app = express();
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var cookieSigSecret = process.env.SIGSECRET;
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
app.use(express.static(__base + '../client'));

module.exports.start = function (connection) {
    var	UserDB = require(__base + '/database/user-db')(connection),
        CategoryDB = require(__base + '/database/category-db')(connection),
        DomainDB = require(__base + '/database/domain-db')(connection),
        MessageDB = require(__base + '/database/message-db')(connection),
        Database = require(__base + '/database/database-module')(connection);
    
    /////////////////////////////////////////////////////////////////////////////////////////////
    // Authentication
    //
    passport.use(new LocalStrategy({usernameField: 'email'}, function (email, password, done) {
        UserDB.getUserByEmail(email)
            .then(function (dbUser) {	                
                if (!dbUser) return done(null, false, {message: 'Incorrect credentials.'});
                bcrypt.compare(password, dbUser.passwordHash, function (err, matches) {
                    if (err) return done(err);			
                    if (!matches) return done(null, false, {message: 'Incorrect credentials'});

                    return done(null, dbUser);
                });
            }).catch(err => console.log(err));
    }));

    passport.serializeUser(function (user, done) {
        return done(null, user.id); 
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


    app.use(passport.initialize());
    //looks at req.session and pulls data off of it and sets on req.user
    app.use(passport.session());   

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

        bcrypt.hash(req.body.password, 10, function (err, passwordHash) {
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

    var usersApi = require(__base + 'routes/user-api.js'),
        categoryApi = require(__base + 'routes/category-api.js'),
        domainApi = require(__base + 'routes/domain-api.js'),
        messageApi = require(__base + 'routes/message-api.js');

    app.use('/api/user', usersApi.Router(UserDB));
    app.use('/api/category', categoryApi.Router(CategoryDB));
    app.use('/api/domain', domainApi.Router(DomainDB));
    app.use('/api/message', messageApi.Router(MessageDB));

    app.use(function (err, req, res, next) {
        console.error(err.stack);
        res.status(err.status || 500).send({message: err.message});
    });

    var server = app.listen(80, function () {
        console.log('listening at http://localhost:1234 (mapped from :80)');
    });

    const options = {
        cert: fs.readFileSync('/etc/letsencrypt/live/lynxapp.me/fullchain.pem'),
        key: fs.readFileSync('/etc/letsencrypt/live/lynxapp.me/privatekey.pem')
    };
    
    https.createServer(options, app).listen(8443);   
};