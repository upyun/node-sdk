/**
 * ------------------------------------------------------------------
 * 提供了人工智能相关的使用实例
 * ------------------------------------------------------------------
 */
'use strict'

import Upyun from "../upyun/upyun"
import Service from "../upyun/service"
import fs from 'fs'

// 需要填写自己的服务名，操作员名，密码，通知URL
const serviceName = ""
const operatorName = ""
const password = ""
const notifyUrl = ""

// 需要填写本地路劲，云存储路径
const localFile = ""
const remoteFile = ""

const client = new Upyun(new Service(serviceName, operatorName, password))

/**
 * 内容识别-图片上传预处理
 */
function imageFormProcess() {
    var res
    // params 参数详见人工智能，云存储参数说明文档
    var params = { "apps": [{ "name": "imgaudit" }], "notify-url": notifyUrl }
    res = client.formPutFile(remoteFile, fs.createReadStream(localFile), params)
    console.log(res)
}

/**
 * 内容识别-视频点播上传预处理
 */
function videoFormProcess() {
    var res
    // params 参数详见人工智能，云存储参数说明文档
    var params = { "apps": [{ "name": "videoaudit" }], "notify-url": notifyUrl }
    res = client.formPutFile(remoteFile, fs.createReadStream(localFile), params)
    console.log(res)
}