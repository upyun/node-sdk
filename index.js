var fs = require('fs');
var http = require('http');

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


module.exports = exports.UPYUN = UPYUN;