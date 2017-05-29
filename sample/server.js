require('babel-polyfill')
const http = require('http')
const url = require('url')
const util = require('util')
const upyun = require('../')
const fs = require('fs')

const bucket = new upyun.Bucket('sdkimg', 'tester', 'grjxv2mxELR3')

http.createServer(function(req, res) {
  if (req.url.indexOf('index.html') !== -1 || req.url === '/') {
    res.end(fs.readFileSync('./index.html', 'utf-8'))
  } else if (req.url.indexOf('upyun.js') !== -1) {
    res.end(fs.readFileSync('../dist/upyun.js', 'utf-8'))
  } else if (req.url.indexOf('/sign/head') !== -1) {
    const query = url.parse(req.url, true).query
    const headSign = upyun.sign.getHeaderSign(bucket, query.method, query.path)
    res.end(JSON.stringify(headSign))
  } else {
    res.statusCode(404)
  }
}).listen(3000)

