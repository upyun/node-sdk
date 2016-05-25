'use strict';
var upyunDeprecated = require('upyun-legacy');
var upyun = require('./upyun/api.js');

module.exports = exports.UPYUN = exports.UpYun = function(bucket, operator, password, endpoint, apiVersion) {
    var client = null;
    if(apiVersion === 2) {
        return new upyun(bucket, operator, password, endpoint);
    } else {
        client = new upyunDeprecated(bucket, operator, password, endpoint);
    }

    client._apiVersion = apiVersion;

    return client;
}
