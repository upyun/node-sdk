import md5 from 'md5'

export default class Bucket {
  constructor (bucketName, operatorName = null, password = null) {
    this.bucketName = bucketName
    this.operatorName = operatorName
    this.password = md5(password)
  }
}
