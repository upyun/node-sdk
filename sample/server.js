const http = require('http')
const url = require('url')
const util = require('util')
const upyun = require('../')
const fs = require('fs')
const path = require('path')

const bucket = new upyun.Bucket('sdkimg', 'tester', 'grjxv2mxELR3')

http.createServer(function(req, res) {
  if (req.url.indexOf('index.html') !== -1 || req.url === '/') {
    res.end(fs.readFileSync(path.join(__dirname, './index.html'), 'utf-8'))
  } else if (req.url.indexOf('upyun.js') !== -1) {
    res.end(fs.readFileSync(path.join(__dirname, '../dist/upyun.js'), 'utf-8'))
  } else if (req.url.indexOf('/sign/head') !== -1) {
    const query = url.parse(req.url, true).query
    const headSign = upyun.sign.getHeaderSign(bucket, query.method, query.path)
    res.end(JSON.stringify(headSign))
  } else {
    res.writeHead(404)
    res.end()
  }
}).listen(3000)

