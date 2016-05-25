'use strict';
var UpYun = require('../');
var should = require('should');

var upyun = new UpYun('travis', 'travisci', 'testtest', 'v0.api.upyun.com', 'v2');
var tempstr = '/' + Math.random().toString().slice(-8);

describe('REST API: ', function() {

    describe('usage(callback)', function() {
        it('should return a result contains space and file', function(done) {
            upyun.usage(function(err, result) {
                result.data.should.be.a.Number;
                done();
            });
        });
    });

    describe('listDir(remotePath, limit, order, iter, callback)', function() {
        it('should return a result contains files', function(done) {
            upyun.listDir('/', 100, 'asc', null, function(err, result) {
                result.statusCode.should.be.exactly(200);
                done();
            });
        });
    });

    describe('makeDir(remotePath, callback)', function() {
        it('should return success code 200', function(done) {
            upyun.makeDir(tempstr, function(err, result) {
                if(err) {
                    throw err;
                }
                result.statusCode.should.be.exactly(200);
                done();
            });
        });
    });

    describe('removeDir(remotePath, callback)', function() {
        it('should return 200', function(done) {
            upyun.removeDir(tempstr, function(err, result) {
                if(err) {
                    throw err;
                }
                result.statusCode.should.be.exactly(200);
                done();
            });
        });
    });

    describe('putFile(remotePath, localFile, type, checksum, [opts], callback)', function() {
        it('should return the uploaded file\'s info', function(done) {
            upyun.putFile('/test' + tempstr, './index.js', 'text/plain', true, null, function(err, result) {
                if(err) {
                    throw err;
                }
                result.statusCode.should.be.exactly(200);
                //result.data.result.should.have.property('');
                done();
            });
        });
    });

    describe('headFile(remotePath, callback)', function() {
        it('should return 200', function(done) {
            upyun.headFile('/test' + tempstr, function(err, result) {
                if(err) {
                    throw err;
                }
                result.statusCode.should.be.exactly(200);
                done();
            });
        });
    });

    describe('getFile(remotePath, null, callback)', function() {
        it('should return file\'s content', function(done) {
            upyun.getFile('/test' + tempstr, null, function(err, result) {
                if(err) {
                    throw err;
                }
                result.statusCode.should.be.exactly(200);
                result.data.should.match(/\'use strict\'/);
                done();
            });
        });
    });

    describe('deleteFile(remotePath, callback)', function() {
        it('should return 200', function(done) {
            upyun.deleteFile('/test' + tempstr, function(err, result) {
                if(err) {
                    throw err;
                }
                result.statusCode.should.be.exactly(200);
                done();
            });
        });
    });

});
