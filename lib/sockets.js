var socket = require('socket.io');
var homeCtrl = require('../app/controllers/home');

module.exports.listen = function (server) {

  io = socket(server);

  var userIo = io.of('/user');

  homeCtrl.respond(userIo, socket);

  return io;
};