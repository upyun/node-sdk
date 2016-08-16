'use strict';
require('should');
var fs = require('fs');
var UpYun = require('../');
var utils = require('../upyun/utils');

var bucket = process.env.UPYUN_BUCKET;
var username = process.env.UPYUN_USERNAME;
var password = process.env.UPYUN_PASSWORD;
var secret = process.env.UPYUN_SECRET;

var upyun = new UpYun(bucket, username, password, 'v0.api.upyun.com',  {
  apiVersion: 'v2',
  secret: secret
});

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

    it('should return a result contains files and can prefix with /', function(done) {
      upyun.listDir('', 100, 'asc', null, function(err, result) {
        result.statusCode.should.be.exactly(200);
        done();
      });
    });
  });

  describe('makeDir(remotePath, callback)', function() {
    it('should return success code 200', function(done) {
      upyun.makeDir(tempstr, function(err, result) {
        if (err) {
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
        if (err) {
          throw err;
        }
        result.statusCode.should.be.exactly(200);
        done();
      });
    });
  });

  describe('putFile(remotePath, localFile, type, checksum, [opts], callback)', function() {
    it('should return the uploaded file\'s info success with localfile', function(done) {
      upyun.putFile('/test' + tempstr, './index.js', 'text/plain', true, null, function(err, result) {
        if (err) {
          throw err;
        }
        result.statusCode.should.be.exactly(200);
        done();
      });
    });

    it('should return the uploaded file\'s info success with chinese code', function(done) {
      upyun.putFile('/test' + tempstr + '中文 空格 字符' + 'end', './index.js', 'text/plain', true, null, function(err, result) {
        if (err) {
          throw err;
        }
        result.statusCode.should.be.exactly(200);
        done();
      });
    });


    it('should return the uploaded file\'s info success with buffer', function(done) {
      upyun.putFile('/test' + tempstr + 'buffer', fs.readFileSync('./index.js'), 'text/plain', true, null, function(err, result) {
        if (err) {
          throw err;
        }
        result.statusCode.should.be.exactly(200);
        done();
      });
    });
  });

  describe('headFile(remotePath, callback)', function() {
    it('should return 200', function(done) {
      upyun.headFile('/test' + tempstr, function(err, result) {
        if (err) {
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
        if (err) {
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
        if (err) {
          throw err;
        }
        result.statusCode.should.be.exactly(200);
        done();
      });
    });
  });

  describe('formPutFile(localFile, opts, callback)', function() {
    it('should return the uploaded file\'s info sucesss with localfile', function(done) {
      var opts = {
        'save-key': '/test' + tempstr + 'diff',
        'Content-Type': 'image/jpg'
      };
      upyun.formPutFile('./test/cat.jpg', opts,
        function(policy) {
          return utils.md5sum(policy + '&' + secret);
        },
        function(err, result) {
          if (err) {
            throw err;
          }
          result.statusCode.should.be.exactly(200);
          result.data.should.have.property('image-type');
          result.headers.should.have.property('x-upyun-width');
          done();
        }
      );
    });

    it('should return the uploaded file\'s info sucesss chinese code', function(done) {
      var opts = {
        'save-key': '/test' + tempstr + '中文 空格 字符',
        'Content-Type': 'image/jpg'
      };
      upyun.formPutFile('./test/cat.jpg', opts,
        function(policy) {
          return utils.md5sum(policy + '&' + secret);
        },
        function(err, result) {
          if (err) {
            throw err;
          }
          result.statusCode.should.be.exactly(200);
          result.data.should.have.property('image-type');
          result.headers.should.have.property('x-upyun-width');
          done();
        }
      );
    });


    it('should return the uploaded file\'s info sucesss with buffer', function(done) {
      var opts = {
        'save-key': '/test' + tempstr + 'diff' + 'buffer',
        'Content-Type': 'image/jpg'
      };
      upyun.formPutFile(fs.readFileSync('./test/cat.jpg'), opts,
        function(policy) {
          return utils.md5sum(policy + '&' + secret);
        },
        function(err, result) {
          if (err) {
            throw err;
          }
          result.statusCode.should.be.exactly(200);
          result.data.should.have.property('image-type');
          result.headers.should.have.property('x-upyun-width');
          done();
        }
      );
    });
  });
});
