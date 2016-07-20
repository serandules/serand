var utils = require('utils');

var bucket = process.env.AWS_S3_CDN_BUCKET || 'cdn.serandives.com'

module.exports.index = function (id, revision, done) {
    var s3 = utils.s3();
    s3.getObject({
        Bucket: bucket,
        Key: id + '/' + revision + '/' + id + '/index.html'
    }, function (err, o) {
        if (err) {
            return done(err);
        }
        done(null, String(o.Body));
    });
};