const express = require('express');
const _ = require('lodash');
const request = require('request');
const requestProm = require('request-promise');
const fs = require('fs');
const base64url = require('base64url');
const URL = require('url').URL

const google = require('googleapis');
const googleAuth = require('google-auth-library');

const slackWebClient = require('@slack/client').WebClient;

const graph = require('fbgraph');

const authTokens = require(__base + 'secret/auth-tokens.json');
const authConf = {
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

const oauth2 = google.auth.OAuth2;
const oauth2Client = new oauth2(
    authConf.gmail.clientID,
    authConf.gmail.clientSecret,
    authConf.gmail.redirectUri
);

module.exports.Router = function (MessageDB, socketIo) {
	const router = express.Router();

    // Parses a string and returns an array of links if there are any.
    // @param {string} text - the text to be processed.
    function regParser(message) {
        // Resource: https://gist.github.com/dperini/729294
        // defensive
        if (message) {            
            // Slack puts brackets around their links, so we need to remove them.
            const words = message.replace(/[<>]/g,'').split(' ');

            const urls = [];

            for (i = 0; i < words.length; i++) {
                console.log('The word is: ' + words[i]);
                                
                // if it is a link, we will call the link summary API
                try {
                    const url = new URL(words[i])
                    urls.push(url);
                } catch (e) {
                    console.log("not a link")
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
            platform: linkInfo.platform,
            sender: linkInfo.sender,
            timeStamp: linkInfo.timeStamp,
            domain: url.hostname,
            note: linkInfo.bodyText,
            type: "article",
            title: "",
            description: "",
            imgUrl: "",

        }
        
        const prefix = 'https://info344api.enamarkovic.com/v1/summary?url=';
        return requestProm(prefix + url.href).then(body => {                
            const urlData = JSON.parse(body)
            linkSummary.type = urlData.type ? urlData.type : ""
            linkSummary.title = urlData.title ? urlData.title : ""
            linkSummary.description = urlData.description ? urlData.description : ""
            linkSummary.imgUrl = urlData.image ? urlData.image : ""                
        }).catch(err => {
            console.error(err)
        }).then(() => linkSummary)        
    }

    function addMessageToDB(userId, messageData) {
        /*
        messageData = {
			url -> url that was sent in the message
			platform -> platform it came from
			domain -> url's domain name
			title -> from 344 api, title of article
			description -> from 344 api, description of article
			url -> link url
			imgUrl -> from 344 api, image in article
			sender -> who sent the link 
			note -> the text of the message
			timeStamp -> string timestamp of when the message was sent
            type
		}
        */
    }


    // Facebook oauth: https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow
    router.get('/facebook_oauth', function(req, res) {
        const oauthUrl = 'https://www.facebook.com/v2.9/dialog/oauth?client_id='
            + authConf.facebook.clientID
            + '&scope=' + authConf.facebook.scope
            + '&redirect_uri=' + authConf.facebook.redirectUri;
        res.redirect(oauthUrl);
    });

    router.get('/facebook', function(facebookReq, facebookRes) {
        // Exchanging an authorization code for an API access token
        const apiTokenUrl = 'https://graph.facebook.com/v2.9/oauth/access_token?client_id='
            + authConf.facebook.clientID
            + '&redirect_uri=' + authConf.facebook.redirectUri
            + '&client_secret=' + authConf.facebook.clientSecret
            + '&code=' + facebookReq.query.code;

        request(apiTokenUrl, function (err, res, body) {
            if (!err && res.statusCode == 200) {
                const info = JSON.parse(body);
                graph.setAccessToken(info.access_token);

                const fboptions = {
                    timeout:  3000
                    , pool:     { maxSockets:  Infinity }
                    , headers:  { connection:  "keep-alive" }
                };

                const reqParam = {
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
        facebookRes.redirect('https://lynxapp.me/app');
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
        const text = req.body.entry[0].changes[0].value;
        const linkinfo = {
            service : 'facebook',
            time: Date.now(),
            sender: ''
        };

        res.status(200).send(regParser(text, linkinfo));
        console.log(req.body.entry[0].changes[0].value);
    });

    // Gmail Oauth: https://developers.google.com/identity/protocols/OAuth2WebServer
    router.get('/gmail_oauth', function(req, res) {
        /* const oauthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id='
        + authConf.gmail.clientID
        + '&redirect_uri' + authConf.gmail.redirectUri
        + '&response_type=code&scope=' + auth.gmail.scope;
        res.redirect(oauthUrl); */
        const oauthUrl = oauth2Client.generateAuthUrl({
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
                const gmail = google.gmail('v1');

                gmail.users.messages.list({auth: oauth2Client, userId: 'me', maxResults: 100}, function(listErr, listRes) {
                    if (listErr) {
                        console.log('The list messages API call returned an error: ' + listErr);
                        return;
                    } else {
                        const emailIDs = listRes.messages;
                        for (const i in emailIDs) {
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
        // When we are done, redirects back the main page
        gmailRes.redirect('https://lynxapp.me/app');
    });

    // Slack Oauth: https://api.slack.com/docs/oauth
    router.get('/slack_oauth', function (req, res, next) {
        const oauthUrl = 'https://slack.com/oauth/authorize?client_id='
            + authConf.slack.clientID
            + '&scope=' + authConf.slack.scope
            + '&redirect_uri=' + authConf.slack.redirectUri;
        res.redirect(oauthUrl);
    });
    
    router.get('/slack', function(slackReq, slackRes) {
        const apiTokenUrl = 'https://slack.com/api/oauth.access?client_id='
            + authConf.slack.clientID
            + '&client_secret=' + authConf.slack.clientSecret
            + '&code=' + slackReq.query.code
            + '&redirect_uri=' + authConf.slack.redirectUri;

        const linkSummaries = [];
        // Send request to Slack server for an API token
        request(apiTokenUrl, function (err, res, body) {
            // If successful, parse the response and save the token so we can call the API multiple times
            if (!err && res.statusCode == 200) {
                const info = JSON.parse(body);
                authConf.slack.accessToken = info.access_token;

                const slackWeb = new slackWebClient(authConf.slack.accessToken);

                // All messages on the public channels
                slackWeb.channels.list(function(channelListErr, channelListInfo) {
                    // Get a list of channels first
                    if (channelListErr || !channelListInfo.ok) {
                        console.log('Error: Unable to retrieve public channel list.');
                    } else {

                        // Use the channel IDs to grab the messages
                        for (i = 0; i < channelListInfo.channels.length; i++) {
                            slackWeb.channels.history(channelListInfo.channels[i].id, function(channelHistErr, channelHistInfo) {

                                if (channelHistErr || !channelHistInfo.ok) {
                                    console.log('Error: Unable to retrieve messages for channel with ID: ' + channelListInfo.channels[i].id);
                                } else {
                                    for (j = 0; j < channelHistInfo.messages.length; j++) {
                                        linkinfo.service = 'slack';
                                        linkinfo.time = channelHistInfo.messages[j].ts;

                                        slackWeb.users.info(channelHistInfo.messages[j].user, function(usersInfoErr, usersInfo) {
                                            if (usersInfoErr || !usersInfo.ok) {
                                                console.log('Error: Unable to identify user while fetching public channel messages.');
                                                linkinfo.from = '';
                                            } else {
                                                linkinfo.from = usersInfo.real_name;
                                            }
                                        });

                                        regParser(channelHistInfo.messages[j], linkinfo);
                                        generat
                                    }
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
                        for (i = 0; i < imListInfo.ims.length; i++) {
                            slackWeb.im.history(imListInfo.ims[i].id, function(imHistErr, imHistInfo) {
                                if (imHistErr || !imHistInfo.ok) {
                                    console.log('Error: Unable to retrieve messages for direct message with ID: ' + imListInfo.ims[i].id);
                                } else {
                                    for (j = 0; j < imHistInfo.messages.length; j++) {


                                        var linkinfo = {
                                            service: 'slack',
                                            time: imHistInfo.messages[j].ts
                                        };

                                        slackWeb.users.info(imHistInfo.messages[j].user, function (usersInfoErr, usersInfo) {
                                            if (usersInfoErr || !usersInfo.ok) {
                                                console.log('Error: Unable to identify user while fetching direct messages.');
                                                linkinfo.from = '';
                                            } else {
                                                linkinfo.from = usersInfo.real_name;
                                            }
                                        });

                                        regParser(imHistInfo.messages[j], linkinfo);
                                        console.log(imHistInfo.messages);
                                    }
                                }
                            });
                        }
                    }
                });

                // all group direct messages
                slackWeb.mpim.list(function(mpimListErr, mpimListInfo) {
                    if (mpimListErr || !mpimListInfo.ok) {
                        console.log('Error: Unable to retrieve group direct message list.');
                    } else {
                        for (i = 0; i < mpimListInfo.groups.length; i++) {
                            slackWeb.mpim.history(mpimListInfo.groups[i].id, function(mpimHistErr, mpimHistInfo) {
                                if (mpimHistErr || !mpimHistInfo.ok) {
                                    console.log('Error: Unable to retrieve messages for group direct message with ID: ' + mpimHistInfo.groups[i].id);
                                } else {
                                    for (j = 0; j < mpimHistInfo.messages.length; j++) {
                                        var linkinfo = {
                                            service: 'slack',
                                            time: mpimHistInfo.messages[j].ts
                                        };

                                        slackWeb.users.info(mpimHistInfo.messages[j].user, function (usersInfoErr, usersInfo) {
                                            if (usersInfoErr || !usersInfo.ok) {
                                                console.log('Error: Unable to identify user while fetching direct messages.');
                                                linkinfo.from = '';
                                            } else {
                                                linkinfo.from = usersInfo.real_name;
                                            }
                                        });

                                        regParser(mpimHistInfo.messages[j], linkinfo);
                                        console.log(mpimHistInfo.messages);
                                    }
                                }
                            });
                        }
                    }
                });
            } else {
                console.error('Slack API call error: ' + err);
            }
        });
        // When we are done, sends back an array of link summaries
        slackRes.status(200).send(linkSummaries);
    });

    router.post('/slack_incoming', function(req, res) {        
        // This is used to respond to slack challenges. Saved in case
        // the verification expires in the future.
        // res.type('html');
        // res.status(200).send(req.body.challenge);
        //
        // event:
        //        { type: 'message',
        //          user: 'U50SS1PLJ',
        //          text: 'denver',
        //          ts: '1495684015.632873',
        //          channel: 'D51MCEQ1M',
        //          event_ts: '1495684015.632873' },    
        

        if (req.body.event.text) {            

            var info =  req.body.event;

            var linkInfo = {
                //sender
                platform : 'slack',
                timeStamp: info.event_ts,
                bodyText: info.text
            };

            const slackWeb = new slackWebClient(authConf.slack.accessToken);

            // identify the user through the Slack API
            slackWeb.users.info(info.user, function(usersInfoErr, usersInfo) {
                if (usersInfoErr || !usersInfo.ok) {
                    console.log('Error: Unable to identify user.');
                    linkInfo.sender = '';
                } else {
                    linkInfo.sender = usersInfo.name;
                }

                // parsed data will be the urls 
                let links = regParser(req.body.event.text, linkInfo)            
                if (links.length > 0) {
                    // send the urls through 344 handler
                    // generate link summary is expecting url object ( new URL() )
                    generateLinkSummary(links[0], linkInfo).then(linkSummary => {
                        // add the message to the database
                        console.log("link summary:", linkSummary)
                        return MessageDB.insertMessage(1, linkSummary)
                    }).then((messageId) => {
                        console.log(messageId)

                        socketIo.emit("new_message", {message: messageId})

                        // send the added message back to the user through web socket
                        // this should broadcast to users       
                        res.status(200).send(messageId);
                    }).catch(console.log)
                } else {
                    res.status(200).send("did not have a link");
                }           
                                                
                                         
            });
/*
            if (info.channel) {
                slackWeb.channels.info(info.channel, function(channelInfoErr, channelInfo) {
                    if (channelInfoErr || !channelInfo.ok) {
                        console.log('Error: Unable to identify channel.');
                        linkinfo.channel_name = '';
                    } else {
                        linkinfo.channel_name = channelInfo.channel.name;
                    }
                });
            }   
*/         
        } else {
            res.status(200).send("non-text event");
        }
    });

	return router;
};

