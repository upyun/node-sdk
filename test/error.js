'use strict';
var UPYUN = require('..');
var should = require('should');

var upyun = new UPYUN('travis', 'travisci', 'testtest', 'v3', 'latest');

describe('Error handle', function() {
    describe('Sign error', function() {
        it('should return sign error', function(done) {
            upyun._conf.password = 'wrong';
            upyun.getUsage(function(err, result) {
                if(err) {
                    throw err;
                }
                result.error.message.should.match(/sign/);
                done();
            });
        });
    });

    describe('No callback function', function() {
        it('should throw error', function(done) {
            (function() {
                upyun.listDir('');
            }).should.throw();
            done();
        });

        it('should throw error', function(done) {
            (function() {
                upyun.uploadFile('/errortest', 'error error', 'text/plain', true);
            }).should.throw();
            done();
        });
    });
});
