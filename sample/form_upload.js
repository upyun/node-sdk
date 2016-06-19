var http = require('http');
var util = require('util');
var utils = require('../upyun/utils');

var bucket = process.env.UPYUN_BUCKET;
var secret = process.env.UPYUN_SECRET;

if (!bucket) {
  throw new Error('please config bucket to your env. eg: export UPYUN_BUCKET=your_test_bucket_name');
}
if (!secret) {
  throw new Error("please config bucket secret to your env. eg: export UPYUN_SECRET='your_test_bucket_secret'");
}

http.createServer(function(req, res) {
  var random_path = '/test/' + Math.random().toString().slice(-8);
  var opts = {
    'save-key': random_path,
    'bucket': bucket,
    'expiration': Math.round(new Date().getTime() / 1000) + 3600
  };

  var policy = utils.Base64.encode(JSON.stringify(opts));
  var signature = utils.md5sum(policy + '&' + secret);

  res.writeHead(200, {
    'content-type': 'text/html'
  });

  var form_tpl = '<form action="http://v0.api.upyun.com/%s" enctype="multipart/form-data" method="post">' +
    '<input type="file" id="file" name="file" multiple="multiple">' +
    '<input type="hidden" id="policy" name="policy" value=%s>' +
    '<input type="hidden" id="signature" name="signature" value=%s>' +
    '<input type="submit" value="upload">' +
    '</form>';

  var form_html = util.format(form_tpl, bucket, policy, signature);

  res.end(form_html);
}).listen(8080, '0.0.0.0');

console.log('open your ip with 8080 port and use it.');
console.log('for example: http://127.0.0.1:8080');
