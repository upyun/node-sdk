# UPYUN JS SDK
[![NPM version](https://img.shields.io/npm/v/upyun.svg?style=flat)](https://www.npmjs.org/package/upyun)
[![Build Status](https://travis-ci.org/upyun/node-sdk.svg?branch=master)](https://travis-ci.org/upyun/node-sdk)

upyun js sdk, 支持服务端和客户端使用，集成：

* [UPYUN HTTP REST 接口](http://docs.upyun.com/api/rest_api/)
* [UPYUN HTTP FORM 接口](http://docs.upyun.com/api/form_api/)

- 安全起见，浏览器端不能设置操作员账号名和密码
- 服务端需要设置操作员账号名和密码
- 浏览器端使用时，部分参数设置或方法调用会导致跨域失败问题
    - `listDir` 设置 `limit | order | iter`
    - `putFile` 设置 `Content-Type` 以外的其他选项
    - `makeDir | updateMetadata | blockUpload` 无法在浏览器端使用
    - `deleteFile` 无法再浏览器端使用异步删除

# 安装

## npm
```
$ npm install upyun --production --save
```

## cdn

浏览器端手动安装时，需要手动引入 sdk 的依赖 `axios` （考虑到方便 axios 被复用，浏览器版本构建时，没有引入此依赖）

```
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
```

再引入编译后的 sdk 文件
```
<script src="https://unpkg.com/upyun/dist/upyun.min.js"></script>
```

# 测试
```
$ npm run test
```

# 接口列表

所有的接口返回均是 Promise

## Client

### 初始化
```js
const client = new upyun.Client(service[, options][, getHeaderSignCallback])
```

**参数**

- `service`: 又拍云服务，Service 实例: `new upyun.Service('your service name', 'your operator name', 'your operator password')`
- `options`: 配置项，可以配置以下参数
  - `domain`: 又拍云 rest api 地址，默认 `v0.api.upyun.com` 其他可配置域名见又拍云[文档](http://docs.upyun.com/api/rest_api/)
  - `protocol`: 使用 `http|https` 协议，默认 `https` 协议
- `getHeaderSignCallback`: 获取又拍云 HTTP Header 签名回调函数，服务端使用时不需要设置该参数。客户端使用必须设置该回调函数，它接受三个参数：`service, method, path`，用于计算当前请求签名，该函数必须返回一个 `Promise`

**示例**

- 服务端使用，一般只需要配置完整又拍云服务信息（服务名、操作员名、操作员密码）即可：

```js
const service = new upyun.Service('your service name', 'your operator name', 'your operator password')
const client = new upyun.Client(service);
```

- 客户端使用，必须设置签名回调函数，又拍云服务信息只需服务名即可（注意：**如果回调函数是异步，则必须返回一个 Promise**）

```js
/**
 *@param service: Service 实例
 *@param method: 当前请求的 API 使用的方法
 *@param path: 当前请求的资源路径
 */
function getSignHeader(service, method, path) {
  // 请求自己的服务器，计算当前 api 请求签名信息
  // 可以参考该项目 sample 目录中的示例代码
  ...
}
const service = new upyun.Service('your service name')
const client = new upyun.Client(service, getSignHeader);
```

### usage(path = '/')

查看目录大小（单位: byte）

**参数**

- `path`: 目录路径

**示例**

```
client.usage('/sub/dir').then(function(size) {
  console.log('/sub/dir total used size: ' + size)
})
```

### listDir(remotePath, options)

获取目录下文件列表

**参数**

- `remotePath`: 需要查看的目录路径
- `options`:
  - `limit`: 每次请求获取的目录最大列表，最大值 10000，默认 100
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

- `remotePath`: 文件保存路径 *需包含文件名*（**路径不需要 encodeURI，sdk 会统一处理**）
- `localFile`: 需要上传的文件。服务端支持 `String | Stream | Buffer`, 浏览器端支持 `File | String` **注意 `String` 表示文件内容，不是本地文件路径**
- `options`: 其他可选参数 `Content-MD5 | Content-Length | Content-Type | Content-Secret | x-gmkerl-thumb`（大小写无关，详见[上传参数](http://docs.upyun.com/api/rest_api/#_2)），其中 `Content-Type` 未设置时，将会根据文件路径设置默认值

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
- `remotePath`: 文件在又拍云云存储服务的路径

**响应**

文件不存在返回 `false`。否则返回一个对象，结构如下，详见[又拍云 HEAD](http://docs.upyun.com/api/rest_api/#_12)

```js
{
  'type': 'file', // 文件类型
  'size': 289239, // 文件大小
  'date': 1486053098, // 文件创建时间
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
client.getFile('/sample.txt').then(function (content) {
  console.log(content) // will out put file content directly
})
```

写入其他流
```js
const saveTo = fs.createWriteStream('./localSample.txt')
client.getFile('/sample.txt', saveTo).then(function (stream) {
  // file has been saved to localSample.txt
  // you can pipe the stream to anywhere you want
})
```

### formPutFile(remotePath, localFile, params = {})

使用又拍云[表单 api](http://docs.upyun.com/api/form_api/) 上传文件。客户端使用该方法时，
必须先设置获取又拍云 [HTTP Body 签名](http://docs.upyun.com/api/authorization/#http-body)的回调函数

**参数**

- `remotePath`: 保存路径
- `localFile`: 需要上传的文件，和 `putFile` 相同(**如果在浏览器端使用，只支持 String/Blob/File **)
- `params`: 又拍云表单 api 支持的可选参数（`save-key` `service` 两个必选参数不需要手动在这里设置）

**响应**

成功返回一个对象，详细说明见[异步通知规则](http://docs.upyun.com/api/form_api/#notify_return)参数说明部分，失败返回 `false`

## Service

又拍云服务，包含以下属性

- `serviceName` 服务名
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
