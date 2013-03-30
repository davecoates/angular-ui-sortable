var util = require('util'),
    connect = require('connect'),
    port = 8000;

connect.createServer(connect.static(__dirname)).listen(port);
util.puts('Listening on ' + port + '...');
