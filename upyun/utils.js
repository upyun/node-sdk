'use strict';
var crypto = require('crypto');
var fs = require('fs');
var http = require('http');

var utils = {};

/**
 * Base64 encode / decode
 * http://www.webtoolkit.info/
 **/

utils.Base64 = {
  // private property
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  // public method for encoding
  encode: function(input) {
    var output = "";
    var chr1;
    var chr2;
    var chr3;
    var enc1;
    var enc2;
    var enc3;
    var enc4;
    var i = 0;
    input = this._utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output +
      this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
      this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
    }
    return output;
  },
  // public method for decoding
  decode: function(input) {
    var output = "";
    var chr1;
    var chr2;
    var chr3;
    var enc1;
    var enc2;
    var enc3;
    var enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }
    output = this._utf8_decode(output);
    return output;
  },
  // private method for UTF-8 encoding
  _utf8_encode: function(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  },
  // private method for UTF-8 decoding
  _utf8_decode: function(utftext) {
    var string = "";
    var i = 0;
    var c;
    var c2;
    var c3;
    c = c2 = 0;
    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if ((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  }
};

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

utils.makeSign = function(method, uri, date, length, password, operator) {
  if (uri.indexOf('?') >= 0) {
    uri = uri.split('?')[0];
  }
  var sign = method + '&' + uri + '&' + date + '&' + length + '&' + utils.md5sum(password);
  return 'UpYun ' + operator + ':' + utils.md5sum(sign);
};

utils.genReqOpts = function(thisArg, method, remotePath, length, custom) {
  var headers = custom || {};
  var date = (new Date()).toGMTString();

  if (remotePath.indexOf('/') !== 0) {
    remotePath = '/' + remotePath;
  }

  // preifx remotePath sub dir with '/' if not exists
  var t = remotePath.split(thisArg._conf.bucket);
  if (t.length >= 2 && t[1] !== undefined && t[1].indexOf('/') !== 0) {
    t[1] = '/' + t[1];
  }
  remotePath = t.join(thisArg._conf.bucket);

  var contentLength = length || 0;
  headers['Content-Length'] = contentLength;
  headers.Date = date;
  headers.Authorization = utils.makeSign(method, remotePath, date, contentLength, thisArg._conf.password, thisArg._conf.operator);
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
  if (res.statusCode >= 400) {
    res.data = JSON.parse(res.data || '{}');
  }

  return res;
};

utils.request = function(options, fileToUpload, fileDownloadTo, callback) {
  var resData = '';

  var req = http.request(options, function(res) {
    if (fileDownloadTo) {
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
      res.on('data', function(chunk) {
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

  if (fileToUpload instanceof Buffer) {
    req.write(fileToUpload);
    req.end();
  } else if (fileToUpload && fs.existsSync(fileToUpload)) {
    var rs = fs.createReadStream(fileToUpload);
    rs.pipe(req, {
      end: false
    });
    rs.on('close', function() {
      req.end();
    });
  } else {
    req.end();
  }

  req.on('error', function(err) {
    callback(err);
  });
};

module.exports = exports.utils = utils;
