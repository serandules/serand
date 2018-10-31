var log = require('logger')('serand');
var nconf = require('nconf');
var request = require('request');
var _ = require('lodash');

var utils = require('utils');

var Configs = require('model-configs');
var Clients = require('model-clients');

var space = utils.space();

var cdn = nconf.get('CDN');

module.exports.index = function (id, revision, done) {
  var url = cdn + '/' + id + '/' + revision + '/' + id + '/index.html';
  request(url, function (err, res, body) {
    done(err, body);
  });
};

module.exports.configs = function (names, done) {
  Clients.findOne({name: space}).exec(function (err, client) {
    if (err) {
      return done(err);
    }
    if (!client) {
      return done('No client with name %s can be found.', space);
    }
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

var Error = function (o) {
  this.status = o.status;
  this.data = o.data;
};

exports.Error = Error;