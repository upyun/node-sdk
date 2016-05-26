'use strict';
var utils = require('../upyun/utils');
var form = require('../upyun/form');
var should = require('should');

var secret = process.env.UPYUN_SECRET;
var bucket = process.env.UPYUN_BUCKET;
var form = new form(bucket, 'v0.api.upyun.com');
var tempstr = '/' + Math.random().toString().slice(-8);

describe('FORM API: ', function() {
    describe('putFile(localFile, opts, callback)', function() {
        it('should return the uploaded file\'s info', function(done) {
            var opts = {
                'save-key': '/test' + tempstr,
                'Content-Type': 'image/jpg',
            }
            form.putFile('./test/cat.jpg', opts,
                function(policy){
                    return utils.md5sum(policy + '&' + secret);
                },
                function(err, result) {
                    if(err) {
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
