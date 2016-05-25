'use strict';
var crypto = require('crypto');
var fs = require('fs');
var http = require('http');

var utils = {};

utils.md5sum = function(data) {
    var md5 = crypto.createHash('md5');
    md5.update(data, 'utf8');
    return md5.digest('hex');
};

utils.md5sumFile = function(fpath, callback) {
    var md5 = crypto.createHash('md5');
    var rs = fs.createReadStream(fpath);
    rs.on('data', function(d) {
        md5.update(d);
    });
    rs.on('end', function() {
        return callback(null, md5.digest('hex'));
    });
};

utils.makeSign = function(method, uri, date, length, password, operator){
    if(uri.indexOf('?') >= 0) {
        uri = uri.split('?')[0];
    }
    var sign = method + '&' + uri + '&' + date + '&' + length + '&' + utils.md5sum(password);
    return 'UpYun ' + operator + ':' + utils.md5sum(sign);
};

utils.genReqOpts = function(thisArg, method, remotePath, length, custom) {
    var headers = custom || {};
    var date = (new Date()).toGMTString();
    if(remotePath.indexOf('/') !== 0) {
        remotePath = '/' + remotePath;
    }

    var contentLength = length || 0;
    headers['Content-Length'] = contentLength;
    headers.Date = date;
    headers.Authorization =  utils.makeSign(method, remotePath, date, contentLength, thisArg._conf.password, thisArg._conf.operator);
    headers.Host = thisArg._conf.endpoint;
    headers['User-Agent'] = 'UPYUN Node SDK v' + thisArg._conf.version;

    var opts = {
        hostname: thisArg._conf.endpoint,
        method: method,
        path: remotePath,
        headers: headers
    };

    return opts;
};

utils.parseRes = function(res) {
    if(res.statusCode >= 400) {
        res.data = JSON.parse(res.data || '{}');
    }

    return res;
};

utils.request = function(options, fileToUpload, fileDownloadTo, callback) {
    var resData = '';

    var req = http.request(options, function(res) {
        if(fileDownloadTo) {
            var ws = fs.createWriteStream(fileDownloadTo);
            res.pipe(ws);
            ws.on('finish', function() {
                callback(null, {
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: resData
                });
            });
        } else {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                resData += chunk;
            });
            res.on('end', function() {
                callback(null, {
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: resData
                });
            });
        }
    });

    if(fileToUpload && fs.existsSync(fileToUpload)) {
        var rs = fs.createReadStream(fileToUpload);
        rs.pipe(req, {end: false});
        rs.on('close', function() {
            req.end();
        });
    } else if(fileToUpload) {
        req.write(fileToUpload);
        req.end();
    } else {
        req.end();
    }

    req.on('error', function(err) {
        callback(err);
    });
};

module.exports = exports.utils = utils;
