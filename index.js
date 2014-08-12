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

function request(options, localFile, callback) {
    var resData = '';
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            resData += chunk;
        });
        res.on('end', function() {
            // TODO: more error handles
            if(res.statusCode > 400) {
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

    if(localFile && fs.existsSync(localFile)) {
        var rs = fs.createReadStream(localFile);
        rs.pipe(req, {end: false});
        rs.on('close', function() {
            req.end();
        })
    } else if(localFile) {
        req.write(localFile);
        req.end();
    } else {
        req.end();
    }

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
    request(options, null, function(err, result) {
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

    request(options, null, function(err, result) {
        if(err) return callback(err);
        callback(null, result);
    })
}

UPYUN.prototype.createDir = function(remotePath, callback) {
    var options = utils.genReqOpts(this, 'PUT', this._conf.bucket + remotePath, 0, { "X-Type": "folder" });
    request(options, null, function(err, result) {
        if (err) return callback(err);
        callback(null, result);
    })
}

UPYUN.prototype.removeDir = function(remotePath, callback) {
    var options = utils.genReqOpts(this, 'DELETE', this._conf.bucket + remotePath + '?type=folder');
    request(options, null, function(err, result) {
        if (err) return callback(err);
        callback(null, result);
    })
}

UPYUN.prototype.getFileInfo = function(remotePath, callback) {
    var options = utils.genReqOpts(this, 'HEAD', this._conf.bucket + remotePath);
    request(options, null, function(err, result) {
        if(err) return callback(err);
        callback(null, result);
    })
}

UPYUN.prototype.uploadFile = function(remotePath, localFile, type, checksum, opts, callback) {
    var isFile = fs.existsSync(localFile);
    var _self = this;
    opts = opts || {};
    opts['Content-Type'] = type;

    if(isFile && checksum === true) {
        var contentLength = fs.statSync(localFile).size;
        utils.md5sumFile(localFile, function(err, result) {
            opts['Content-MD5'] = result;
            _upload(contentLength, opts);
        })
    } else if(isFile && typeof checksum === 'string') {
        var contentLength = fs.statSync(localFile).size;
        opts['Content-MD5'] = checksum;
        _upload(contentLength, opts);
    } else {
        var contentLength = localFile.length;
        opts['Content-MD5'] = utils.md5sum(localFile);
        _upload(contentLength, opts);
    }

    function _upload(contentLength, opts) {
        var options = utils.genReqOpts(_self, 'PUT', _self._conf.bucket + remotePath, contentLength, opts);

        request(options, localFile, function(err, result) {
            if(err) return callback(err);
            callback(null, result);
        })
    }
}

UPYUN.prototype.downloadFile = function(remotePath, callback) {
    var options = utils.genReqOpts(this, 'GET', this._conf.bucket + remotePath);

    request(options, null, function(err, result) {
        if(err) return callback(err);
        callback(null, result);
    })
}

UPYUN.prototype.removeFile = function(remotePath, callback) {
    var options = utils.genReqOpts(this, 'DELETE', this._conf.bucket + remotePath);

    request(options, null, function(err, result) {
        if(err) return callback(err);
        callback(null, result);
    })
}

module.exports = exports.UPYUN = UPYUN;