'use strict';
var upyunV1 = require('upyun-legacy');
var upyunV2 = require('./lib/api.js');

module.exports = exports.UPYUN = function(bucket, operator, password, endpoint, apiVersion) {
    // wait for the latest api online
    apiVersion = apiVersion || 'legacy';

    var client = null;

    switch(apiVersion.toLowerCase()) {
        case 'legacy':
            client =  new upyunV1(bucket, operator, password, endpoint);
            break;
        case 'latest':
            client =  new upyunV2(bucket, operator, password, endpoint);
            break;
        default:
            client =  new upyunV1(bucket, operator, password, endpoint);
            break;
    }

    client._apiVersion = apiVersion;

    return client;
};
