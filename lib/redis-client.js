var redis = require('redis');
var client = redis.createClient();

if (process.env.REDISTOGO_URL) {
  var rtg = require('url').parse(process.env.REDISTOGO_URL);
  client = redis.createClient(rtg.port, rtg.hostname);
}


module.exports = client;