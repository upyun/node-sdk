'use strict'

import { expect } from 'chai'
import Upyun from '../upyun/index'

const client = new Upyun({
  bucket: 'sdkimg',
  operator: 'tester',
  password: 'grjxv2mxELR3'
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
