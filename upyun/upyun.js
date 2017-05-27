import createReq from './create-req'
import utils from './utils'
import formUpload from './form-upload'
import sign from './sign'

export default class Upyun {
  /**
   * @param {object} bucket - a instance of Bucket class
   * @param {object} params - optional params
   * @param {callback} getHeaderSign - callback function to get header sign
   */
  constructor (bucket, params = {}, getHeaderSign = null) {
    const isBrowser = typeof window !== 'undefined'

    if (typeof bucket.bucketName === 'undefined') {
      throw new Error('upyun - must config bucketName')
    }
    
    if (typeof params === 'function') {
      getHeaderSign = params
      params = {}
    }

    if (typeof getHeaderSign !== 'function' && isBrowser) {
      throw new Error('upyun - must config a callback function getHeaderSign in client side')
    }

    if (!isBrowser && (
        typeof bucket.operatorName === 'undefined' ||
        typeof bucket.password === 'undefined'
      )) {
      throw new Error('upyun - must config operateName and password in server side')
    }
    this.isBrowser = isBrowser

    const config = Object.assign({
      domain: 'v0.api.upyun.com',
      protocol: 'https'
    }, params)
    this.endpoint = config.protocol + '://' + config.domain

    this.req = createReq(this.endpoint, bucket, getHeaderSign || defaultGetHeaderSign)
    this.bucket = bucket
    if (!isBrowser)  {
      this.setBodySignCallback(sign.getPolicyAndAuthorization)
    }
  }

  setBucket (bucket) {
    this.bucket = bucket
    this.req.defaults.baseURL = this.endpoint + '/' + this.bucketName
  }

  setBodySignCallback (getBodySign) {
    if (typeof getBodySign !== 'function') {
      throw new Error('upyun - getBodySign should be a function')
    }
    this.bodySignCallback = getBodySign
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
    // TODO header params more better 
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
      // TODO process prefix x-upyun
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

  async formPutFile (remotePath, localFile, params = {}) {
    if (typeof this.bodySignCallback !== 'function') {
      throw new Error('upyun - must setBodySignCallback first!')
    }

    params['bucket'] = this.bucket.bucketName
    params['save-key'] = remotePath
    const bodySign = await this.bodySignCallback(this.bucket, params)
    const result = await formUpload(this.endpoint + '/' + params['bucket'], localFile, bodySign)
    return result
  }
}

function isMeta (key) {
  return key.indexOf('x-upyun-meta-') === 0
}

function defaultGetHeaderSign (bucket, method, path) {
  const headers = sign.getHeaderSign(bucket, method, path)
  return Promise.resolve(headers)
}