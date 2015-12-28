var socket = require('socket.io');
var userSockets = require('../../lib/sockets/user');

module.exports.listen = function (server) {
    io = socket(server);

    userSockets(io, socket);

    return io;
};