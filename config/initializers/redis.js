var redis = require('redis');

if (process.env.NODE_ENV === 'production') {
  var client = redis.createClient(process.env.REDISTOGO_URL, {no_ready_check: true});
} else {
  var client = redis.createClient();
}


module.exports = client;