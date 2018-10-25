var log = require('logger')('serand');
var nconf = require('nconf');
var request = require('request');

var utils = require('utils');

var Configs = require('model-configs');
var Clients = require('model-clients');

var space = utils.space();

var cdn = nconf.get('CDN');

module.exports.index = function (id, revision, done) {
  Clients.findOne({name: space}).exec(function (err, client) {
    if (err) {
      return done(err);
    }
    if (!client) {
      return done('No client with name %s can be found.', space);
    }
    Configs.findOne({user: client.user, name: 'boot'}, function (err, boot) {
      if (err) {
        return done(err);
      }
      if (!boot) {
        return done('No boot config cannot be found');
      }
      var url = cdn + '/' + id + '/' + revision + '/' + id + '/index.html';
      request(url, function (err, res, body) {
        done(err, boot.id, body);
      });
    });
  });
};

var Error = function (o) {
    this.status = o.status;
    this.data = o.data;
};

exports.Error = Error;