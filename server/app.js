var express = require('express');
var https = require('https');
var fs = require('fs');
var graph = require('fbgraph');
var request = require('request');
var authTokens = require(__base + 'secret/auth-tokens.json');
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

var authConf = {
    'facebook' : {
        'clientID' : authTokens.fbClientID,
        'clientSecret' : authTokens.fbClientSecret,
        'scope' : 'email, public_profile, user_friends',
        'redirectUri' :   'http://localhost:1234/auth/facebook'
    },
    'gmail' : {
        'clientID': authTokens.gmailClientID,
        'clientSecret' : authTokens.gmailClientSecret,
        'scope' : [
            'https://www.googleapis.com/auth/plus.me',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/gmail.modify']
    },
    'slack' : {
        'clientID' : authTokens.slackClientID,
        'clientSecret' : authTokens.slackClientSecret,
        'redirectUri' : ''
    }
};

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

    // Facebook webhook
    app.get('/api/fbwebhook', function(req, res) {
        if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
            console.log("Validating webhook");
            res.status(200).send(req.query['hub.challenge']);
        } else {
            console.error("Failed validation. Make sure the validation tokens match.");
            res.sendStatus(403);
        }
    });

    app.get('/auth/facebook', function(req, res) {
        // we don't have a code yet
        // so we'll redirect to the oauth dialog
        if (!req.query.code) {
            var authUrl = graph.getOauthUrl({
                "client_id":     authConf.facebook.clientID,
                "redirect_uri":  authConf.facebook.redirectUri,
                "scope":         authConf.facebook.scope
            });

            if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
                res.redirect(authUrl);
            } else {  //req.query.error == 'access_denied'
                res.send('access denied');
            }
            return;
        }

        // code is set
        // we'll send that and get the access token
        graph.authorize({
            "client_id":      authConf.facebook.clientID,
            "redirect_uri":   authConf.facebook.redirectUri,
            "client_secret":  authConf.facebook.clientSecret,
            "code":           req.query.code
        }, function (err, facebookRes) {
            res.redirect('/UserHasLoggedIn');
        });
    });

    var fboptions = {
        timeout:  3000
        , pool:     { maxSockets:  Infinity }
        , headers:  { connection:  "keep-alive" }
    };

    var reqParam = {
        fields:"type,caption,description,link"
    };

    // user gets sent here after being authorized
    app.get('/UserHasLoggedIn', function(req, res) {
        console.log("Facebook account worked!");
        graph.setOptions(options).get("/me/feed", reqParam, function(err, res) {
            console.log(res);
        });
    });

    /* Parses a string and returns an array of links if there are any. */
    function regParser(text) {
        var re = new RegExp('/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/');
        var links = [];
    }


    // Gmail

    app.use('/auth/gmail', function() {
        var scope = authTokens.gmail.scope;


    });

    // fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    //     if (err) {
    //         console.log('Error loading client secret file: ' + err);
    //         return;
    //     }
    //     // Authorize a client with the loaded credentials, then call the
    //     // Gmail API.   
    //     authorize(JSON.parse(content), listLabels);
    // });

    // Slack
    app.use('/auth/slack', function (req, res) {
        if (req.method === 'POST') {
	        res.type('html');
            res.status(200).send();
            console.log(req.params.event);
        }

        // var options = {
        //     uri: 'https://slack.com/api/oauth.access?code='
        //     +req.query.code+
        //     '&client_id='+ authConf.slack.clientID +
        //     '&client_secret='+ authConf.slack.clientSecret +
        //     '&redirect_uri='+ authConf.slack.redirectUri,
        //     method: 'GET'
        // };
        //
        // request(options, (error, response, body) => {
        //     var JSONresponse = JSON.parse(body);
        //     if (!JSONresponse.ok){
        //         console.log(JSONresponse);
        //         res.send("Error encountered: \n"+JSON.stringify(JSONresponse)).status(200).end();
        //     } else {
        //         console.log(JSONresponse);
        //         res.send("Success!")
        //     }
        // });
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
        if (!req.secure) {
            return res.redirect(['https://', req.get('Host'), req.url].join(''));
        } else if (req.isAuthenticated()) {
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

    const options = {
        cert: fs.readFileSync('/etc/letsencrypt/live/lynxapp.me/fullchain.pem'),
        key: fs.readFileSync('/etc/letsencrypt/live/lynxapp.me/privkey.pem')
    };

    var server = https.createServer(options, app);

    server.listen(443);
    app.listen(80);
};
