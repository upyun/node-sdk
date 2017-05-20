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

    this.req.interceptors.request.use(config => {
      let method = config.method.toUpperCase()
      let path = config.url.substring(config.baseURL.length)

      config.headers.common = sign.getHeaderSign(this.config, method, path)
      return config
    }, error => {
      throw new Error('upyun - request failed: ' + error.message)
    })

    this.req.interceptors.response.use(
      response => response,
      error => {
        const {response} = error
        if (response.status !== 404) {
          throw new Error('upyun - response error: ' + response.data.code + ' ' + response.data.message)
        } else {
          return response
        }
      }
    )
  }

  async usage (path = '/') {
    path = encodeURI(path + '?usage')
    const {data} = await this.req.get(path)
    return data
  }

  async listDir (path = '/', {limit = 100, order = 'asc', iter = ''} = {}) {
    path = encodeURI(path)
    const requestHeaders = {
      'x-list-limit': limit,
      'x-list-order': order
    }

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

  async makeDir (remotePath) {
    const {status} = await this.req.post(remotePath, null, {
      headers: { folder: 'true' }
    })
    return status === 200
  }

  async headFile (remotePath) {
    const {headers, status} = await this.req.head(remotePath)

    if (status === 404) {
      return false
    }

    let params = ['x-upyun-file-type', 'x-upyun-file-size', 'x-upyun-file-date', 'Content-Md5']
    let result = {}
    params.forEach(item => {
      let key = item.split('x-upyun-file-')[1]
      if (headers[item]) {
        result[key] = headers[item]
        if (key === 'size' || key === 'date') {
          result[key] = parseInt(result[key], 10)
        }
      }
    })
    return result
  }

  async deleteFile (remotePath) {
    const {status} = await this.req.delete(remotePath)

    return status === 200
  }

  async deleteDir (remotePath) {
    return await this.deleteFile(remotePath)
  }

  async getFile (remotePath, saveStream = null) {
    if (saveStream && typeof window !== 'undefined') {
      throw new Error('upyun - save as stream are only available on the server side.')
    }

    const response = await this.req({
      method: 'GET',
      url: remotePath,
      responseType: saveStream ? 'stream' : null
    })

    if (response.status === 404) {
      return false
    }

    if (!saveStream) {
      return response.data
    }

    const stream = response.data.pipe(saveStream)

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(stream))

      stream.on('error', reject)
    })
  }

  async updateMetadata (remotePath, metas, operate = 'merge') {

    let metaHeaders = {}
    for (let key in metas) {
      if (!isMeta(key)) {
        metaHeaders['x-upyun-meta-' + key] = metas[key]
      } else {
        metaHeaders[key] = metas
      }
    }
    const {status} = await this.req.patch(
      remotePath + '?metadata=' + operate,
      null,
      { headers: metaHeaders }
    )

    return status === 200
  }

  // be careful: this will download the entire file
  async getMetadata (remotePath) {
    const {headers, status} = await this.req.get(remotePath)

    if (status !== 200) {
      return false
    }

    let result = {}
    for (let key in headers) {
      if (isMeta(key)) {
        result[key] = headers[key]
      }
    }

    return result
  }
}

function isMeta (key) {
  return key.indexOf('x-upyun-meta-') === 0
}
