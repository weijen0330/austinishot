// if "EADDRINUSE", do: $ sudo kill $(sudo lsof -t -i:80)
global.__base = __dirname + '/';


var app = require('./app')

var dbConfig = require(__base + 'secret/config-db.json');
var MariaSql = require('mariasql');
var bluebird = require('bluebird');
var connection = bluebird.promisifyAll(new MariaSql(dbConfig));


app.start(connection)
