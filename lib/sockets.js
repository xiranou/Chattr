var socket = require('socket.io');
var redis = require('./redis-client');

module.exports.listen = function (server) {

  io = socket(server);

  var userNS = io.of('/user');

  userNS.on('connection', function (socket) {
    redis.hgetall('clients', function (err, reply) {
      socket.emit('client-connected', {clients: reply, socketId: socket.id});
    });

    socket
      .on("disconnect", function () {
        redis.hdel('clients', socket.id, function (err, reply) {
          redis.hgetall('clients', function (err, reply) {
            socket.broadcast.emit('client-disconnected', reply);
          });
        });
      })
      .on('nickname-setted', function (user) {
        redis.hset('clients', socket.id, JSON.stringify(user));
        userNS.emit('new-user-joined', user);
      })
      .on('chat-msg', function (userMsg) {
        socket.broadcast.emit('chat-msg', userMsg);
      });
  });

  return io;
};