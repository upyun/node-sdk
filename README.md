# UPYUN Js SDK
[![NPM version](https://img.shields.io/npm/v/upyun.svg?style=flat)](https://www.npmjs.org/package/upyun)
[![Build Status](https://travis-ci.org/upyun/node-sdk.svg?branch=master)](https://travis-ci.org/upyun/node-sdk)

upyun js sdk, 集成：

* [UPYUN HTTP REST 接口](http://docs.upyun.com/api/rest_api/)
* [UPYUN HTTP FORM 接口](http://docs.upyun.com/api/form_api/)

可以运行在浏览器端或服务端
- 浏览器端不能设置操作员账号名和密码
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

# 初始化

```
const bucket = new Upyun.Bucket('your bucket name', 'your operator name', 'your operator password')
const upyun = new Upyun.Client(bucket);
```

# 示例

```
upyun.usage('/').then(function(size) {
  console.log('dir size: ', size)
})
```

# 备注

[upyun npm package](https://www.npmjs.org/package/upyun) 曾为 [James Chen](http://ashchan.com) 所有。

经过与其的交流协商，James 已经将此 npm 包转由 UPYUN 开发团队管理和维护。

后续的代码和版本更新，将于原有的项目无任何直接关系。

在 npm 上, `"upyun": "<=0.0.3"` 是由 [James Chen](http://ashchan.com) 曾开发的 [node-upyun](https://github.com/ashchan/node-upyun) 项目.

__非常感谢  [James Chen](http://ashchan.com) 对 upyun 的支持和贡献__
