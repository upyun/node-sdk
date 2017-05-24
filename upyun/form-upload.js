import base64 from 'base-64'
import sign from './sign'
import FormData from 'form-data'

export default function formUpload (remotePath, localFile, config, params) {
  return new Promise((resolve, reject) => {
    params['bucket'] = config.bucket
    params['save-key'] = remotePath
    if (typeof params['expiration'] === 'undefined') {
      params['expiration'] = parseInt(new Date() / 1000 + 30 * 60 * 60, 10)
    }

    const policy = base64.encode(JSON.stringify(params))
    const authorization = sign.genSign(config.operator, config.password, {
      method: 'POST',
      path: '/' + params['bucket'],
      policy
    })

    const data = new FormData()
    data.append('authorization', authorization)
    data.append('policy', policy)
    data.append('file', localFile)
    data.submit(config.protocol + '://' + config.endpoint + '/' + params['bucket'], (err, res) => {
      if (err) {
        return reject(err)
      }

      return resolve(res.statusCode === 200)
    })
  })
}
