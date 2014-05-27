var connect = require('connect');
var port = 3005;
console.log('Listening on: ' + port);
connect().use(connect.static(__dirname)).listen(port);
