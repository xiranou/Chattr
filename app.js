var express = require('express'),
  config = require('./config/config');

var app = express();

require('./config/express')(app, config);

var server = app.listen(config.port, function () {
  console.log('Express server listening on port ' + config.port);
});

var io = require('./config/initializers/sockets').listen(server);