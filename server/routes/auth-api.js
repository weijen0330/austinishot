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
        'clientSecret' : authTokens.fbClientSecret, // also refer to as app-secret
        'scope' : 'email, public_profile, user_friends, user_posts',
        'redirectUri' : 'https://lynxapp.me/api/auth/facebook'
    },
    'gmail' : {
        'clientID': authTokens.gmailClientID,
        'clientSecret' : authTokens.gmailClientSecret,
        'scope' : ['https://www.googleapis.com/auth/plus.me',
                   'https://www.googleapis.com/auth/gmail.modify'],
        'redirectUri' : 'https://lynxapp.me/api/auth/gmail'
    },
    'slack' : {
        'clientID' : authTokens.slackClientID,
        'clientSecret' : authTokens.slackClientSecret,
        'scope': 'channels%3Ahistory+channels%3Aread+im%3Aread+im%3Ahistory+mpim%3Aread+mpim%3Ahistory',
        'redirectUri' : 'https://lynxapp.me/api/auth/slack'
    }
};

var oauth2 = google.auth.OAuth2;
var oauth2Client = new oauth2(
    authConf.gmail.clientID,
    authConf.gmail.clientSecret,
    authConf.gmail.redirectUri
);

module.exports.Router = function () {
	var router = express.Router();

    /* Parses a string and returns an array of links if there are any. */
    var regParser = function(text) {
        // Resource: https://gist.github.com/dperini/729294
        // Might need to remove escape slashes
        console.log('The test is: ' + text);
        var re = new RegExp('^(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$');
        var words = text.split(' ').map(function(word) {
            word.replace(/[<>]/g,'');
        });
        console.log(words);
        var results = {};
        var url = 'https://info344api.enamarkovic.com/v1/summary?url=';
        for (var word in words) {
            // if it is a link, we will call the link summary API
            if (re.test(word)) {
                console.log("Yep! it's a link!");
                request(url + word, function (error, response, body) {
                    var JSONresponse = JSON.parse(body);
                    if (!error){
                        console.log(JSONresponse);
                    } else {
                        console.log(error);
                    }
                });
            }
        }
        return results;
    };

    // Facebook oauth: https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow
    router.get('/facebook_oauth', function(req, res) {
        var oauthUrl = 'https://www.facebook.com/v2.9/dialog/oauth?client_id='
            + authConf.facebook.clientID
            + '&scope=' + authConf.facebook.scope
            + '&redirect_uri=' + authConf.facebook.redirectUri;
        res.redirect(oauthUrl);
    });

    router.get('/facebook', function(facebookReq, facebookRes) {
        // Exchanging an authorization code for an API access token
        var apiTokenUrl = 'https://graph.facebook.com/v2.9/oauth/access_token?client_id='
            + authConf.facebook.clientID
            + '&redirect_uri=' + authConf.facebook.redirectUri
            + '&client_secret=' + authConf.facebook.clientSecret
            + '&code=' + facebookReq.query.code;

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

                // Grab all the statuses on the feed.
                graph.setOptions(fboptions).get("/me/feed", reqParam, function(err, res) {
                    console.log(res);
                });

            } else {
                console.error('Facebook API call error: ' + err);
            }
        });

        // After we are done, redirect back to the main website.
        facebookRes.redirect('https://lynxapp.me');
    });

    // Facebook webhook: https://developers.facebook.com/docs/graph-api/webhooks
    router.post('/facebook_incoming', function(req, res) {
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
        console.log(req.body.entry[0].changes[0].value);
        res.status(200);

    });

    // Gmail Oauth: https://developers.google.com/identity/protocols/OAuth2WebServer
    router.get('/gmail_oauth', function(req, res) {
        /* var oauthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id='
        + authConf.gmail.clientID
        + '&redirect_uri' + authConf.gmail.redirectUri
        + '&response_type=code&scope=' + auth.gmail.scope;
        res.redirect(oauthUrl); */
        var oauthUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: authConf.gmail.scope
        });
        res.redirect(oauthUrl);
    });

    router.get('/gmail', function(gmailReq, gmailRes) {
        console.log('in /api/auth/gmail');

        oauth2Client.getToken(gmailReq.query.code, function(err, tokens) {
            if (!err) {
                oauth2Client.setCredentials(tokens);
                var gmail = google.gmail('v1');

                gmail.users.messages.list({auth: oauth2Client, userId: 'me', maxResults: 100}, function(listErr, listRes) {
                    if (listErr) {
                        console.log('The list messages API call returned an error: ' + listErr);
                        return;
                    } else {
                        var emailIDs = listRes.messages;
                        for (var i in emailIDs) {
                            gmail.users.messages.get({auth: auth2Client, id: emailIDs[i],userId: 'me'}, function(getErr, getResponse) {
                                if (getErr) {
                                    console.log('The get messages API call returned an error for email with ID: ' + emailIDs[i]);
                                } else {
                                    console.log(getResponse);
                                }
                            });
                        }
                    }
                });
            } else {
                console.log('Getting the API token returned an error: ' + err);
            }
        });

        // request(apiTokenUrl, function (err, res, body) {
        //     if (!err && res.statusCode == 200) {
        //         var info = JSON.parse(body);
        //         graph.setAccessToken(info.access_token);
        //
        //         var fboptions = {
        //             timeout:  3000
        //             , pool:     { maxSockets:  Infinity }
        //             , headers:  { connection:  "keep-alive" }
        //         };
        //
        //         var reqParam = {
        //             fields:"type,caption,description,link"
        //         };
        //
        //         graph.setOptions(fboptions).get("/me/feed", reqParam, function(err, res) {
        //             console.log(res);
        //         });
        //
        //     } else {
        //         console.error('Facebook API call error: ' + err);
        //     }
        // });
        // facebookRes.redirect('https://lynxapp.me');
    });

    // Slack Oauth: https://api.slack.com/docs/oauth
    router.get('/slack_oauth', function (req, res, next) {
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
        // When we are done, redirects back the main page
        slackRes.redirect('https://lynxapp.me');
    });

    router.post('/slack_incoming', function(req, res) {
        // This is used to respond to slack challenges. Saved in case
        // the verification expires in the future.
        // res.type('html');
        // res.status(200).send(req.body.challenge);
        //
        //   event:
        //          { type: 'message',
        //            user: 'U50SS1PLJ',
        //            text: 'denver',
        //            ts: '1495684015.632873',
        //            channel: 'D51MCEQ1M',
        //            event_ts: '1495684015.632873' },
        res.status(200);
        console.log('The test is: ' + req.body.event.text);
        return regParser(req.body.event.text);

    });

	return router;
};
