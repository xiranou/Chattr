var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development',
    port = process.env.PORT || 3000;

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'chattr'
    },
    port: port,
  },

  test: {
    root: rootPath,
    app: {
      name: 'chattr'
    },
    port: port,
  },

  production: {
    root: rootPath,
    app: {
      name: 'chattr'
    },
    port: port,
  }
};

module.exports = config[env];
