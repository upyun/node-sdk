'use strict';
var upyun = require('./upyun/api.js');

module.exports = exports.UpYun = function(bucket, operator, password, endpoint) {
    return new upyun(bucket, operator, password, endpoint);
}
