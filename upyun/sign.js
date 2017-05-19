import hmacsha1 from 'hmacsha1'
import pkg from '../package.json'

export function getHeaderSign (config, method, path, contentMd5 = null) {
  const date = new Date().toGMTString()
  path = '/' + config.bucket + path
  const sign = genSign(config.operator, config.password, {
    method,
    path,
    date,
    contentMd5
  })
  return {
    'Authorization': sign,
    'Date': date,
    'User-Agent': 'Js-Sdk/' + pkg.version
  }
}

export function genSign (operator, password, options) {
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
  const sign = hmacsha1(password, data.join('&'))
  return `UPYUN ${operator}:${sign}`
}

export default {
  genSign,
  getHeaderSign
}
