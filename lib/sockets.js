var socket = require('socket.io');
var _ = require('underscore');
var rClient = require('./redis-client');

module.exports.listen = function (server) {
  var users = [];

  io = socket(server);

  io.on('connection', function (socket) {
    console.log("new connection");

    socket
      .on('nickname-setted', function (user) {
        users.push(user);
        socket.broadcast.emit('new-user-joined', user);
      })
      .on('chat-msg', function(userMsg) {
        socket.broadcast.emit('chat-msg', userMsg);
      });
  });

  return io;
};