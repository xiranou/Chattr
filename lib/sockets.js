var socket = require('socket.io');

module.exports.listen = function (server) {
    io = socket(server);

    io.on('connection', function (socket) {
      console.log("new connection");

      socket.on('chat-msg', function(msg) {
          socket.broadcast.emit('chat-msg', msg);
      });
    });

    return io;
};