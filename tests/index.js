'use strict'

import axios from 'axios'
import { expect } from 'chai'
import Upyun from '../upyun/index'
import fs from 'fs'

const client = new Upyun({
  bucket: 'sdkimg',
  operator: 'tester',
  password: 'grjxv2mxELR3'
})

describe('index', () => {
  xit('should get usage success', async () => {
    let data = await client.usage()
    // TODO
    expect(data).to.equal(56011)
  })

  describe('#listDir', () => {
    xit('should get dir list success', async () => {
      let data = await client.listDir()

      expect(data.files).to.deep.equal([{
        name: 'aa.txt',
        size: '6',
        time: '1495177200',
        type: 'N'
      }])
    })

    xit('should list not exist dir path success', async () => {

    })
  })

  xdescribe('#putFile', () => {
    it('should upload string success', async () => {
      let data = await client.putFile('/text.txt', 'Augue et arcu blandit tincidunt. Pellentesque.')

      expect(data).to.equal(true)
    })

    it('should upload picture success', async () => {
      // TODO internal support
      // just need when upload stream for server side
      let jpg = './tests/fixtures/cat.jpg'
      let options = {
        'Content-Length': fs.statSync(jpg).size
      }

      let data = await client.putFile('/cat.jpg', fs.createReadStream(jpg), options)

      expect(data).to.deep.equal({
        width: 500,
        frames: 1,
        height: 333,
        'file-type': 'JPEG'
      })
    })
  })

  describe('#makeDir', () => {
    it('should create dir success', async () => {
      let data = await client.makeDir('/testdir2')

      expect(data).to.equal(true)
    })
  })

  describe('#headFile', () => {
    let filePath = '/headFile.txt'
    let dirPath = '/headDir'
    before(async () => {
      await client.putFile(filePath, 'Dictum accumsan, convallis accumsan, cursus sit amet, ipsum. In pharetra sagittis.')
      await client.makeDir(dirPath)
    })

    it('should get file info success', async () => {
      let result = await client.headFile(filePath)
      expect(result['type']).to.equal('file')
      expect(result['size']).to.equal(82)
      expect(result).to.have.property('date')
    })

    it('should get dir info success', async () => {
      let result = await client.headFile(dirPath)
      expect(result['type']).to.equal('folder')
      expect(result).to.have.property('date')
    })

    it('should get false when file not exist', async () => {
      let result = await client.headFile('/not-exist-path2333')
      expect(result).to.equal(false)
    })
  })
})
