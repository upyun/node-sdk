'use strict';
var upyunDeprecated = require('upyun-legacy');
var upyun = require('./upyun/api.js');

module.exports = exports.UPYUN = exports.UpYun = function(bucket, operator, password, endpoint, opts) {
  var client = null;

  if (opts && opts.apiVersion == 'v2') {
    client = new upyun(bucket, operator, password, endpoint, opts);
  } else {
    client = new upyunDeprecated(bucket, operator, password, endpoint);
  }

  client._apiVersion = opts.apiVersion;

  return client;
};
