'use strict'

import md5 from 'md5'
import { expect } from 'chai'
import sign from '../upyun/sign'
import Bucket from '../upyun/bucket'

describe('sign', () => {
  const bucket = new Bucket('sdkimg', 'operator', 'password')
  describe('#genSign', () => {
    it('should gen sign success', () => {
      const str = sign.genSign(bucket, {
        method: 'POST',
        path: '/bucket'
      })

      expect(str).to.equal('UPYUN operator:Xx3G6+DAvUyCL2Y2npSW/giTFI8=')
    })
  })
})
