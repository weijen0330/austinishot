var express = require('express');
var _ = require('lodash');
var request = require('request');
var fs = require('fs');

var google = require('googleapis');
var googleAuth = require('google-auth-library');

var graph = require('fbgraph');

var slackWebClient = require('@slack/client').WebClient;


var authTokens = require(__base + 'secret/auth-tokens.json');
var authConf = {
    'facebook' : {
        'clientID' : authTokens.fbClientID,
        'clientSecret' : authTokens.fbClientSecret,
        'scope' : 'email, public_profile, user_friends',
        'redirectUri' :   'https://lynxapp.me'
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
        'scope': 'channels%3Ahistory+channels%3Aread+im%3Aread+im%3Ahistory+mpim%3Aread+mpim%3Ahistory',
        'redirectUri' : 'https://lynxapp.me/api/auth/slack'
    }
};

module.exports.Router = function () {
	var router = express.Router();

    // Facebook webhook
    router.get('/facebook_incoming', function(req, res) {
        // Facebook challenge. Saving just in case.
        // if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        //     console.log("Validating webhook");
        //     res.status(200).send(req.query['hub.challenge']);
        // } else {
        //     console.error("Failed validation. Make sure the validation tokens match.");
        //     res.sendStatus(403);
        // }
    });

    router.get('/facebook', function(req, res) {
        // we don't have a code yet
        // so we'll redirect to the oauth dialog
        console.log("in facebook oauth");
        if (!req.query.code) {
            console.log("no query code");
            var authUrl = graph.getOauthUrl({
                "client_id":     authConf.facebook.clientID,
                "redirect_uri":  authConf.facebook.redirectUri,
                "scope":         authConf.facebook.scope
            });
            if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
                console.log("redirecting to facebook");
                res.redirect(authUrl);
            } else {  //req.query.error == 'access_denied'
                res.send('access denied');
            }

        } else {
            console.log("Oauth successful, the code (whatever it is) is: " + req.query.code);
            // code is set
            // we'll send that and get the access token
            graph.authorize({
                "client_id":      authConf.facebook.clientID,
                "redirect_uri":   authConf.facebook.redirectUri,
                "client_secret":  authConf.facebook.clientSecret,
                "code":           req.query.code
            }, function (err, facebookRes) {
                console.log("redirect to user has logged in");
                res.redirect('/UserHasLoggedIn');
            });
        }
    });

    // user gets sent here after being authorized
    router.get('/UserHasLoggedIn', function(req, res) {
        console.log("Facebook account worked!");
        var fboptions = {
            timeout:  3000
            , pool:     { maxSockets:  Infinity }
            , headers:  { connection:  "keep-alive" }
        };

        var reqParam = {
            fields:"type,caption,description,link"
        };
        graph.setOptions(fboptions).get("/me/feed", reqParam, function(err, res) {
            console.log(res);
        });
    });

    // Gmail
    router.use('/auth/gmail', function() {
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

    router.get('/slack_oauth', (req, res, next) => {
        // talk to slack here
        console.log("/slack");
        var url = 'https://slack.com/oauth/authorize?client_id='
            + authConf.slack.clientID
            + '&scope=' + authConf.slack.scope
            + '&redirect_uri=' + authConf.slack.redirectUri;
        res.redirect(url);
    });

    router.get('/slack', function(slackReq, slackRes) {
        console.log("in /api/auth/slack");

        var oauthUrl = 'https://slack.com/api/oauth.access?client_id='
            + authConf.slack.clientID
            + '&client_secret=' + authConf.slack.clientSecret
            + '&code=' + slackReq.query.code
            + '&redirect_uri=' + authConf.slack.redirectUri;

        request(oauthUrl, function (err, res, body) {
            console.log("getting access token");
            if (!err && res.statusCode == 200) {
                var info = JSON.parse(body);
                authConf.slack.accessToken = info.access_token;
                var slackWeb = new slackWebClient(authConf.slack.accessToken);

                var channelIDs = [];

                // all public channels
                slackWeb.channels.list(function(channelListErr, channelListInfo) {
                    if (channelListErr || !channelListInfo.ok) {
                        console.error('Error: Unable to retrieve public channel list.');
                    } else {
                        for (var i in channelListInfo.channels) {
                            slackWeb.channels.history(channelListInfo.channels[i].id, function(channelHistErr, channelHistInfo) {
                                if (channelHistErr || !channelHistInfo.ok) {
                                    console.error('Error: Unable to retrieve messages for channel with ID: ' + channelListInfo.channels[i].id);
                                } else {
                                    console.log(channelHistInfo.messages);
                                }
                            });
                        }
                    }
                });

                // all direct messages
                slackWeb.im.list(function(imListErr, imListInfo) {
                    if (imListErr || !imListInfo.ok) {
                        console.error('Error: Unable to retrieve direct message list.');
                    } else {
                        for (var i in imListInfo.ims) {
                            slackWeb.im.history(imListInfo.ims[i].id, function(imHistErr, imHistInfo) {
                                if (imHistErr || !imHistInfo.ok) {
                                    console.error('Error: Unable to retrieve messages for direct message with ID: ' + imListInfo.ims[i].id);
                                } else {
                                    console.log(imHistInfo.messages);
                                }
                            });
                        }
                    }

                });

                // all group direct messages
                slackWeb.mpim.list(function(mpimListErr, mpimListInfo) {
                    if (mpimListErr || !mpimListInfo.ok) {
                        console.error('Error: Unable to retrieve group direct message list.');
                    } else {
                        for (var i in mpimListInfo.groups) {
                            slackWeb.mpim.history(mpimListInfo.groups[i].id, function(mpimHistErr, mpimHistInfo) {
                                if (mpimHistErr || !mpimHistInfo.ok) {
                                    console.error('Error: Unable to retrieve messages for group direct message with ID: ' + mpimHistInfo.groups[i].id);
                                } else {
                                    console.log(mpimHistInfo.messages);
                                }
                            });
                        }
                    }
                });
            } else {
                console.error('Error: ' + err.message);
            }
        });
        slackRes.redirect('https://lynxapp.me');
    });

    router.get('/slack_incoming', function(req, res) {
        // This is used to respond to slack challenges. Saved in case
        // the verification expires in the future.
        if (req.method === 'POST') {
            res.type('html');
            res.status(200).send(req.body.challenge);
            console.log(req.body);


            console.log(req.body.event);
        }
    });



	return router;
};
