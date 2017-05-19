'use strict'

import md5 from 'md5'
import { expect } from 'chai'
import sign from '../upyun/sign'

describe('sign', () => {
  it('it should gen sign success', () => {
    const str = sign.genSign('operator', md5('password'), {
      method: 'POST',
      path: '/bucket'
    })

    expect(str).to.equal('UPYUN operator:Xx3G6+DAvUyCL2Y2npSW/giTFI8=')
  })
})
