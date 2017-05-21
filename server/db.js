var dbConfig = require(__base + 'secret/config-db.json');
var MariaSql = require('mariasql');
var bluebird = require('bluebird');
var connection = bluebird.promisifyAll(new MariaSql(dbConfig));

module.exports.init = function () {
    return connection.queryAsync('use lynx')
		.catch(err => { 
            if (err) throw err; 
        })
        .then(() => {
            connection.end()
            return connection
        });
};