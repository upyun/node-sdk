import axios from 'axios'
import sign from './sign'
import md5 from 'md5'
import utils from './utils'

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
    // TODO path slash
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

    const {data, headers, status} = await this.req.get(path, {
      headers: requestHeaders
    })

    if (status === 404) {
      return false
    }

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
        size: parseInt(size),
        time: parseInt(time)
      }
    })

    return {
      files,
      next
    }
  }

  /**
   * @param localFile: file content, available type is Stream | String | Buffer for server; File | String for client
   * @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send
   * @see https://github.com/mzabriskie/axios/blob/master/lib/adapters/http.js#L32
   */
  async putFile (remotePath, localFile, options = {}) {
    let path = encodeURI(remotePath)
    // optional params
    const keys = ['Content-MD5', 'Content-Length', 'Content-Type', 'Content-Secret', 'x-gmkerl-thumb']
    let headers = {}
    keys.forEach(key => {
      if (options[key]) {
        headers[key] = options[key]
      } else if (isMeta(key)) {
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

  /**
   * in browser: type of fileOrPath is File
   * in server: type of fileOrPath is string: local file path
   */
  async blockUpload (remotePath, fileOrPath, options = {}) {
    const isBrowser = typeof window !== 'undefined'

    let fileSize
    let contentType
    if (isBrowser) {
      fileSize = fileOrPath.size
      contentType = fileOrPath.type
    } else {
      fileSize = await utils.getFileSizeAsync(fileOrPath)
      contentType = utils.getContentType(fileOrPath)
    }

    Object.assign(options, {
      'x-upyun-multi-stage': 'initiate',
      'x-upyun-multi-length': fileSize,
      'x-upyun-multi-type': contentType
    })

    let {headers} = await this.req.put(remotePath, null, {
      headers: options
    })

    let uuid = headers['x-upyun-multi-uuid']
    let nextId = headers['x-upyun-next-part-id']

    let block
    do {
      const blockSize = 1024 * 1024
      const start = nextId * blockSize
      const end = Math.min(start + blockSize, fileSize)
      block = await utils.readBlockAsync(fileOrPath, start, end)

      let {headers} = await this.req.put(remotePath, block, {
        headers: {
          'x-upyun-multi-stage': 'upload',
          'x-upyun-multi-uuid': uuid,
          'x-upyun-part-id': nextId
        }
      })
      nextId = headers['x-upyun-next-part-id']
    } while (nextId !== '-1')

    const {status} = await this.req.put(remotePath, null, {
      headers: {
        'x-upyun-multi-stage': 'complete',
        'x-upyun-multi-uuid': uuid
      }
    })
    return status === 204 || status === 201
  }
}

function isMeta (key) {
  return key.indexOf('x-upyun-meta-') === 0
}
