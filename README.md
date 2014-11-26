# node-upyun
[![NPM version](https://img.shields.io/npm/v/upyun.svg?style=flat-square)](https://www.npmjs.org/package/upyun)
[![NPM downloads](https://img.shields.io/npm/dm/upyun.svg?style=flat-square)](https://www.npmjs.org/package/upyun)
[![Build status](https://img.shields.io/travis/upyun/node-upyun.svg?style=flat-square)](https://travis-ci.org/upyun/node-upyun)

official upyun sdk for node.js

[中文说明](https://github.com/upyun/node-upyun/wiki/%E4%B8%AD%E6%96%87%E8%AF%B4%E6%98%8E)

__Currently only works with `legacy` API(the current online API)__

# Install
```sh
$ npm install upyun --save
```

# Init
```js
var upyun = new UPYUN(bucket, operator, password, endpoint, apiVersion);
```

__Arguments__

* `bucket`: your upyun bucket's name.
* `operator`: operator which is granted permisson to `bucket`
* `password`: passowrd for the operator which is granted permisson to `bucket`
* `endpoint` The value can be these(leave blank to let sdk auto select the best one):
  * `ctcc` or `v1`: China Telecom
  * `cucc` or `v2`: China Unicom
  * `cmcc` or `v3` China Mobile
  * `v0` or any other string: Will use `v0.api.upyun.com` (auto detect routing)
* `apiVersion`: API version.
  * `'legacy'`: current online api.(currently, it is the default)
    * when you choose `legacy`, it make an instance by [upyun-legacy](https://www.npmjs.org/package/upyun-legacy), they have the same methods name as the `latest` version. But the response data may not has the same format. More detail at [upyun-legacy/README.md](https://github.com/lisposter/node-upyun-legacy/blob/master/README.md)
  * `'latest'`: the bleeding-edge.(__Not available now.__)

# Example 
```js
var UPYUN = require('upyun');

var upyun = new UPYUN('testbucket', 'operatername', 'operaterpwd', 'ctcc', 'legacy');

upyun.getUsage(function(err, result) {
    //...
})
```

# Response
In this SDK, every api will return a response in the format:

#### Normal

```js
{
    statusCode: 200,    // http stats code
    headers: {
        server: 'nginx/1.1.19',
        date: 'Wed, 13 Aug 2014 02:15:27 GMT',
        'content-type': 'application/json',
        'content-length': '24',
        connection: 'close'
    },                  // response header
    data: {
        space: 2501,
        files: 1
    }                   // response body
}
```

#### Error catch
When an error occured, the error will be catched, and returned in the response

```js
{
    statusCode: 401,    // http stats code
    error: {
        error_code: 40104,
        request: 'GET /imgtest',
        message: 'Signature error, (signature = md5(METHOD&PATH&DATE&CONTENT_LENGTH&MD5(PASSWORD))).'
    },                  // error message
    headers: {
        server: 'nginx/1.1.19',
        date: 'Wed, 13 Aug 2014 02:19:07 GMT',
        'content-type': 'application/json',
        'content-length': '145',
        connection: 'close',
        'www-authenticate': 'Basic realm="UpYun"'
    }                   // response header
}
```

The different between these two responses is the `error` and `body`.

All responses contain http status code and raw response header for futher usage.


# Docs
## API
* [`getUsage`](#getUsage)
* [`listDir`](#listDir)
* [`createDir`](#createDir)
* [`removeDir`](#removeDir)
* [`uploadFile`](#uploadFile)
* [`existsFile`](#existsFile)
* [`downloadFile`](#downloadFile)
* [`removeFile`](#removeFile)

## Utils

* [`setEndpoint`](#setEndpoint)


# API

<a name="getUsage" />
### getUsage(callback)
To get how many quota has been used.(Unit:`Byte`)

__Response__

```js
 {
     statusCode: 200,
     headers: { ... },
     data: {
         space: 21754,
         files: 50
     }
 }
```

---------------------------------------

<a name="" />
### listDir(remotePath, [limit], [order], [iter], callback)
Get the file list of that dir. The response contains each item's type(file or dir), size(unit: `Byte`), last modify time.

__Arguments__
* `remote_dir_path` The dir path which you want to traverse.
* `limit` Specifies the maximum number of file list output per request.
* `order` Sort the file list by 'last_modified' as `asc` or `desc`.(Default: `asc`)
* `iter` Specifies the start of iteration.

__Response__

```js
{
    statusCode: 200,
    headers: {...
    },
    data: {
        "files": [{
            "name": "test",
            "type": "folder",
            "last_modified": 1412046146
        }],
        "iter": "g2gCZAAEbmV4dGQAA2VvZg"
    }
}
```

---------------------------------------

<a name="createDir" />
### createDir(remotePath, callback)
Create a new dir in UPYUN bucket.

__Arguments__
* `remotePath` The dir path which you want to create.

---------------------------------------

<a name="removeDir" />
### removeDir(remotePath, callback)
Delete a dir

* `remotePath` The dir path which you want to remove.

---------------------------------------

<a name="uploadFile" />
### uploadFile(remotePath, localFile, type, checksum, [opts], callback)
Upload a file into UPYUN bucket.

__Arguments__
* `remotePath` Where the file will be stored in your UPYUN bucket.
* `localFile` The file you want to upload. It can be a `path` string or the file's raw data.
* `type` Specifies the file's content-type.
* `checksum` Set `true` to force SDK send a md5 of local file to UPYUN. Or set a md5value string by yourself.
* `opts` The additional http request headers(JavaScript Object). More detail in [Official Docs](http://docs.upyun.com/api/rest_api/#_4)

---------------------------------------

<a name="existsFile" />
### existsFile(remotePath, callback)
`HEAD` a path to detect if there is an file.

__Arguments__
* `remotePath` The file's path in your UPYUN bucket.

---------------------------------------

<a name="downloadFile" />
### downloadFile(remotePath, [localPath], callback)
Download a file from UPYUN bucket.

__Arguments__
* `remotePath` The file's path in your UPYUN bucket.
* `localPath` Where the file will save to. If no `localPath`, the file's content will output directly in the response body.


---------------------------------------

<a name="removeFile" />
### removeFile(remotePath, callback)
Delete a file from UPYUN bucket.

__Arguments__
* `remotePath` The file's path in your UPYUN bucket.

# Utils

<a name="setEndpoint" />
### setEndpoint(endpoint)
Use this method to set api endpoint manually.

__Arguments__
* `endpoint` The value can be these(leave blank to let sdk auto select the best one):
  * `ctcc` or `v1`: China Telecom
  * `cucc` or `v2`: China Unicom
  * `cmcc` or `v3` China Mobile
  * `v0` or any other string: Will use `v0.api.upyun.com` (auto detect routing)


# Note

The previous owner of [`upyun npm package`](https://www.npmjs.org/package/upyun) was [James Chen](http://ashchan.com) 

After consultation with James, this package has been transfered to official upyun develop team.

Any futher update and maintenance will conducted by upyun develop team and subsequent versions will not be associated with the original project.

In npm registry, `"upyun": "<=0.0.3"` were published as [node-upyun](https://github.com/ashchan/node-upyun) by [James Chen](http://ashchan.com).

__Thanks to  [James Chen](http://ashchan.com)  for his contribution to UPYUN.__
