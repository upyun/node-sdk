# UPYUN Js SDK
[![NPM version](https://img.shields.io/npm/v/upyun.svg?style=flat)](https://www.npmjs.org/package/upyun)
[![Build Status](https://travis-ci.org/upyun/node-sdk.svg?branch=master)](https://travis-ci.org/upyun/node-sdk)

upyun js sdk, 支持服务端和客户端使用，集成：

* [UPYUN HTTP REST 接口](http://docs.upyun.com/api/rest_api/)
* [UPYUN HTTP FORM 接口](http://docs.upyun.com/api/form_api/)

- 安全起见，浏览器端不能设置操作员账号名和密码
- 服务端需要设置操作员账号名和密码

# 安装

## npm
```
$ npm install upyun --save
```

该库依赖 `babel-polyfill`，需要在项目入口文件第一行添加
```
require('babel-polyfill')
```

## cdn

# 测试
```
$ npm run test
```

# 接口列表

## Client

### 初始化
```js
const upyun = new Upyun.Client(bucket[, options][, getHeaderSignCallback])
```

**参数**

- `bucket`: 又拍云服务（空间），Bucket 实例: `new upyun.Bucket({bucketName: 'your bucket name', operatorName: 'your operator name', password: 'your operator password'})`
- `options`: 配置项，可以配置以下参数
  - `domain`: 又拍云 rest api 地址，默认 `v0.api.upyun.com` 其他可配置域名见又拍云[文档](http://docs.upyun.com/api/rest_api/)
  - `protocol`: 使用 `http|https` 协议，默认 `https` 协议
- `getHeaderSignCallback`: 获取又拍云 HTTP Header 签名回调函数，服务端使用时不需要设置该参数。客户端使用必须设置该回调函数，它接受三个参数：`bucket, method, path`，用于计算当前请求签名

**示例**

- 服务端使用，一般只需要配置完整又拍云服务信息（服务名、操作员名、操作员密码）即可：

```js
const bucket = new Upyun.Bucket('your bucket name', 'your operator name', 'your operator password')
const upyun = new Upyun.Client(bucket);
```

- 客户端使用，必须设置签名回调函数，又拍云服务信息只需服务名即可

```js
/**
 *@param bucket: Bucket 实例
 *@param method: 当前请求的 API 使用的方法
 *@param path: 当前请求的资源路径
 */
function getSignHeader(bucket, method, path) {
  // 请求自己的服务器，计算当前 api 请求签名信息
  // 可以参考该项目 sample 目录中的示例代码
  ...
}
const bucket = new Upyun.Bucket('your bucket name')
const upyun = new Upyun.Client(bucket, getSignHeader);
```

### usage(path = '/')

查看目录大小（单位: byte）

**参数**

- `path`: 目录路径

**示例**

```
upyun.usage('/sub/dir').then(function(size) {
  console.log('/sub/dir total used size: ' + size)
})
```

### listDir(remotePath, options)

获取目录下文件列表

**参数**

- `remotePath`: 需要查看的目录路径
- `options`:
  - `limit`: 每次请求获取的目录最大列表，最大值 1000，默认 100
  - `order`: 列表以文件最后修改时间排序，可选值 `asc|desc`，默认 `asc`
  - `iter`: 遍历起点，每次响应参数中，将会包含遍历下一页需要的 `iter` 值

**响应**

目录不存在，返回 `false`，否则返回一个对象，结构如下：

```js
{
  files: [
    {
      name: 'example.txt', // file or dir name
      type: 'N', // file type, N: file; F: dir
      size: 28392812, // file size
      time: 1486053098 // last modify time
    }
  ],
  next: 'dlam9pd2Vmd2Z3Zg==' // next page iter
}
```

### putFile(remotePath, localFile, options = {}) 

通过 rest api 上传文件

**参数**

- `remotePath`: 文件保存路径（不需要 encodeURI，sdk 会统一处理）
- `localFile`: 需要上传的文件。服务端支持 `String | Stream | Buffer`, 浏览器端支持 `File | String` 
- `options`: 其他可选参数 `Content-MD5 | Content-Length | Content-Type | Content-Secret | x-gmkerl-thumb` （大小写无关，详见[上传参数](http://docs.upyun.com/api/rest_api/#_2)）

**响应**

如果是非图片类文件，上传成功返回 `true`, 否则返回一个对象，包含图片的基本信息：

```js
{
  width: 80,
  height: 80,
  'file-type': 'image/jpg',
  frames: 1
}
```

如果上传失败，返回 `false`

### makeDir(remotePath)

创建目录

**参数**
- `remotePath`: 新建目录的路径

**响应**

创建成功返回 `true`，否则 `false`

### headFile(remotePath)

`HEAD` 请求，获取文件基本信息

**参数**
- `remotePath`: 文件在又拍云服务（空间）的路径

**响应**

文件不存在返回 `false`。否则返回一个对象，结构如下，详见[又拍云 HEAD](http://docs.upyun.com/api/rest_api/#_12)

```js
{
  'file-type': 'file', // 文件类型
  'file-size': 289239, // 文件大小
  'file-date': 1486053098, // 文件创建时间
  'Content-Md5': '...'  // 文件 md5 值，该值可能不存在
}
```

### deleteFile(remotePath)

删除文件或目录

**参数**
- `remotePath`: 文件或目录在又拍云服务的路径

**响应**

删除成功返回 `true`, 否则返回 `false`

### getFile(remotePath, saveStream = null)

下载保存在又拍云服务的文件

**参数**
- `remotePath`: 需要下载的文件路径
- `saveStream`: 可选值，一个可以写入的流。若传递该参数，下载的文件将直接写入该流。该参数不支持浏览器端使用

**响应**

如果文件不存在，将会返回 `false`。文件存在时，若没有设置 `saveStream`，该方法
将直接返回文件内容。若设置了 `saveStream`，文件将直接写入该流，并返回流信息

**示例**

获取文件内容
```js
upyun.getFile('/sample.txt').then(function (content) {
  console.log(content) // will out put file content directly
})
```

写入其他流
```js
const saveTo = fs.createWriteStream('./localSample.txt')
upyun.getFile('/sample.txt', saveTo).then(function (stream) {
  // file has been saved to localSample.txt
  // you can pipe the stream to anywhere you want
})
```

### formPutFile(remotePath, localFile, params = {})

使用又拍云[表单 api](http://docs.upyun.com/api/form_api/) 上传文件。客户端使用该方法时，
必须先设置获取又拍云 [HTTP Body 签名](http://docs.upyun.com/api/authorization/#http-body)的回调函数

**参数**

- `remotePath`: 保存路径
- `localFile`: 需要上传的文件，和 `putFile` 相同
- `params`: 又拍云表单 api 支持的可选参数（`save-key` `bucket` 两个必选参数不需要手动在这里设置）

**响应**

成功返回 `true`，失败返回 `false`

## Bucket

又拍云服务，包含以下属性

- `bucketName` 服务名（空间名）
- `operatorName` 操作员名
- `password` 操作员密码，读取该属性时，获取的值是 md5 加密后的结果

## sign

签名模块

# 备注

[upyun npm package](https://www.npmjs.org/package/upyun) 曾为 [James Chen](http://ashchan.com) 所有。

经过与其的交流协商，James 已经将此 npm 包转由 UPYUN 开发团队管理和维护。

后续的代码和版本更新，将于原有的项目无任何直接关系。

在 npm 上, `"upyun": "<=0.0.3"` 是由 [James Chen](http://ashchan.com) 曾开发的 [node-upyun](https://github.com/ashchan/node-upyun) 项目.

__非常感谢  [James Chen](http://ashchan.com) 对 upyun 的支持和贡献__
