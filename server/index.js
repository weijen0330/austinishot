// if "EADDRINUSE", do: $ sudo kill $(sudo lsof -t -i:80)
global.__base = __dirname + '/';

var db = require('./db');
var app = require('./app');

db.init().then(connection => {
	app.start(connection);
});