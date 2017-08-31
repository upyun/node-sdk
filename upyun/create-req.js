import axios from 'axios'

export default function (endpoint, service, getHeaderSign) {
  const req = axios.create({
    baseURL: endpoint + '/' + service.serviceName
  })

  req.interceptors.request.use((config) => {
    let method = config.method.toUpperCase()
    let path = config.url.substring(config.baseURL.length)
    config.url = encodeURI(config.url);

    return getHeaderSign(service, method, path).then((headers) => {
      config.headers.common = headers
      return Promise.resolve(config)
    })
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
