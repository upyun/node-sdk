'use strict'

import axios from 'axios'
import { expect } from 'chai'
import Upyun from '../upyun/index'

const client = new Upyun({
  bucket: 'sdkimg',
  operator: 'tester',
  password: 'grjxv2mxELR3'
})

describe('index', () => {
  it('should get usage success', async () => {
    let data = await client.usage()
    // TODO
    expect(data).to.equal(56011)
  })

  describe('#listDir', () => {
    it('should get dir list success', async () => {
      let data = await client.listDir()

      expect(data.files).to.deep.equal([{
        name: 'aa.txt',
        size: '6',
        time: '1495177200',
        type: 'N'
      }])
    })
  })
})
