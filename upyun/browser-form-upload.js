import axios from 'axios'
import base64 from 'base-64'
import sign from './sign'

export default async function formUpload (remotePath, localFile, config, params) {
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
  const {status} = await axios.post(config.protocol + '://' + config.endpoint + '/' + params['bucket'], data)
  return status === 200
}
