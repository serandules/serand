var log = require('logger')('serand');
var nconf = require('nconf');
var async = require('async');
var request = require('request');
var mongoose = require('mongoose');
var _ = require('lodash');

var utils = require('utils');

var cdn = nconf.get('CDN_STATICS');

exports.index = function (id, revision, done) {
  var url = cdn + '/' + id + '/' + revision + '/' + id + '/index.html';
  log.info('index:url', 'id:%s, url:%s', id, url);
  request(url, function (err, res, body) {
    done(err, body);
  });
};

exports.boots = function (names, done) {
  exports.configs(['boot', 'groups', 'menus', 'aliases'].concat(names), function (err, configs) {
    if (err) {
      return done(err);
    }
    exports.configs(Object.keys(configs.menus), function (err, menus) {
      if (err) {
        return done(err);
      }
      done(null, _.assign(configs, menus));
    });
  });
};

exports.configs = function (names, done) {
  var o = {};
  async.each(names, function (name, eachDone) {
    utils.client(function (err, client) {
      if (err) {
        return done(err);
      }
      utils.cached('configs:' + client.user + ':' + name, function (err, value) {
        if (err) return eachDone(err);
        if (value) {
          o[name] = JSON.parse(value);
          return eachDone();
        }
        var Configs = mongoose.model('configs');
        Configs.findOne({
          user: client.user,
          name: name
        }, {value: 1}, function (err, config) {
          if (err) {
            return eachDone(err);
          }
          config = utils.json(config);
          o[name] = config.value;
          eachDone();
        });
      });
    });
  }, function (err) {
    if (err) {
      return done(err);
    }
    done(null, o);
  });
};
