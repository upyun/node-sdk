# UPYUN Node SDK
[![NPM version](https://img.shields.io/npm/v/upyun.svg?style=flat)](https://www.npmjs.org/package/upyun)
[![Build status](https://img.shields.io/travis/upyun/node-upyun.svg?style=flat)](https://travis-ci.org/upyun/node-sdk)

UPYUN Node SDK, 集成：

* [UPYUN HTTP REST 接口](http://docs.upyun.com/api/rest_api/)
* [UPYUN HTTP FORM 接口](http://docs.upyun.com/api/form_api/)

# 安装
```
$ npm install upyun --save
```


# 初始化

```
var upyun = new UpYun(bucket, operator, password [, endpoint], [, options]);
```

__参数__

* `bucket`: 你要使用的 upyun 空间名字.
* `operator`: 拥有 `bucket` 授权的操作员
* `password`: 拥有 `bucket` 授权的操作员的密码
* `endpoint` API 接入点，可以刷是如下值:
  * `v0.api.upyun.com` : 自动选择合适的线路
  * `v1.api.upyun.com` : 电信线路
  * `v2.api.upyun.com` : 联通（网通）线路
  * `v3.api.upyun.com` : 移动（铁通）线路
* `options`
  * `options.apiVersion` 如果不指定，则使用旧版 API，新版 API 可以指定为 `v2`:
  * `options.secret` 如果指定，则可以使用 form 上传:

> **注：旧版 API 已不再更新，请指定 options.apiVersion 为 `v2` 使用新版 API。**

# 示例

```
var UpYun = require('upyun');
var upyun = new UpYun('testbucket', 'operatername', 'operaterpwd', 'v0.api.upyun.com', {
    apiVersion: 'v2',
    secret: 'yoursecret'
});
upyun.usage(function(err, result) {
    //...
})
```

# 响应结果

SDK 各 API 方法会按以下的统一格式返回数据：

```
{
    'statusCode': 200,    // HTTP 状态码
    'headers': {
        'server': 'vivi/0.6',
        'date': 'Wed, 13 Aug 2014 02:15:27 GMT',
        'content-type': 'application/json',
        'content-length': '24'
    },                  // API 响应头部
    'data': <响应体>
}
```

> 注：如果请求出错，则 `data` 里为具体的错误码和错误描述。如：

```
{
    'statusCode': 401,    // HTTP 状态码
    'headers': {          // API 响应头部
        'server': 'vivi/0.6',
        'date': 'Wed, 13 Aug 2014 02:19:07 GMT',
        'content-type': 'application/json',
        'content-length': '39'
    },
    'data': {             // 错误信息
        'code': 40400001,
        'msg': 'file not found'
    }
}
```

详细细错误码及说明请参考 [API 错误码表](http://docs.upyun.com/api/errno/)。


# API

<a name="usage" />
### usage(callback)

获取空间使用状况.(单位:`byte`)

__响应__

```
 {
     statusCode: 200,
     headers: { ... },
     data: 21754
 }
```

---------------------------------------

<a name="listdir" />
### listDir(remotePath, limit, order, iter, callback)

遍历指定目录. 

__参数__

* `remotePath` 欲遍历的目录
* `limit` 限定每次请求的列表最大数目
* `order` 以 `last_modified` 的值正序或者倒序排列 `asc`(正序) 或 `desc`(倒序).(Default: `asc`)
* `iter` 遍历的起点（当指定 `limit` 小于实际文件数时，在第二次请求时候，指定此参数，即可继续上次的遍历）

__响应__

```
{
    statusCode: 200,
    headers: {
        'x-upyun-list-iter': 'g2gCZAAEbmV4dGQAA2VvZg'
    },
    data: 'foo.jpg\tN\t4237\t1415096225\nbar\tF\t423404\t1415096260'
}
```

---------------------------------------

<a name="makeDir" />
### makeDir(remotePath, callback)

创建文件夹

__参数__

* `remotePath` 欲创建的目录路径

---------------------------------------

<a name="removeDir" />
### removeDir(remotePath, callback)

删除文件夹

* `remotePath` 欲移除的目录路径

---------------------------------------

<a name="putFile" />
### putFile(remotePath, localFile, type, checksum, opts, callback)

上传文件

__参数__

* `remotePath` 文件存放路径
* `localFile` 欲上传的文件，文件的本地路径 或者文件对应的 buffer
* `type` 指定文件的 `Content-Type`, 如果传 `null`, 这时服务器会自动判断文件类型
* `checksum` 为 `true` 时 SDK 会计算文件的 md5 值并将其传于 API 校验
* `opts` 其他请求头部参数（以 JS 对象格式传入，常用于图片处理等需求）. 更多请参考 [官方 API 文档](http://docs.upyun.com/api/rest_api/#_5)

__响应__

```
{
    statusCode: 200,
    headers: {...
    },
    data: ''
}
```

---------------------------------------

<a name="headFile" />
### headFile(remotePath, callback)

`HEAD` 请求检测文件是否存在

__参数__

* `remotePath` 文件在 upyun 空间的路径

---------------------------------------

<a name="getFile" />
### getFile(remotePath, localPath, callback)

下载文件

__参数__

* `remotePath` 文件在 upyun 空间的路径
* `localPath` 文件在本地存放路径， 如果 `localPath` 为 `null`，文件的内容将会直接在响应的主体中返回


---------------------------------------

<a name="deleteFile" />
### deleteFile(remotePath, callback)

删除文件

__参数__

* `remotePath` 文件在 upyun 空间的路径


<a name="setEndpoint" />
### setEndpoint(endpoint)

切换 API 接入点

__参数__

* `endpoint` 接入点
  * `v0.api.upyun.com` : 自动选择合适的线路
  * `v1.api.upyun.com` : 电信线路
  * `v2.api.upyun.com` : 联通（网通）线路
  * `v3.api.upyun.com` : 移动（铁通）线路


<a name="formPutFile" />
### formPutFile(localFile, opts, signer, callback)

表单上传文件

__参数__

* `localFile` 欲上传的文件，文件的本地路径 或者 文件对应的 buffer
* `opts` 其他请求头部参数（以 JS 对象格式传入，常用于图片处理等需求）. 更多请参考 [官方 API 文档](http://docs.upyun.com/api/form_api/#api_1)
* `signer` 外部签名函数，该参数据接收 `policy` 参数，需要返回签名后的字符串。

__响应__

```
{
    statusCode: 200,
    headers: {...
    },
    data: {
        ...
    }
}
```

__示例__

```
var opts = {
    'save-key': '/test' + tempstr,
    'Content-Type': 'image/jpg',
}
upyun.formPutFile('/path/to/local/file.jpg', opts,
    function(policy){
        return utils.md5sum(policy + '&' + <your secret>);
    },
    function(err, result) {
        consule.log(result);
    }
)
```



<a name="tools" />
# tools

* tools.md5sum(string)
* tools.md5sumFile(file_path, callback)
* tools.makeSign(method, uri, date, length, password, operator)
* tools.policy(opts)
* tools.signature(policy, secret)

__示例__

```
var tools = require('upyun/tools');

tools.md5sum('123456');

tools.md5sumFile('./a.txt', function(err, md5_value) {
    console.log(md5_value)
})

tools.makeSign(method, uri, date, length, password, operator)

tools.signature(policy, secret)
```

# 备注

[upyun npm package](https://www.npmjs.org/package/upyun) 曾为 [James Chen](http://ashchan.com) 所有。

经过与其的交流协商，James 已经将此 npm 包转由 UPYUN 开发团队管理和维护。

后续的代码和版本更新，将于原有的项目无任何直接关系。

在 npm 上, `"upyun": "<=0.0.3"` 是由 [James Chen](http://ashchan.com) 曾开发的 [node-upyun](https://github.com/ashchan/node-upyun) 项目.

__非常感谢  [James Chen](http://ashchan.com) 对 upyun 的支持和贡献__
