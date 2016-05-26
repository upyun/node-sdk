'use strict';
var upyunDeprecated = require('upyun-legacy');
var rest = require('./upyun/rest.js');

module.exports = exports.UPYUN = exports.UpYun = function(bucket, operator, password, endpoint, apiVersion) {
    var client = null;
    if(apiVersion == 'v2') {
        return new rest(bucket, operator, password, endpoint);
    } else {
        client = new upyunDeprecated(bucket, operator, password, endpoint);
    }

    client._apiVersion = apiVersion;

    return client;
}
