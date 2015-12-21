var express = require('express'),
    router = express.Router();

var redis = require('../../lib/redis-client');
var async = require('async');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/', function (req, res, next) {
    res.render('index', { title: 'Chattr' });
});

module.exports.respond = function (userIo, socket) {
    userIo.on('connection', function (socket) {

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
            ],
            function (err, replies) {
                if (err) throw err;
                var response = {
                    clients: replies[2],
                    disClient: JSON.parse(replies[0])
                    //redis.hget returns string, parse back to object
                };
                socket.broadcast.emit('client-disconnected', response);
            });
          })
          .on('nickname-setted', function (user) {
            redis.hset('clients', socket.id, JSON.stringify(user));
            userIo.emit('new-user-joined', user);
          })
          .on('chat-msg', function (userMsg) {
            socket.broadcast.emit('chat-msg', userMsg);
          });
  });
};