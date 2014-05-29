var connect = require('connect');
var port = 3007;
console.log('Listening on: ' + port);
connect().use(connect.static(__dirname)).listen(port);
