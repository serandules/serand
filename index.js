var log = require('logger')('serand');
var nconf = require('nconf');
var request = require('request');

var Users = require('model-users');
var Groups = require('model-groups');

var cdn = nconf.get('cdn');

var adminEmail = 'admin@serandives.com';

var users = {};

var groups = {};

var findUser = function (email, done) {
    var user = users[email];
    if (user) {
        return done(null, user);
    }
    Users.findOne({email: email}, function (err, user) {
        if (err) {
            return done(err)
        }
        users[email] = user;
        done(null, user);
    });
};

var findGroup = function (user, name, done) {
    var o = groups[user] || (groups[user] = {});
    var group = o[name];
    if (group) {
        return done(null, group);
    }
    Groups.findOne({user: user, name: name}, function (err, group) {
        if (err) {
            return done(err)
        }
        o[name] = group;
        done(null, group);
    });
};

module.exports.index = function (id, revision, done) {
    var url = cdn + '/' + id + '/' + revision + '/' + id + '/index.html';
    request(url, function (err, res, body) {
        done(err, body);
    });
};

module.exports.group = function (name, done) {
    findUser(adminEmail, function (err, user) {
        if (err) {
            return done(err);
        }
        findGroup(user.id, name, done);
    });
};

var Error = function (o) {
    this.status = o.status;
    this.data = o.data;
};

exports.Error = Error;