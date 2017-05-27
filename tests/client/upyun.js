'use strict'

import { expect } from 'chai'
import Upyun from '../../upyun/upyun'
import Bucket from '../../upyun/bucket'
import sign from '../../upyun/sign'

const bucket = new Bucket('sdkimg', 'tester', 'grjxv2mxELR3')
function getHeaderSign (ignore, method, path) {
  const headers = sign.getHeaderSign(bucket, method, path)
  return Promise.resolve(headers)
}

const client = new Upyun({
  bucketName: 'sdkimg'
}, getHeaderSign)

client.setBodySignCallback((ignore, params) => {
  return Promise.resolve(sign.getPolicyAndAuthorization(bucket, params))
})

describe('index', () => {
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

  describe('#formUpload', () => {
    it('should upload file success', async () => {
      const f = new Blob(['text'], {type: 'text/plain'})
      f.name = 'testFormUpload.txt'
      const result = await client.formPutFile('/testFormUpload.txt', f)
      expect(result).to.equal(true)
    })
  })
})
