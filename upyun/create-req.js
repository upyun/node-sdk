import axios from 'axios'
import { isBrowser } from './constants'
import isPromise from 'is-promise'
import url from 'url'

const adapter = axios.defaults.adapter

axios.defaults.adapter = (function () {
  // NOTE: in electron environment, support http and xhr both, use http adapter first
  if (isBrowser) {
    return adapter
  }

  const http = require('axios/lib/adapters/http')
  return http
})()

export default function (endpoint, service, getHeaderSign, {proxy} = {}) {
  const req = axios.create({
    baseURL: endpoint + '/' + service.serviceName,
    maxRedirects: 0,
    proxy
  })

  req.interceptors.request.use((config) => {
    let method = config.method.toUpperCase()
    let path = url.resolve('/', encodeURI(config.url || ''))

    if (path.indexOf(config.baseURL) === 0) {
      path = path.substring(config.baseURL.length)
    }
    config.url = path
    let headerSign = getHeaderSign(service, method, path, config.headers['Content-MD5'])
    headerSign = isPromise(headerSign) ? headerSign : Promise.resolve(headerSign)

    return headerSign.then((headers) => {
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
        let err = new Error('upyun - response error: ' + error.message)
        if (error.response.data && error.response.data.code) {
          err.code = error.response.data.code
        }
        throw err
      } else {
        return response
      }
    }
  )
  return req
}
