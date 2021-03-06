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
  names.values = ['boot', 'users', 'groups', 'menus', 'aliases'].concat(names.values || []);
  names.ids = ['vehicle-makes'].concat(names.ids || []);
  exports.configs(names, function (err, o) {
    if (err) {
      return done(err);
    }
    var menus = o.values.menus;
    exports.configs({values: Object.keys(menus)}, function (err, menus) {
      if (err) {
        return done(err);
      }
      _.assign(o.values, menus.values);
      done(null, o);
    });
  });
};

exports.configs = function (o, done) {
  var allValues = {};
  var allIds = {};
  var values = o.values || [];
  var ids = o.ids || [];
  var valuesById = _.keyBy(values);
  var names = values.concat(ids);

  var index = function (name, o) {
    if (valuesById[name]) {
      allValues[name] = o.value;
      return;
    }
    allIds[name] = o.id;
  };

  async.each(names, function (name, eachDone) {
    utils.cached('configs:' + name, function (err, o) {
      if (err) return eachDone(err);
      if (o) {
        index(name, JSON.parse(o));
        return eachDone();
      }
      var Configs = mongoose.model('configs');
      Configs.findOne({
        name: name
      }, function (err, config) {
        if (err) {
          return eachDone(err);
        }
        config = utils.json(config);
        utils.group('public', function (err, pub) {
          if (err) {
            return eachDone(err);
          }
          utils.group('anonymous', function (err, anon) {
            if (err) {
              return eachDone(err);
            }
            var permitted = utils.permitted({groups: [pub.id, anon.id]}, config, 'read');
            if (!permitted) {
              return eachDone();
            }
            index(name, config);
            eachDone();
          });
        });
      });
    });
  }, function (err) {
    if (err) {
      return done(err);
    }
    done(null, {ids: allIds, values: allValues});
  });
};
