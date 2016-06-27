var utils = require('./upyun/utils');

function signature(policy, secret) {
  return utils.md5sum(policy + '&' + this._conf.secret);
}

function policy(opts) {
  if (typeof opts !== 'string') {
    opts = JSON.stringify(opts);
  }
  return utils.Base64.encode(opts);
}

module.exports.md5sum = utils.md5sum;
module.exports.md5sumFile = utils.md5sumFile;
module.exports.makeSign = utils.makeSign;
module.exports.signature = signature;
module.exports.policy = policy;
