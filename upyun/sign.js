import hmacsha1 from 'hmacsha1'
import base64 from 'base-64'
import pkg from '../package.json'

/**
 * generate head sign
 * @param {object} bucket
 * @param {string} path - storage path on upyun server, e.g: /your/dir/example.txt
 * @param {string} contentMd5 - md5 of the file that will be uploaded
 */
export function getHeaderSign (bucket, method, path, contentMd5 = null) {
  const date = new Date().toGMTString()
  path = '/' + bucket.bucketName + path
  const sign = genSign(bucket, {
    method,
    path,
    date,
    contentMd5
  })
  return {
    'Authorization': sign,
    'X-Date': date,
    'User-Agent': 'Js-Sdk/' + pkg.version
  }
}

/**
 * generate signature string which can be used in head sign or body sign
 * @param {object} bucket
 * @param {object} options - must include key is method, path
 */
export function genSign (bucket, options) {
  const {method, path} = options

  const data = [
    method,
    path
  ];

  // optional params
  ['date', 'policy', 'contentMd5'].forEach(item => {
    if (options[item]) {
      data.push(options[item])
    }
  })

  // hmacsha1 return base64 encoded string
  const sign = hmacsha1(bucket.password, data.join('&'))
  return `UPYUN ${bucket.operatorName}:${sign}`
}

/**
 * get policy and authorization for form api
 * @param {object} bucket
 * @param {object} - other optional params @see http://docs.upyun.com/api/form_api/#_2
 */
export function getPolicyAndAuthorization (bucket, params) {
  params['bucket'] = bucket.bucketName
  if (typeof params['save-key'] === 'undefined') {
    throw new Error('upyun - calclate body sign need save-key')
  }

  if (typeof params['expiration'] === 'undefined') {
    // default 30 minutes
    params['expiration'] = parseInt(new Date() / 1000 + 30 * 60, 10)
  }

  const policy = base64.encode(JSON.stringify(params))
  const authorization = genSign(bucket, {
    method: 'POST',
    path: '/' + bucket.bucketName,
    policy
  })
  return {
    policy,
    authorization
  }
}

export default {
  genSign,
  getHeaderSign,
  getPolicyAndAuthorization
}