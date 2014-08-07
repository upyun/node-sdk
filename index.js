var fs = require('fs');
var http = require('http');
var querystring = require('querystring');

var utils = require('./lib/utils');
var pkg = require('./package.json');


function UPYUN(bucket, username, password, endpoint) {
    this._conf = {
        bucket : bucket,
        username : username,
        password : password,
        version : pkg.version,
        endpoint : utils.transEndpoint(endpoint)
    }
}

function request(options, callback) {
    var resData = '';
    console.log(options)
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            resData += chunk;  
        });
        res.on('end', function() {
            if(res.statusCode > 200) {
                try {
                    var err = JSON.parse(resData);
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
    });

    req.end();

    req.on('error', function(err) {
        callback(err);
    })
}

UPYUN.prototype.getConf = function(key) {
    if(this._conf[key]) {
        return this._conf[key];
    } else {
        return;
    }
}

UPYUN.prototype.setConf = function(key, value) {
    this._conf[key] = value;
}

UPYUN.prototype.setEndpoint = function(ep) {
    this._conf.endpoint = utils.transEndpoint(ep);
}

UPYUN.prototype.getUsage = function(callback) {
    var options = utils.genReqOpts(this, 'GET', this._conf.bucket + '?usage=true');
    request(options, function(err, result) {
        if(err) return callback(err);
        callback(null, result);
    })
}

UPYUN.prototype.listDir = function(remotePath, limit, order, iter, callback) {
    if(typeof arguments[arguments.length - 1] !== 'function') {
        throw new Error('No callback specified.')
    };

    callback = arguments[arguments.length - 1];
    
    var query = querystring.stringify({
        limit: limit || '',
        order: order || '',
        iter: iter || ''
    });

    var options = utils.genReqOpts(this, 'GET', this._conf.bucket + remotePath + "?" + query);

    request(options, function(err, result) {
        if(err) return callback(err);
        callback(null, result);
    })
}

module.exports = exports.UPYUN = UPYUN;