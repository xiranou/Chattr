var socket = require('socket.io');
var redis = require('./redis-client');
var async = require('async');

module.exports.listen = function (server) {

  io = socket(server);

  var userNS = io.of('/user');

  userNS.on('connection', function (socket) {
    redis.hgetall('clients', function (err, reply) {
      socket.emit('client-connected', {clients: reply, socketId: socket.id});
    });

    socket
      .on("disconnect", function () {
        async.series([
          function (callback) {
            redis.hget('clients', socket.id, callback);
          },
          function (callback) {
            redis.hdel('clients', socket.id, callback);
          },
          function (callback) {
            redis.hgetall('clients', callback);
          }
        ], function (err, replies) {
          if (err) throw err;
          socket.broadcast.emit('client-disconnected', {clients: replies[2], disClient: replies[0]});
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