var express = require('express');
var _ = require('lodash');
var request = require('request');
var fs = require('fs');
var graph = require('fbgraph');
var slackWebClient = require('@slack/client').WebClient;
var authTokens = require(__base + 'secret/auth-tokens.json');

// put stuff here

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
        'scope': 'channels%3Ahistory+channels%3Aread+im%3Aread+im%3Ahistory+mpim%3Aread+mpim%3Ahistory',
        'redirectUri' : 'https://lynxapp.me/api/auth/slack'
    }
};

module.exports.Router = function () {
	var router = express.Router();

    router.get('/slack_oauth', (req, res, next) => {
        // talk to slack here
        console.log("/slack");
        var url = 'https://slack.com/oauth/authorize?client_id='
            + authConf.slack.clientID
            + '&scope=' + authConf.slack.scope
            + '&redirect_uri=' + authConf.slack.redirectUri;
        res.redirect(url);
    });

    // Facebook webhook
    router.get('/api/fbwebhook', function(req, res) {
        if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
            console.log("Validating webhook");
            res.status(200).send(req.query['hub.challenge']);
        } else {
            console.error("Failed validation. Make sure the validation tokens match.");
            res.sendStatus(403);
        }
    });

    router.get('/auth/facebook', function(req, res) {
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
    router.get('/UserHasLoggedIn', function(req, res) {
        console.log("Facebook account worked!");
        graph.setOptions(options).get("/me/feed", reqParam, function(err, res) {
            console.log(res);
        });
    });

    /* Parses a string and returns an array of links if there are any. */
    function regParser(text) {
        // Resource: https://gist.github.com/dperini/729294
        // Mmight need to remove escape slashes
        var re = new RegExp('^(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$');
        var words = text.split().map(function(word) {
            word.replace('<>', '');
        });
        var links = [];
        var results = {};
        var url = 'https://info344api.enamarkovic.com/v1/summary?url=';
        for (var word in words) {
            // if it is a link, we will call the link summary API
            if (re.test(word)) {
                request(url + word, function (error, response, body) {
                    var JSONresponse = JSON.parse(body);
                    if (!JSONresponse.ok){
                        console.log(JSONresponse);
                        res.send("Error encountered: \n"+JSON.stringify(JSONresponse)).status(200).end();
                    } else {
                        console.log(JSONresponse);
                        res.send("Success!");
                    }
                });
                // links.append(word);
            }
        }
        return results;
    }

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


        // console.log(channelIDs);
        //
        // slackWeb.channels.history(function(err, info) {
        //     if (err) {
        //         console.error('Error: Unable to retrieve channel messages.');
        //     } else {
        //         for (var i in info.) {
        //
        //         }
        //     }
        // });
    });

    //     var channelListUrl = 'https://slack.com/api/channels.list?token='
    //         + authConf.slack.accessToken;
    //
    //     request(channelListUrl, function(err, res, body) {
    //         console.log("getting channels");
    //         if (!err && res.statusCode === 200) {
    //             var info = JSON.parse(body);
    //             console.log("channels: " + info.channels);
    //         }
    //     });
    //
    //     var messagesUrl = 'https://slack.com/api/channels.history?token='
    //         + authConf.slack.accessToken;
    //
    //     request(messagesUrl, function(err, res, body) {
    //         console.log("getting last 100 messages");
    //         if (!err && res.statusCode === 200) {
    //             var info = JSON.parse(body);
    //             console.log(info);
    //             console.log("messages: " + info.messages);
    //         }
    //     });
    // });

    router.get('/auth/slack_incoming', function(req, res) {
        if (req.method === 'POST') {
            res.type('html');
            res.status(200).send();
            console.log(req.body);
            console.log(req.body.event);
            console.log(req.body.event.text);
        }
    });

	return router;
};