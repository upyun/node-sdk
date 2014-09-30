'use strict';
var fs = require('fs');
var querystring = require('querystring');

var utils = require('./utils');
var pkg = require('../package.json');


function UPYUN(bucket, operator, password, endpoint) {
    this._conf = {
        bucket : bucket,
        operator : operator,
        password : password,
        version : pkg.version,
        endpoint : utils.transEndpoint(endpoint)
    };
}

UPYUN.prototype.getConf = function(key) {
    if(this._conf[key]) {
        return this._conf[key];
    }
};

UPYUN.prototype.setConf = function(key, value) {
    this._conf[key] = value;
};

UPYUN.prototype.setEndpoint = function(ep) {
    this._conf.endpoint = utils.transEndpoint(ep);
};

UPYUN.prototype.getUsage = function(callback) {
    var options = utils.genReqOpts(this, 'GET', this._conf.bucket + '?usage=true');
    utils.request(options, null, null, function(err, result) {
        if(err) {
            return callback(err);
        }
        callback(null, utils.parseRes(result));
    });
};

UPYUN.prototype.listDir = function(remotePath, limit, order, iter, callback) {
    if(typeof arguments[arguments.length - 1] !== 'function') {
        throw new Error('No callback specified.');
    }

    callback = arguments[arguments.length - 1];

    var query = querystring.stringify({
        limit: limit || '',
        order: order || '',
        iter: iter || ''
    });

    var options = utils.genReqOpts(this, 'GET', this._conf.bucket + remotePath + "?" + query);

    utils.request(options, null, null, function(err, result) {
        if(err) {
            return callback(err);
        }
        callback(null, utils.parseRes(result));
    });
};

UPYUN.prototype.createDir = function(remotePath, callback) {
    var options = utils.genReqOpts(this, 'PUT', this._conf.bucket + remotePath, 0, { "X-Type": "folder" });
    utils.request(options, null, null, function(err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, utils.parseRes(result));
    });
};

UPYUN.prototype.removeDir = function(remotePath, callback) {
    var options = utils.genReqOpts(this, 'DELETE', this._conf.bucket + remotePath + '?type=folder');
    utils.request(options, null, null, function(err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, utils.parseRes(result));
    });
};

UPYUN.prototype.existsFile = function(remotePath, callback) {
    var options = utils.genReqOpts(this, 'HEAD', this._conf.bucket + remotePath);
    utils.request(options, null, null, function(err, result) {
        if(err) {
            return callback(err);
        }
        callback(null, result);
    });
};

UPYUN.prototype.uploadFile = function(remotePath, localFile, type, checksum, opts, callback) {
    if(typeof arguments[arguments.length - 1] !== 'function') {
        throw new Error('No callback specified.');
    }
    callback = arguments[arguments.length - 1];
    var isFile = fs.existsSync(localFile);
    var _self = this;
    opts = opts || {};

    // TODO: default type
    opts['Content-Type'] = type;
    var contentLength = 0;
    checksum = arguments.length > 4 && typeof checksum !== 'function' ? checksum : true;

    // TODO: optimize logical
    if(isFile && checksum === true) {
        contentLength = fs.statSync(localFile).size;
        utils.md5sumFile(localFile, function(err, result) {
            opts['Content-MD5'] = result;
            _upload(contentLength, opts);
        });
    } else if(isFile && typeof checksum === 'string') {
        contentLength = fs.statSync(localFile).size;
        opts['Content-MD5'] = checksum;
        _upload(contentLength, opts);
    } else {
        contentLength = localFile.length;
        opts['Content-MD5'] = utils.md5sum(localFile);
        _upload(contentLength, opts);
    }

    function _upload(contentLength, opts) {
        var options = utils.genReqOpts(_self, 'PUT', _self._conf.bucket + remotePath, contentLength, opts);

        utils.request(options, localFile, null, function(err, result) {
            if(err) {
                return callback(err);
            }
            callback(null, utils.parseRes(result));
        });
    }
};

UPYUN.prototype.downloadFile = function(remotePath, localPath, callback) {
    callback = arguments[arguments.length - 1];
    localPath = arguments.length === 3 && (typeof localPath === 'string') ? localPath :  null;
    var options = utils.genReqOpts(this, 'GET', this._conf.bucket + remotePath);

    utils.request(options, null, localPath, function(err, result) {
        if(err) {
            return callback(err);
        }
        callback(null, result);
    });
};

UPYUN.prototype.removeFile = function(remotePath, callback) {
    var options = utils.genReqOpts(this, 'DELETE', this._conf.bucket + remotePath);

    utils.request(options, null, null, function(err, result) {
        if(err) {
            return callback(err);
        }
        callback(null, utils.parseRes(result));
    });
};

module.exports = exports.UPYUN = UPYUN;
