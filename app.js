var express = require('express'),
  config = require('./config/config');

var app = express();

require('./config/express')(app, config);

var server = require('http').createServer(app);

var io = require('./lib/sockets').listen(server);

server.listen(config.port, function () {
  console.log('Express server listening on port ' + config.port);
});
