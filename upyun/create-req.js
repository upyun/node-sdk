import axios from 'axios'

export default function (endpoint, bucket, getHeaderSign) {
  const req = axios.create({
    baseURL: endpoint + '/' + bucket.bucketName
  })

  req.interceptors.request.use(async (config) => {
    let method = config.method.toUpperCase()
    let path = config.url.substring(config.baseURL.length)

    config.headers.common = await getHeaderSign(bucket, method, path)
    return config
  }, error => {
    throw new Error('upyun - request failed: ' + error.message)
  })

  req.interceptors.response.use(
    response => response,
    error => {
      const {response} = error
      if (typeof response === 'undefined') {
        throw error
      }

      if (response.status !== 404) {
        throw new Error('upyun - response error: ' + response.data.code + ' ' + response.data.msg)
      } else {
        return response
      }
    }
  )
  return req
}