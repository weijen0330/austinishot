const express = require('express');
const _ = require('lodash');
const request = require('request');
const requestProm = require('request-promise');
const fs = require('fs');
const base64url = require('base64url');
const URL = require('url').URL;

const google = require('googleapis');
const slackWebClient = require('@slack/client').WebClient;
const graph = require('fbgraph');
const PubSub = require('@google-cloud/pubsub');

const authTokens = require(__base + 'secret/auth-tokens.json');
const authConf = {
    'facebook' : {
        'clientID' : authTokens.fbClientID, // also refer to as app-ID
        'clientSecret' : authTokens.fbClientSecret, // also refer to as app-secret
        'scope' : 'email, public_profile, user_friends, user_posts',
        'redirectUri' : 'https://lynxapp.me/api/auth/facebook_oauth'
    },
    'gmail' : {
        'clientID': authTokens.gmailClientID,
        'clientSecret' : authTokens.gmailClientSecret,
        'scope' : ['https://www.googleapis.com/auth/plus.me',
                   'https://www.googleapis.com/auth/gmail.readonly'],
        'redirectUri' : 'https://lynxapp.me/api/auth/gmail_oauth'
    },
    'slack' : {
        'clientID' : authTokens.slackClientID,
        'clientSecret' : authTokens.slackClientSecret,
        'scope': 'users.profile%3Aread+users%3Aread+channels%3Ahistory+channels%3Aread+im%3Aread+im%3Ahistory+mpim%3Aread+mpim%3Ahistory',
        'redirectUri' : 'https://lynxapp.me/api/auth/slack_oauth'
    }
};

