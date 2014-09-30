'use strict';
var UPYUN = require('..');
var should = require('should');

describe('API Version: ', function() {
    it('should return instance with legacy API', function() {
        var upyun = new UPYUN('travis', 'travisci', 'testtest', 'v3', 'legacy');
        upyun._apiVersion.should.be.exactly('legacy');
    });

    it('should return instance with latest API', function() {
        var upyun = new UPYUN('travis', 'travisci', 'testtest', 'v3', 'latest');
        upyun._apiVersion.should.be.exactly('latest');
    });
});
