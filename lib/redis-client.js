var redis = require('redis');

if (process.env.REDISTOGO_URL) {
  var rtg = require('url').parse(process.env.REDISTOGO_URL);
  var client = redis.createClient(rtg.port, rtg.hostname, {no_ready_check: true});
} else {
  var client = redis.createClient();
}


module.exports = client;