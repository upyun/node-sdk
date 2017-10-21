'use strict'

import { expect } from 'chai'
import sign from '../../upyun/sign'
import Service from '../../upyun/service'

describe('sign', () => {
  const service = new Service('sdkimg', 'operator', 'password')
  describe('#genSign', () => {
    it('should gen sign success', () => {
      const str = sign.genSign(service, {
        method: 'POST',
        path: '/bucket'
      })

      expect(str).to.equal('UPYUN operator:Xx3G6+DAvUyCL2Y2npSW/giTFI8=')
    })
  })
})
