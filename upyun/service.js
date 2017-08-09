import md5 from 'md5'

export default class Service {
  constructor (serviceName, operatorName = '', password = '') {
    // NOTE bucketName will be removed
    this.bucketName = serviceName
    this.serviceName = this.bucketName
    this.operatorName = operatorName
    this.password = md5(password)
  }
}
