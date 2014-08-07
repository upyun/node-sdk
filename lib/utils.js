var crypto = require('crypto');

function md5sum(data) {
    var md5 = crypto.createHash('md5');
    md5.update(data, 'utf8');
    return md5.digest('hex');
}

function makeSign(method, uri, date, length, password, username){
    if(uri.indexOf('?') >= 0) uri = uri.split('?')[0];
    var sign = method + '&' + uri + '&' + date + '&' + length + '&' + md5sum(password);
    return 'UpYun ' + username + ':' + md5sum(sign);
}

function transEndpoint(endpoint) {
    switch((endpoint ? endpoint : '').toLowerCase()) {
        case 'v0':
            return 'v0.api.upyun.com'
        case 'v1':
        case 'ctcc':
            return 'v1.api.upyun.com';
        case 'v2':
        case 'cucc':
            return 'v2.api.upyun.com';
        case 'v3':
        case 'cmcc':
            return 'v3.api.upyun.com';
        default:
            return 'v0.api.upyun.com';
    }
}

function genReqOpts(thisArg, method, remotePath, localPath, length, custom) {
    var headers = custom || {};
    var date = (new Date()).toGMTString();
    if(remotePath.indexOf('/') !== 0) remotePath = '/' + remotePath;
    var contentLength = length || 0;
    headers['Content-Length'] = contentLength;
    headers['Date'] = date;
    headers['Authorization'] =  makeSign(method, remotePath, date, contentLength, thisArg._conf.password, thisArg._conf.username);
    headers['Host'] = thisArg._conf.endpoint;

    var opts = {
        hostname: thisArg._conf.endpoint,
        method: method,
        path: remotePath,
        headers: headers
    }

    return opts;
}

module.exports = {
    md5sum: md5sum,
    makeSign: makeSign,
    genReqOpts: genReqOpts,
    transEndpoint: transEndpoint
}