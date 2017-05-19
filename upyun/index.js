import axios from 'axios'
import sign from './sign'
import md5 from 'md5'


// TODO 统一路径前后缀处理

export default class Upyun {
  constructor ({bucket, operator, password}) {
    if (!bucket || !operator || !password) {
      throw new Error('must config bucket name or operator name or password')
    }
    password = md5(password)
    this.config = Object.assign({
      endpoint: 'v0.api.upyun.com',
      protocol: 'https'
    }, {
      bucket,
      operator,
      password
    })
    this.req = axios.create({
      baseURL: this.config.protocol + '://' + this.config.endpoint + '/' + bucket
    })
  }

  async usage (path = '/') {
    path = encodeURI(path + '?usage')
    const {data} = await this.req.get(path, {
      headers: sign.getHeaderSign(this.config, 'GET', path)
    })
    return data
  }

  async listDir (path = '/', {limit = 100, order = 'asc', iter = ''} = {}) {
    path = encodeURI(path)
    const requestHeaders = Object.assign({
      'x-list-limit': limit,
      'x-list-order': order
    }, sign.getHeaderSign(this.config, 'GET', path))

    if (iter) {
      requestHeaders['x-list-iter'] = iter
    }

    const {data, headers} = await this.req.get(path, {
      headers: requestHeaders
    })
    const next = headers['x-upyun-list-iter']
    if (!data) {
      return {
        files: [],
        next
      }
    }

    const items = data.split('\n')
    const files = items.map(item => {
      const [name, type, size, time] = item.split('\t')
      return {
        name,
        type,
        size,
        time
      }
    })

    return {
      files,
      next
    }
  }

  /**
   * localFile 不支持文件路径
   */
  async putFile (remotePath, localFile, options = {}) {
    // 服务端 axios 支持 stream string buffer https://github.com/mzabriskie/axios/blob/master/lib/adapters/http.js#L32
    // stream 的情况下不会设置 content-length
    // 客户端 axios 支持 xhr 默认支持的格式 https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send
    // TODO type check
    let path = encodeURI(remotePath)
    const keys = ['Content-MD5', 'Content-Length', 'Content-Type', 'Content-Secret', 'x-upyun-meta-x', 'x-gmkerl-thumb']
    let headers = {}
    keys.forEach(key => {
      if (options[key]) {
        headers[key] = options[key]
      }
    })

    Object.assign(headers, sign.getHeaderSign(this.config, 'PUT', path))
    const {headers: responseHeaders, status} = await this.req.put(path, localFile, {
      headers
    })

    if (status === 200) {
      let params = ['x-upyun-width', 'x-upyun-height', 'x-upyun-file-type', 'x-upyun-frames']
      let result = {}
      params.forEach(item => {
        let key = item.split('x-upyun-')[1]
        if (responseHeaders[item]) {
          result[key] = responseHeaders[item]
          if (key !== 'file-type') {
            result[key] = parseInt(result[key], 10)
          }
        }
      })
      return Object.keys(result).length > 0 ? result : true
    } else {
      return false
    }
  }
}
