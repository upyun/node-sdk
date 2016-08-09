'use strict';
var fs = require('fs');
var urllib = require('urllib');
var formstream = require('formstream');

var utils = require('./utils');
var pkg = require('../package.json');


function UpYun(bucket, operator, password, endpoint, opts) {
  this._conf = {
    bucket: bucket,
    operator: operator,
    password: password,
    endpoint: endpoint || 'v0.api.upyun.com',
    version: pkg.version
  };

  if (opts && opts.secret) {
    this._conf.secret = opts.secret;
  }
}

UpYun.prototype.setEndpoint = function(endpoint) {
  this._conf.endpoint = endpoint;
};

UpYun.prototype.usage = function(callback) {
  var options = utils.genReqOpts(this, 'GET', this._conf.bucket + '/?usage');
  utils.request(options, null, null, function(err, result) {
    if (err) {
      return callback(err);
    }
    callback(null, utils.parseRes(result));
  });
};

UpYun.prototype.listDir = function(remotePath, limit, order, iter, callback) {
  if (arguments.length != 5) {
    throw new Error('listDir takes 5 arguments but only ' +
      arguments.length + ' specified.');
  } else if (typeof arguments[arguments.length - 1] !== 'function') {
    throw new Error('No callback specified.');
  }

  var h = {
    'X-List-Limit': limit || 100,
    'X-List-Order': order || 'asc'
  };

  if (iter) {
    h['X-List-Iter'] = iter;
  }

  var options = utils.genReqOpts(this, 'GET', this._conf.bucket + remotePath, null, h);

  utils.request(options, null, null, function(err, result) {
    if (err) {
      return callback(err);
    }
    callback(null, utils.parseRes(result));
  });
};

UpYun.prototype.makeDir = function(remotePath, callback) {
  var options = utils.genReqOpts(this, 'PUT', this._conf.bucket + remotePath,
    0, {
      "Folder": "true"
    });
  utils.request(options, null, null, function(err, result) {
    if (err) {
      return callback(err);
    }
    callback(null, utils.parseRes(result));
  });
};

UpYun.prototype.headFile = function(remotePath, callback) {
  var options = utils.genReqOpts(this, 'HEAD', this._conf.bucket + remotePath);
  utils.request(options, null, null, function(err, result) {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

UpYun.prototype.putFile = function(remotePath, localFile, type, checksum,
  opts, callback) {
  if (arguments.length != 6) {
    throw new Error('putFile takes 6 arguments but only ' +
      arguments.length + ' specified.');
  } else if (typeof arguments[arguments.length - 1] !== 'function') {
    throw new Error('No callback specified.');
  }

  var _self = this;
  var isBuffer = localFile instanceof Buffer;
  opts = opts || {};

  if (!isBuffer && !fs.existsSync(localFile)) {
    return callback("can not find local file " + localFile);
  }

  if (type) {
    opts['Content-Type'] = type;
  }

  var contentLength;
  if (isBuffer) {
    contentLength = localFile.length;
  } else {
    contentLength = fs.statSync(localFile).size;
  }

  if (checksum) {
    if (isBuffer) {
      opts['Content-MD5'] = utils.md5sum(localFile);
      _upload(contentLength, opts);
    } else {
      utils.md5sumFile(localFile, function(err, result) {
        opts['Content-MD5'] = result;
        _upload(contentLength, opts);
      });
    }
  } else {
    _upload(contentLength, opts);
  }

  function _upload(contentLength, opts) {
    var options = utils.genReqOpts(_self, 'PUT',
      _self._conf.bucket + remotePath, contentLength, opts);

    utils.request(options, localFile, null, function(err, result) {
      if (err) {
        return callback(err);
      }
      callback(null, utils.parseRes(result));
    });
  }
};

UpYun.prototype.getFile = function(remotePath, localPath, callback) {
  if (arguments.length != 3) {
    throw new Error('getFile takes 3 arguments but only ' +
      arguments.length + ' specified.');
  } else if (typeof arguments[arguments.length - 1] !== 'function') {
    throw new Error('No callback specified.');
  }

  var options = utils.genReqOpts(this, 'GET', this._conf.bucket + remotePath);

  utils.request(options, null, localPath, function(err, result) {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

UpYun.prototype.deleteFile = function(remotePath, callback) {
  var options = utils.genReqOpts(this, 'DELETE', this._conf.bucket + remotePath);

  utils.request(options, null, null, function(err, result) {
    if (err) {
      return callback(err);
    }
    callback(null, utils.parseRes(result));
  });
};

UpYun.prototype.formPutFile = function(localFile, opts, signer, callback) {
  if (arguments.length != 4) {
    throw new Error('putFile takes 4 arguments but only ' +
      arguments.length + ' specified.');
  } else if (typeof arguments[arguments.length - 1] !== 'function') {
    throw new Error('No callback specified.');
  } else if (!opts) {
    throw new Error('No opts specified.');
  }

  if (!this._conf.secret) return callback(new Error('please config secret.'));

  var isBuffer = localFile instanceof Buffer;

  if (!isBuffer && !fs.existsSync(localFile)) {
    return callback("can not find local file " + localFile);
  }

  if (!opts['save-key']) {
    return callback('No save-key specified.');
  }

  if (!opts['bucket']) {
    opts['bucket'] = this._conf.bucket;
  }

  if (!opts['expiration']) {
    opts['expiration'] = Math.round(new Date().getTime() / 1000) + 3600;
  }

  var policy = utils.Base64.encode(JSON.stringify(opts));
  var signature;

  if (signer) {
    signature = signer(policy);
  } else if (this._conf.secret) {
    signature = utils.md5sum(policy + '&' + this._conf.secret);
  } else {
    return callback('can not compute signature');
  }

  var form = formstream();
  form.field('policy', policy);
  form.field('signature', signature);
  if (isBuffer) {
    form.buffer('file', localFile, 'file');
  } else {
    form.file('file', localFile);
  }

  var headers = form.headers();
  headers['User-Agent'] = 'UPYUN Node SDK v' + this._conf.version;
  urllib.request(this._conf.endpoint + '/' + this._conf.bucket + '/', {
    method: 'POST',
    headers: headers,
    dataType: 'json',
    stream: form
  }, function(err, data, res) {
    if (err) {
      return callback(err);
    }
    callback(null, {
      headers: res.headers,
      statusCode: res.statusCode,
      data: data
    });
  });
};

UpYun.prototype.removeDir = UpYun.prototype.deleteFile;

module.exports = exports.UpYun = UpYun;
