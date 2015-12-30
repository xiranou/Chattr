var redis = require('../../config/initializers/redis');
var async = require('async');
var _ = require('lodash');

module.exports = function (io, socket) {
    var userIo = io.of('/user');
    userIo.on('connection', function (socket) {
        redis.hgetall('clients', function (err, reply) {
            var clients = _.map(reply, function (u) {
                return JSON.parse(u);
            });
            socket.emit('client-connected', {clients: clients, socketId: socket.id});
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
                    //redis.hget returns string, parse back to object
                    var clients = _.map(replies[2], function (u) {
                        return JSON.parse(u);
                    });
                    var response = {
                        clients: clients,
                        disClient: JSON.parse(replies[0])
                    };
                    socket.broadcast.emit('client-disconnected', response);
                });
            })
            .on('nickname-setted', function (user) {
                async.series([
                    function (callback) {
                        redis.hset('clients', socket.id, JSON.stringify(user), callback);
                    },
                    function (callback) {
                        redis.hgetall('clients', callback);
                    }
                ], function (err, replies) {
                    var users = _.map(replies[1], function (u) {
                        return JSON.parse(u);
                    });
                    // emit join message to all users
                    userIo.emit('new-user-joined', {users: users, newUser: user});
                });
            })
            .on('chat-msg', function (userMsg) {
                var targetSid = userMsg.targetSid;
                if (targetSid) {
                    socket.broadcast.to(targetSid).emit('private-msg', userMsg);
                } else {
                    socket.broadcast.emit('chat-msg', userMsg);
                }
            })
            .on('user-inputting', function (userTyping) {
                socket.broadcast.emit('user-inputting', userTyping);
            });
    });
};