module.exports.Router = function (MessageDB, socketIo) {
	const router = express.Router();

    // Parses a string and returns an array of links if there are any.
    // @param {string} text - the text to be processed.
    function regParser(message) {
        // Resource: https://gist.github.com/dperini/729294
        // defensive
        console.log("message in reg parser", message);
        if (message) {            
            // Slack puts brackets around their links, so we need to remove them.
            var words = message.replace(/[<>]/g,'').split(' ');

            var urls = [];

            for (i = 0; i < words.length; i++) {
                console.log('The word is: ' + words[i]);
                                
                // if it is a link, we will call the link summary API
                try {
                    const url = new URL(words[i]);
                    urls.push(url);
                } catch (e) {
                    console.log("not a link");
                }
            }
            return urls;
        }
    }

    // Calls Ena's link summary API. We return the result back to the client so it can format it.
    // @param {Object} linkinfo - other additional information about the link, which has the following properties:
    //                              service {string} - name of the platform
    //                              sender {string} - name of the sender
    function generateLinkSummary(url, linkInfo) {        
        // defensive
        let linkSummary = {
            url: url.href,
            platformName: linkInfo.platform,
            sender: linkInfo.sender,
            timeSent: linkInfo.timeStamp,
            domainName: url.hostname,
            note: linkInfo.bodyText,
            isRead: false,
            tags: [],
            type: "article",
            title: "",
            description: "",
            imageUrl: ""                       
        };
        
        const prefix = 'https://info344api.enamarkovic.com/v1/summary?url=';
        return requestProm(prefix + url.href).then(body => {                
            const urlData = JSON.parse(body);
            linkSummary.type = urlData.type && urlData.type.length > 0 ? urlData.type : "article";
            linkSummary.title = urlData.title ? urlData.title : "";
            linkSummary.description = urlData.description ? urlData.description : "";
            linkSummary.imageUrl = urlData.image ? urlData.image : "";
        }).catch(err => {
            console.error(err)
        }).then(() => linkSummary)        
    }

    // Facebook oauth: https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow
    router.get('/facebook_oauth', function(req, res) {
        if (!req.query.code) {
            const oauthUrl = 'https://www.facebook.com/v2.9/dialog/oauth?client_id='
                + authConf.facebook.clientID
                + '&scope=' + authConf.facebook.scope
                + '&redirect_uri=' + authConf.facebook.redirectUri;

            if (!req.query.error) {
                res.redirect(oauthUrl);
            } else {
                res.status(401).send('Access denied to Facebook');
            }
        } else {
            // Exchanging an authorization code for an API access token
            const apiTokenUrl = 'https://graph.facebook.com/v2.9/oauth/access_token?client_id='
                + authConf.facebook.clientID
                + '&redirect_uri=' + authConf.facebook.redirectUri
                + '&client_secret=' + authConf.facebook.clientSecret
                + '&code=' + req.query.code;

            request(apiTokenUrl, function (err, apiTokenRes, body) {
                if (!err && apiTokenRes.statusCode == 200) {
                    const info = JSON.parse(body);
                    graph.setAccessToken(info.access_token);
                    res.redirect('https://lynxapp.me/app');
                } else {
                    console.log('Error: unable to get Facebook API token.');
                }
            });
        }
    });

    // Facebook webhook: https://developers.facebook.com/docs/graph-api/webhooks
    router.post('/facebook_incoming', function(facebookReq, facebookRes) {
        // Facebook challenge. Saving just in case.
        // if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        //     console.log("Validating webhook");
        //     res.status(200).send(req.query['hub.challenge']);
        // } else {
        //     console.error("Failed validation. Make sure the validation tokens match.");
        //     res.sendStatus(403);
        // }
        //
        // changes: [ { field: 'status',
        //              id: '44444444_444444444',
        //              value: 'This is an Example Status.' } ]
        const newStatus = facebookReq.body.entry[0].changes[0];
        
        const statusValue = newStatus.value;
        
        const links = regParser(statusValue);

        if (links && links.length) {
            const reqParam = {
                fields: 'type,caption,description,link,updated_time,from,message'
            };

            // Grab information about the status via the API
            graph.get(newStatus.id, reqParam, function(err, res) {
                if (err) {
                    console.log("Error: not authorized with Facebook");
                    facebookRes.redirect('/facebook_oauth');
                } else {
                    var message = res;
                    console.log(message);

                    if (message.type === 'video'|| message.type === 'link') {
                        var linkInfo = {
                            platform: 'facebook',
                            sender: message.from.name,
                            bodyText: facebookReq.body.entry[0].changes[0].value ? facebookReq.body.entry[0].changes[0].value : "",
                            timeStamp: message.updated_time
                        };
                        console.log("link info", linkInfo);
                        console.log("link", message.link);
                        generateLinkSummary(message.link, linkInfo).then(linkSummary => {
                            // add the message to the database
                            console.log("link summary:", linkSummary);
                            return MessageDB.insertMessage(1, linkSummary)
                        }).then((message) => {
                            console.log(message);

                            socketIo.emit("new_message", {message: message});
                            // send the added message back to the user through web socket
                            // this should broadcast to users
                            facebookRes.status(200).send(message);
                        }).catch(console.log);
                    } else {
                        facebookRes.status(200).send("not a link");
                    }
                }
            });
        }
    });

    // Gmail Oauth: https://developers.google.com/identity/protocols/OAuth2WebServer
    router.get('/gmail_oauth', function(req, res) {
        /* const oauthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id='
        + authConf.gmail.clientID
        + '&redirect_uri' + authConf.gmail.redirectUri
        + '&response_type=code&scope=' + auth.gmail.scope;
        res.redirect(oauthUrl); */
        const oauth2 = google.auth.OAuth2;
        const oauth2Client = new oauth2(
            authConf.gmail.clientID,
            authConf.gmail.clientSecret,
            authConf.gmail.redirectUri
        );

        if (!req.query.code) {
            const oauthUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: authConf.gmail.scope
            });
            res.redirect(oauthUrl);
        } else {
            oauth2Client.getToken(req.query.code, function(err, tokens) {
                if (!err) {
                    oauth2Client.setCredentials(tokens);
                    const params = {
                        'labelIds' : ['INBOX'],
                        'topicName' : 'projects/civil-ripple-167409/topics/gmail_incoming'
                    };

                    request.post({
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        url: 'https://www.googleapis.com/gmail/v1/users/me/watch',
                        form: params
                    }, function (err, watchRes, body) {
                        if (!err && watchRes.statusCode == 200) {
                            const info = JSON.parse(body);
                            console.log(body)
                        }
                    });
                    
                    res.redirect('https://lynxapp.me/app');
                }
            });
        }
    });

    router.post('/gmail_incoming', function(req, res) {
        const projectId = 'civil-ripple-167409';
        console.log("Gmail works!");
        console.log(req);


    });

    // Slack Oauth: https://api.slack.com/docs/oauth
    router.get('/slack_oauth', function(req, res) {
        if (!req.query.code) {
            const oauthUrl = 'https://slack.com/oauth/authorize?client_id='
                + authConf.slack.clientID
                + '&scope=' + authConf.slack.scope
                + '&redirect_uri=' + authConf.slack.redirectUri;
            res.redirect(oauthUrl);
        } else {
            // Exchanging an authorization code for an API access token
            const apiTokenUrl = 'https://slack.com/api/oauth.access?client_id='
                + authConf.slack.clientID
                + '&client_secret=' + authConf.slack.clientSecret
                + '&code=' + req.query.code
                + '&redirect_uri=' + authConf.slack.redirectUri;

            request(apiTokenUrl, function (err, apiTokenRes, body) {
                if (!err && apiTokenRes.statusCode == 200) {
                    const info = JSON.parse(body);
                    // There seems to be no way to set the token after the object is initiated.
                    // This is the work around.
                    authConf.slack.accessToken = info.access_token;
                    res.redirect('https://lynxapp.me/app');
                }
            });
        }
    });

    router.post('/slack_incoming', function(req, res) {        
        // This is used to respond to slack challenges. Saved in case
        // the verification expires in the future.
        // res.type('html');
        // res.status(200).send(req.body.challenge);
        // event:
        //        { type: 'message',
        //          user: 'U50SS1PLJ',
        //          text: 'denver',
        //          ts: '1495684015.632873',
        //          channel: 'D51MCEQ1M',
        //          event_ts: '1495684015.632873' },
        if (req.body.event.text) {            

            var info =  req.body.event;
            const slackWeb = new slackWebClient(authConf.slack.accessToken);

            var links = regParser(info.text);

            // parsed data will be the urls
            // let links = regParser(req.body.event.text);
            if (links.length > 0) {

                var linkInfo = {
                    platform : 'slack',
                    timeStamp: info.event_ts,
                    bodyText: (info.text).replace(/[<>]/g,'')
                };

                // identify the user through the Slack API
                slackWeb.users.info(info.user, function(usersInfoErr, usersInfo) {
                    if (usersInfoErr || !usersInfo.ok) {
                        console.log('Error: Unable to identify user.');
                        linkInfo.sender = '';
                    } else {
                        linkInfo.sender = usersInfo.user.profile.real_name;
                    }
                    
                    // send the urls through 344 handler
                    // generate link summary is expecting url object ( new URL() )
                    generateLinkSummary(links[0], linkInfo).then(linkSummary => {
                        // add the message to the database
                        console.log("link summary:", linkSummary);
                        return MessageDB.insertMessage(1, linkSummary)
                    }).then((message) => {
                        console.log(message);

                        socketIo.emit("new_message", {message: message});
                        // send the added message back to the user through web socket
                        // this should broadcast to users
                        res.status(200).send(message);
                    }).catch(console.log)
                });
            } else {
                res.status(200).send("did not have a link");
            }
        } else {
            res.status(200).send("non-text event");
        }
    });

	return router;
};

