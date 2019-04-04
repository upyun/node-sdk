'use strict'

import { expect } from 'chai'
import Upyun from '../../upyun/upyun'
import Service from '../../upyun/service'
import sign from '../../upyun/sign'

const service = new Service('sdkimg', 'tester', 'grjxv2mxELR3')
function getHeaderSign (ignore, method, path) {
  const headers = sign.getHeaderSign(service, method, path)
  return Promise.resolve(headers)
}

const client = new Upyun({
  serviceName: 'sdkimg'
}, getHeaderSign)

client.setBodySignCallback((ignore, params) => {
  return Promise.resolve(sign.getPolicyAndAuthorization(service, params))
})

describe('index', function () {
  this.timeout(10000)
  describe('#blockUpload', () => {
    it('should upload file success', async () => {
      const f = new Blob(['text'], {type: 'text/plain'})
      f.name = 'testBlockUpload.txt'

      const result = await client.blockUpload('/testBlockUpload.txt', f, {
        'Content-Length': 4,
        'Content-Type': 'text/plain'
      })
      expect(result).to.equal(true)
    })
  })

  describe('#multipartUpload', () => {
    it('should upload file success', async () => {
      const remotePath = 'testMultipartUpload.txt'

      const f = new Blob(['text'], {type: 'text/plain'})
      f.name = 'testBlockUpload.txt'

      const {fileSize, partCount, uuid} = await client.initMultipartUpload(remotePath, f)

      await Promise.all(Array.apply(null, {length: partCount}).map(Function.call, index => {
        const partId = index
        return client.multipartUpload(remotePath, f, uuid, partId)
      }))

      const result = await client.completeMultipartUpload(remotePath, uuid)

      expect(result).to.equal(true)
    })
  })

  describe('#formUpload', () => {
    it('should upload file success', async () => {
      const f = new Blob(['text'], {type: 'text/plain'})
      f.name = 'testFormUpload.txt'
      const result = await client.formPutFile('/testFormUpload.txt', f)
      expect(result.code).to.equal(200)
    })

    it('should upload base64 encode file success', async () => {
      const options = {
        'content-type': 'text/plain',
        'b64encoded': 'on',
      }
      const result = await client.formPutFile(
        '/test-client-base64.txt',
        'dGVzdCBiYXNlNjQgdXBsb2Fk',
        options
      )
      expect(result.code).to.equal(200)
    })
  })
})
