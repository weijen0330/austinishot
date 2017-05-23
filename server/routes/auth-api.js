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
        'clientID' : authTokens.fbClientID, // also refer to as app-ID
        'clientSecret' : authTokens.fbClientSecret,
        'scope' : 'email, public_profile, user_friends, user_posts',
        'redirectUri' :   'https://lynxapp.me/api/auth/facebook'
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

    router.get('/facebook_oauth', function(req, res) {
        var oauthUrl = 'https://www.facebook.com/v2.9/dialog/oauth?client_id='
            + authConf.facebook.clientID
            + '&scope=' + authConf.facebook.scope
            + '&redirect_uri=' + authConf.facebook.redirectUri;
        res.redirect(oauthUrl);
    });

    router.get('/facebook', function(facebookReq, facebookRes) {
        // we don't have a code yet
        // so we'll redirect to the oauth dialog

        var apiTokenUrl = 'https://graph.facebook.com/v2.9/oauth/access_token?client_id='
            + authConf.facebook.clientID
            + '&redirect_uri=' + authConf.facebook.redirectUri
            + '&client_secret=' + authConf.facebook.clientSecret
            + '&code=' + facebookReq.query.code;
        console.log("in facebook");

        request(apiTokenUrl, function (err, res, body) {
            if (!err && res.statusCode == 200) {
                var info = JSON.parse(body);
                graph.setAccessToken(info.access_token);

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

            } else {
                console.error('Facebook API call error: ' + err);
            }
        });
        facebookRes.redirect('https://lynxapp.me');
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
        var oauthUrl = 'https://slack.com/oauth/authorize?client_id='
            + authConf.slack.clientID
            + '&scope=' + authConf.slack.scope
            + '&redirect_uri=' + authConf.slack.redirectUri;
        res.redirect(oauthUrl);
    });

    router.get('/slack', function(slackReq, slackRes) {
        console.log("in /api/auth/slack");

        var apiTokenUrl = 'https://slack.com/api/oauth.access?client_id='
            + authConf.slack.clientID
            + '&client_secret=' + authConf.slack.clientSecret
            + '&code=' + slackReq.query.code
            + '&redirect_uri=' + authConf.slack.redirectUri;

        request(apiTokenUrl, function (err, res, body) {
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
                console.error('Slack API call error: ' + err);
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
