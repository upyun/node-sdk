'use strict'

import { expect } from 'chai'
import Upyun from '../upyun/index'
import fs from 'fs'
import path from 'path'

const client = new Upyun({
  bucket: 'sdkimg',
  operator: 'tester',
  password: 'grjxv2mxELR3'
})

describe('index', () => {
  describe('#usage', () => {
    it('should get usage success', async () => {
      let data = await client.usage()
      expect(data >= 0).to.equal(true)
    })
  })

  describe('#putFile', () => {
    it('should upload string success', async () => {
      let data = await client.putFile('/text.txt', 'Augue et arcu blandit tincidunt. Pellentesque.')

      expect(data).to.equal(true)
    })

    it('should upload picture success', async () => {
      // only use stream on server side
      let jpg = './tests/fixtures/cat.jpg'
      // TODO better for length
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

  describe('#listDir', () => {
    before(async () => {
      await client.putFile('/text.txt', 'Augue et arcu blandit tincidunt. Pellentesque.')
    })

    it('should get dir list success', async () => {
      let data = await client.listDir()

      expect(data.files.length > 0).to.equal(true)

      let file = data.files.find(ele => {
        return ele.name === 'text.txt'
      })
      expect(file.name).to.equal('text.txt')
      expect(file.size).to.equal(46)
      expect(file.time > 0).to.equal(true)
      expect(file.type).to.equal('N')
    })

    it('should list not exist dir path success', async () => {
      let data = await client.listDir('/not-exist-dir')
      expect(data).to.equal(false)
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

  describe('#deleteFile', () => {
    let filePath = '/headFile.txt'

    it('should delete success', async () => {
      let result = await client.deleteFile(filePath)
      expect(result).to.equal(true)
    })

    it('should get false when file not exist', async () => {
      let result = await client.deleteFile('/not-exist-path2333')
      expect(result).to.equal(false)
    })
  })

  describe('#deleteDir', () => {
    let dirPath = '/headDir'

    it('should delete success', async () => {
      let result = await client.deleteDir(dirPath)
      expect(result).to.equal(true)
    })
  })

  describe('#getFile', () => {
    let filePath = '/getFile.txt'
    before(async () => {
      await client.putFile(filePath, 'Dictum accumsan, convallis accumsan.')
    })

    it('should get file content success', async () => {
      let result = await client.getFile(filePath)
      expect(result).to.equal('Dictum accumsan, convallis accumsan.')
    })

    it('should pipe file content to stream success', async () => {
      await client.getFile(filePath, fs.createWriteStream('./tests/fixtures/getFile.txt'))
      let result = fs.readFileSync('./tests/fixtures/getFile.txt', 'utf-8')
      expect(result).to.equal('Dictum accumsan, convallis accumsan.')
    })

    it('should get false when remote file not exist', async () => {
      let result = await client.getFile('/not-exists-path')
      expect(result).to.equal(false)
    })
  })

  describe('#updateMetadata', () => {
    let filePath = '/meta.txt'
    before(async () => {
      await client.putFile(filePath, 'Dictum accumsan, convallis accumsan.')
    })

    it('should update metadata success', async () => {
      let result = await client.updateMetadata(filePath, {
        'foo': 'bar'
      })

      expect(result).to.equal(true)

      let metas = await client.getMetadata(filePath)
      expect(metas['x-upyun-meta-foo']).to.equal('bar')
    })
  })

  describe('#blockUpload', () => {
    it('should upload file success', async () => {
      const result = await client.blockUpload('/testBlockUpload.jpg', path.join(__dirname, './fixtures/cat.jpg'))
      expect(result).to.equal(true)
    })
  })

  describe('#formUpload', () => {
    it('should upload file success', async () => {
      const result = await client.formPutFile('/testFormUpload.jpg', fs.createReadStream(path.join(__dirname, './fixtures/cat.jpg')))
      expect(result).to.equal(true)
    })

    it('should convert amr to mp3 success when upload amr file', async () => {
      const options = {
        'content-type': 'audio/amr',
        apps: [{
          name: 'naga',
          type: 'video',
          avopts: '/f/mp3',
          return_info: true,
          save_as: '/amr-mp3-test.mp3'
        }]
      }
      const result = await client.formPutFile(
        '/test.amr',
        fs.createReadStream(path.join(__dirname, './fixtures/example.amr')),
        options
      )
      expect(result).to.equal(true)
    })
  })
})
