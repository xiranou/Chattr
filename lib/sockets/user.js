var redis = require('../../config/initializers/redis');
var async = require('async');

module.exports = function (io, socket) {
    var userIo = io.of('/user');
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
                // emit join message to all users
                userIo.emit('new-user-joined', user);
            })
            .on('chat-msg', function (userMsg) {
                socket.broadcast.emit('chat-msg', userMsg);
            })
            .on('user-inputting', function (userTyping) {
                socket.broadcast.emit('user-inputting', userTyping);
            });
    });
};