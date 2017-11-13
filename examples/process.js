/**
 * ------------------------------------------------------------------
 * 提供了云处理相关的使用实例
 * ------------------------------------------------------------------
 */
'use strict'

import Upyun from '../upyun/upyun'
import Service from '../upyun/service'
import fs from 'fs'

// 需要填写自己的服务名，操作员名，密码，通知URL
const serviceName = ''
const operatorName = ''
const password = ''
const notifyUrl = ''

// 需要填写本地路径，云存储路径
const localFile = ''
const remoteFile = ''
const saveAs = ''

const client = new Upyun(new Service(serviceName, operatorName, password))

/**
 * 同步图片上传预处理
 */
function imageSyncProcess(isForm) {
  // params 参数详见云处理，云存储参数说明文档
  var params = { 'x-gmkerl-thumb': '/format/png', 'notify-url': notifyUrl }
  if (isForm) {
    client.formPutFile(remoteFile, fs.createReadStream(localFile), params)
  } else {
    client.putFile(remoteFile, fs.createReadStream(localFile), params)
  }
}

/**
 * 异步图片上传预处理
 */
function imageASyncProcess() {
  // params 参数详见云处理，云存储参数说明文档
  var params = { 'apps': [{ 'name': 'thumb', 'x-gmkerl-thumb': '/format/png', 'save_as': saveAs }], 'notify-url': notifyUrl }
  client.formPutFile(remoteFile, fs.createReadStream(localFile), params)
}

/**
 * 异步音视频处理-上传预处理
 */
function videoFormProcess() {
  // params 参数详见云处理，云存储参数说明文档
  var params = { 'apps': [{ 'name': 'naga', 'type': 'video', 'avopts': '/s/128x96', 'save_as': saveAs }], 'notify-url': notifyUrl }
  client.formPutFile(remoteFile, fs.createReadStream(localFile), params)
}

/**
 * 文档转换-上传预处理
 */
function fileFormConvert() {
  // params 参数详见云处理，云存储参数说明文档
  var params = { 'apps': [{ 'name': 'uconvert', 'save_as': saveAs }], 'notify-url': notifyUrl }
  client.formPutFile(remoteFile, fs.createReadStream(localFile), params)
}

imageSyncProcess(true)
imageASyncProcess()
videoFormProcess()
fileFormConvert()