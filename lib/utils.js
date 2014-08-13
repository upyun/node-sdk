var crypto = require('crypto');
var fs = require('fs');

var pkg = require('../package.json');

var utils = {};

utils.md5sum = function(data) {
    var md5 = crypto.createHash('md5');
    md5.update(data, 'utf8');
    return md5.digest('hex');
}

utils.md5sumFile = function(location, callback) {
    var md5 = crypto.createHash('md5');
    var rs = fs.createReadStream(location);
    rs.on('data', function(d) {
        md5.update(d);
    });
    rs.on('end', function() {
        return callback(null, md5.digest('hex'));
    });
}

utils.makeSign = function(method, uri, date, length, password, username){
    if(uri.indexOf('?') >= 0) uri = uri.split('?')[0];
    var sign = method + '&' + uri + '&' + date + '&' + length + '&' + utils.md5sum(password);
    return 'UpYun ' + username + ':' + utils.md5sum(sign);
}

utils.transEndpoint = function(endpoint) {
    switch((endpoint ? endpoint : '').toLowerCase()) {
        case 'v0':
            return 'v0.api.upyun.com';
        case 'v1':
        case 'ctcc':
            return 'v1.api.upyun.com';
        case 'v2':
        case 'cucc':
            return 'v2.api.upyun.com';
        case 'v3':
        case 'cmcc':
            return 'v3.api.upyun.com';
        default:
            return 'v0.api.upyun.com';
    }
}

utils.makeUa = function() {
    return 'Kid/v' + pkg.version + ' (' + process.platform + '; ' + process.arch + ') ' + 'Node/' + process.version;
}

utils.genReqOpts = function(thisArg, method, remotePath, length, custom) {
    var headers = custom || {};
    var date = (new Date()).toGMTString();
    if(remotePath.indexOf('/') !== 0) remotePath = '/' + remotePath;
    var contentLength = length || 0;
    headers['Content-Length'] = contentLength;
    headers['Date'] = date;
    headers['Authorization'] =  utils.makeSign(method, remotePath, date, contentLength, thisArg._conf.password, thisArg._conf.username);
    headers['Host'] = thisArg._conf.endpoint;
    headers['User-Agent'] = thisArg._conf.userAgent || utils.makeUa();

    var opts = {
        hostname: thisArg._conf.endpoint,
        method: method,
        path: remotePath,
        headers: headers
    };

    return opts;
}

utils.parseRes = function(res) {
    // parse succeed result
    try {
        res.data = JSON.parse(res.data || '{}');
    } catch(e) {
        delete res.data;
        res.error = {
            error_code: 'Kid0001',
            message: 'Response is not a valid json string'
        };
        return res;
    }

    return res;
}

module.exports = exports.utils = utils;