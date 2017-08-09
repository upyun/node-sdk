'use strict'

import Client from './upyun/upyun'
import sign from './upyun/sign'
import Service from './upyun/service'

export default {
  Client,
  sign,
  Bucket: Service,
  Service
}
