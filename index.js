var log = require('logger')('serand');
var nconf = require('nconf');
var request = require('request');

var cdn = nconf.get('CDN');

module.exports.index = function (id, revision, done) {
    var url = cdn + '/' + id + '/' + revision + '/' + id + '/index.html';
    request(url, function (err, res, body) {
        done(err, body);
    });
};

var Error = function (o) {
    this.status = o.status;
    this.data = o.data;
};

exports.Error = Error;