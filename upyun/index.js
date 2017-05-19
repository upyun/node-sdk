import axios from 'axios'
import sign from './sign'
import md5 from 'md5'

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
}
