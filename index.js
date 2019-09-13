var log = require('logger')('serand');
var nconf = require('nconf');
var request = require('request');
var mongoose = require('mongoose');
var _ = require('lodash');

var utils = require('utils');

var domain = utils.domain();

var cdn = nconf.get('CDN_STATICS');

module.exports.index = function (id, revision, done) {
  var url = cdn + '/' + id + '/' + revision + '/' + id + '/index.html';
  request(url, function (err, res, body) {
    done(err, body);
  });
};

module.exports.configs = function (names, done) {
  var Clients = mongoose.model('clients');
  Clients.findOne({name: domain}).exec(function (err, client) {
    if (err) {
      return done(err);
    }
    if (!client) {
      return done('No client with name %s can be found.', domain);
    }
    var Configs = mongoose.model('configs');
    Configs.find({
      user: client.user,
      name: {
        $in: names
      }
    }, {name: 1, value: 1}, function (err, configs) {
      if (err) {
        return done(err);
      }
      var o = {};
      configs.forEach(function (config) {
        config = config.toJSON();
        o[config.name] = config.value;
      });
      done(null, o);
    });
  });
};
