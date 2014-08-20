var crypto = require('crypto');
var fs = require('fs');
var http = require('http');

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

utils.request = function(options, localFile, callback) {
    var resData = '';
    var err = {};
    
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            resData += chunk;
        });
        res.on('end', function() {
            // TODO: more error handles
            if(res.statusCode > 400) {
                try {
                    err = JSON.parse(resData || '{}');
                }
                catch(e) {
                    return callback(null, e);
                } 
                var result = {
                    statusCode: res.statusCode,
                    error: err,
                    headers: res.headers
                };
                callback(null, result);
            } else {
                callback(null, {
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: resData
                });
            }
        });
        res.on('error', function(e) {
            callback(e);
        })
    });

    if(localFile && fs.existsSync(localFile)) {
        var rs = fs.createReadStream(localFile);
        rs.pipe(req, {end: false});
        rs.on('close', function() {
            req.end();
        });
    } else if(localFile) {
        req.write(localFile);
        req.end();
    } else {
        req.end();
    }

    req.on('error', function(err) {
        callback(err);
    });
}

module.exports = exports.utils = utils;