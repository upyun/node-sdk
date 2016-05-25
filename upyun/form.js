'use strict';
var urllib = require('urllib');
var formstream = require('formstream');
var fs = require('fs');

var utils = require('./utils');
var pkg = require('../package.json');


function Form(bucket, endpoint) {
    this._conf = {
        bucket : bucket,
        endpoint : endpoint || 'v0.api.upyun.com',
        version : pkg.version
    };
}

Form.prototype.setSecret = function(secret) {
    this._conf.secret = secret;
};

Form.prototype.putFile = function(localFile, opts, signer, callback) {
    if(arguments.length != 4) {
        throw new Error('putFile takes 4 arguments but only ' +
                arguments.length + ' specified.');
    } else if(typeof arguments[arguments.length - 1] !== 'function') {
        throw new Error('No callback specified.');
    } else if(!opts) {
        throw new Error('No opts specified.');
    }

    var _self = this;

    if(!fs.existsSync(localFile)) {
        return callback("can not find local file " + localFile);
    }

    if(!opts['save-key']) {
        return callback('No save-key specified.')
    }

    if(!opts['bucket']) {
        opts['bucket'] = this._conf.bucket;
    }

    if(!opts['expiration']) {
        opts['expiration'] = Math.round(new Date().getTime()/1000) + 3600;
    }

    var policy = utils.Base64.encode(JSON.stringify(opts));
    var signature;

    if(signer) {
        signature = signer(policy)
    } else if(this._conf.secret) {
        signature = utils.md5sum(policy + '&' + this._conf.secret);
    } else {
        return callback('can not compute signature');
    }

    var form = formstream();
    form.field('policy', policy);
    form.field('signature', signature);
    form.file('file', localFile);

    var req = urllib.request(this._conf.endpoint + '/' + this._conf.bucket + '/', {
        method: 'POST',
        headers: form.headers(),
        dataType: 'json',
        stream: form
    }, function (err, data, res) {
        if(err) {
            return callback(err)
        }
        callback(null, {
            headers: res.headers,
            statusCode: res.statusCode, 
            data: data
        })
    });
}

module.exports = exports.Form = Form;
