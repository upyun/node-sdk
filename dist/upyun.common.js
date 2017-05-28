/**
  * UPYUN js-sdk 3.0.0
  * (c) 2017
  * @license MIT
  */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));
var fs = _interopDefault(require('fs'));
var mime = _interopDefault(require('mime-types'));
var FormData = _interopDefault(require('form-data'));
var hmacsha1 = _interopDefault(require('hmacsha1'));
var base64 = _interopDefault(require('base-64'));
var md5 = _interopDefault(require('md5'));

var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();



























var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var createReq = function (endpoint, bucket, getHeaderSign) {
  var _this = this;

  var req = axios.create({
    baseURL: endpoint + '/' + bucket.bucketName
  });

  req.interceptors.request.use(function () {
    var _ref = asyncToGenerator(regeneratorRuntime.mark(function _callee(config) {
      var method, path;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              method = config.method.toUpperCase();
              path = config.url.substring(config.baseURL.length);
              _context.next = 4;
              return getHeaderSign(bucket, method, path);

            case 4:
              config.headers.common = _context.sent;
              return _context.abrupt('return', config);

            case 6:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }(), function (error) {
    throw new Error('upyun - request failed: ' + error.message);
  });

  req.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
    var response = error.response;

    if (typeof response === 'undefined') {
      throw error;
    }

    if (response.status !== 404) {
      throw new Error('upyun - response error: ' + response.data.code + ' ' + response.data.msg);
    } else {
      return response;
    }
  });
  return req;
};

function readBlockAsync(filePath, start, end) {
  var size = end - start;
  var b = makeBuffer(size);
  return new Promise(function (resolve, reject) {
    fs.open(filePath, 'r', function (err, fd) {
      if (err) {
        return reject(err);
      }

      fs.read(fd, b, 0, size, start, function (err, bytesRead, buffer) {
        if (err) {
          return reject(err);
        }

        return resolve(buffer);
      });
    });
  });
}

function makeBuffer(size) {
  if (Buffer.alloc) {
    return Buffer.alloc(size);
  } else {
    var b = new Buffer(size);
    b.fill(0);
    return b;
  }
}

function getFileSizeAsync(filePath) {
  return new Promise(function (resolve, reject) {
    fs.stat(filePath, function (err, stat) {
      if (err) return reject(err);

      return resolve(stat.size);
    });
  });
}

function getContentType(filePath) {
  return mime.lookup(filePath);
}

var utils = {
  readBlockAsync: readBlockAsync,
  getFileSizeAsync: getFileSizeAsync,
  getContentType: getContentType
};

function formUpload(remoteUrl, localFile, _ref) {
  var authorization = _ref.authorization,
      policy = _ref.policy;

  return new Promise(function (resolve, reject) {
    var data = new FormData();
    data.append('authorization', authorization);
    data.append('policy', policy);
    data.append('file', localFile);
    data.submit(remoteUrl, function (err, res) {
      if (err) {
        return reject(err);
      }

      return resolve(res.statusCode === 200);
    });
  });
}

var name = "upyun";
var version = "3.0.0";
var description = "UPYUN js sdk";
var main = "dist/upyun.common.js";
var unpkg = "dist/upyun.js";
var scripts = { "build": "node build/build.js", "test": "npm run test:server && npm run test:client", "test:client": "./node_modules/.bin/karma start tests/karma.conf.js", "test:server": "./node_modules/.bin/mocha --compilers js:babel-register tests/server/*" };
var repository = { "type": "git", "url": "git@github.com:upyun/node-sdk.git" };
var keywords = ["upyun", "js", "nodejs", "sdk", "cdn", "cloud", "storage"];
var author = "Leigh";
var license = "MIT";
var bugs = { "url": "https://github.com/upyun/node-sdk/issues" };
var homepage = "https://github.com/upyun/node-sdk";
var contributors = [{ "name": "yejingx", "email": "yejingx@gmail.com" }, { "name": "Leigh", "email": "i@zhuli.me" }, { "name": "kaidiren", "email": "kaidiren@gmail.com" }, { "name": "Gaara", "email": "sabakugaara@users.noreply.github.com" }];
var devDependencies = { "babel-cli": "^6.24.1", "babel-loader": "^7.0.0", "babel-plugin-external-helpers": "^6.22.0", "babel-plugin-transform-runtime": "^6.23.0", "babel-preset-env": "^1.4.0", "babel-register": "^6.24.1", "chai": "^3.5.0", "istanbul": "^0.4.3", "karma": "^1.7.0", "karma-chrome-launcher": "^2.1.1", "karma-mocha": "^1.3.0", "karma-sourcemap-loader": "^0.3.7", "karma-webpack": "^2.0.3", "mocha": "^3.4.1", "rollup": "^0.41.6", "rollup-plugin-alias": "^1.3.1", "rollup-plugin-babel": "^2.7.1", "rollup-plugin-commonjs": "^8.0.2", "rollup-plugin-json": "^2.1.1", "rollup-plugin-node-resolve": "^3.0.0", "rollup-plugin-replace": "^1.1.1", "should": "^9.0.2", "uglify-js": "^3.0.11", "webpack": "^2.5.1" };
var dependencies = { "axios": "^0.16.1", "base-64": "^0.1.0", "form-data": "^2.1.4", "hmacsha1": "^1.0.0", "md5": "^2.2.1", "mime-types": "^2.1.15" };
var browser = { "./upyun/utils.js": "./upyun/browser-utils.js", "./upyun/form-upload.js": "./upyun/browser-form-upload.js" };
var peerDependencies = { "babel-polyfill": "^6.23.0" };
var pkg = {
	name: name,
	version: version,
	description: description,
	main: main,
	unpkg: unpkg,
	scripts: scripts,
	repository: repository,
	keywords: keywords,
	author: author,
	license: license,
	bugs: bugs,
	homepage: homepage,
	contributors: contributors,
	devDependencies: devDependencies,
	dependencies: dependencies,
	browser: browser,
	peerDependencies: peerDependencies
};

/**
 * generate head sign
 * @param {object} bucket
 * @param {string} path - storage path on upyun server, e.g: /your/dir/example.txt
 * @param {string} contentMd5 - md5 of the file that will be uploaded
 */
function getHeaderSign(bucket, method, path) {
  var contentMd5 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var date = new Date().toGMTString();
  path = '/' + bucket.bucketName + path;
  var sign = genSign(bucket, {
    method: method,
    path: path,
    date: date,
    contentMd5: contentMd5
  });
  return {
    'Authorization': sign,
    'X-Date': date,
    'User-Agent': 'Js-Sdk/' + pkg.version
  };
}

/**
 * generate signature string which can be used in head sign or body sign
 * @param {object} bucket
 * @param {object} options - must include key is method, path
 */
function genSign(bucket, options) {
  var method = options.method,
      path = options.path;


  var data = [method, path];

  // optional params
  ['date', 'policy', 'contentMd5'].forEach(function (item) {
    if (options[item]) {
      data.push(options[item]);
    }
  });

  // hmacsha1 return base64 encoded string
  var sign = hmacsha1(bucket.password, data.join('&'));
  return 'UPYUN ' + bucket.operatorName + ':' + sign;
}

/**
 * get policy and authorization for form api
 * @param {object} bucket
 * @param {object} - other optional params @see http://docs.upyun.com/api/form_api/#_2
 */
function getPolicyAndAuthorization(bucket, params) {
  params['bucket'] = bucket.bucketName;
  if (typeof params['save-key'] === 'undefined') {
    throw new Error('upyun - calclate body sign need save-key');
  }

  if (typeof params['expiration'] === 'undefined') {
    // default 30 minutes
    params['expiration'] = parseInt(new Date() / 1000 + 30 * 60, 10);
  }

  var policy = base64.encode(JSON.stringify(params));
  var authorization = genSign(bucket, {
    method: 'POST',
    path: '/' + bucket.bucketName,
    policy: policy
  });
  return {
    policy: policy,
    authorization: authorization
  };
}

var sign = {
  genSign: genSign,
  getHeaderSign: getHeaderSign,
  getPolicyAndAuthorization: getPolicyAndAuthorization
};

var Upyun = function () {
  /**
   * @param {object} bucket - a instance of Bucket class
   * @param {object} params - optional params
   * @param {callback} getHeaderSign - callback function to get header sign
   */
  function Upyun(bucket) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var getHeaderSign$$1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    classCallCheck(this, Upyun);

    var isBrowser = typeof window !== 'undefined';

    if (typeof bucket.bucketName === 'undefined') {
      throw new Error('upyun - must config bucketName');
    }

    if (typeof params === 'function') {
      getHeaderSign$$1 = params;
      params = {};
    }

    if (typeof getHeaderSign$$1 !== 'function' && isBrowser) {
      throw new Error('upyun - must config a callback function getHeaderSign in client side');
    }

    if (!isBrowser && (typeof bucket.operatorName === 'undefined' || typeof bucket.password === 'undefined')) {
      throw new Error('upyun - must config operateName and password in server side');
    }
    this.isBrowser = isBrowser;

    var config = Object.assign({
      domain: 'v0.api.upyun.com',
      protocol: 'https'
    }, params);
    this.endpoint = config.protocol + '://' + config.domain;

    this.req = createReq(this.endpoint, bucket, getHeaderSign$$1 || defaultGetHeaderSign);
    this.bucket = bucket;
    if (!isBrowser) {
      this.setBodySignCallback(sign.getPolicyAndAuthorization);
    }
  }

  createClass(Upyun, [{
    key: 'setBucket',
    value: function setBucket(bucket) {
      this.bucket = bucket;
      this.req.defaults.baseURL = this.endpoint + '/' + this.bucketName;
    }
  }, {
    key: 'setBodySignCallback',
    value: function setBodySignCallback(getBodySign) {
      if (typeof getBodySign !== 'function') {
        throw new Error('upyun - getBodySign should be a function');
      }
      this.bodySignCallback = getBodySign;
    }
  }, {
    key: 'usage',
    value: function () {
      var _ref = asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';

        var _ref2, data;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                path = encodeURI(path + '?usage');
                _context.next = 3;
                return this.req.get(path);

              case 3:
                _ref2 = _context.sent;
                data = _ref2.data;
                return _context.abrupt('return', data);

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function usage() {
        return _ref.apply(this, arguments);
      }

      return usage;
    }()
  }, {
    key: 'listDir',
    value: function () {
      var _ref3 = asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';

        var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            _ref4$limit = _ref4.limit,
            limit = _ref4$limit === undefined ? 100 : _ref4$limit,
            _ref4$order = _ref4.order,
            order = _ref4$order === undefined ? 'asc' : _ref4$order,
            _ref4$iter = _ref4.iter,
            iter = _ref4$iter === undefined ? '' : _ref4$iter;

        var requestHeaders, _ref5, data, headers, status, next, items, files;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                path = encodeURI(path);
                requestHeaders = {
                  'x-list-limit': limit,
                  'x-list-order': order
                };


                if (iter) {
                  requestHeaders['x-list-iter'] = iter;
                }

                _context2.next = 5;
                return this.req.get(path, {
                  headers: requestHeaders
                });

              case 5:
                _ref5 = _context2.sent;
                data = _ref5.data;
                headers = _ref5.headers;
                status = _ref5.status;

                if (!(status === 404)) {
                  _context2.next = 11;
                  break;
                }

                return _context2.abrupt('return', false);

              case 11:
                next = headers['x-upyun-list-iter'];

                if (data) {
                  _context2.next = 14;
                  break;
                }

                return _context2.abrupt('return', {
                  files: [],
                  next: next
                });

              case 14:
                items = data.split('\n');
                files = items.map(function (item) {
                  var _item$split = item.split('\t'),
                      _item$split2 = slicedToArray(_item$split, 4),
                      name = _item$split2[0],
                      type = _item$split2[1],
                      size = _item$split2[2],
                      time = _item$split2[3];

                  return {
                    name: name,
                    type: type,
                    size: parseInt(size),
                    time: parseInt(time)
                  };
                });
                return _context2.abrupt('return', {
                  files: files,
                  next: next
                });

              case 17:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function listDir() {
        return _ref3.apply(this, arguments);
      }

      return listDir;
    }()

    /**
     * @param localFile: file content, available type is Stream | String | Buffer for server; File | String for client
     * @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send
     * @see https://github.com/mzabriskie/axios/blob/master/lib/adapters/http.js#L32
     */

  }, {
    key: 'putFile',
    value: function () {
      var _ref6 = asyncToGenerator(regeneratorRuntime.mark(function _callee3(remotePath, localFile) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var path, keys, headers, _ref7, responseHeaders, status, params, result;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                path = encodeURI(remotePath);
                // optional params
                // TODO header params more better 

                keys = ['Content-MD5', 'Content-Length', 'Content-Type', 'Content-Secret', 'x-gmkerl-thumb'];
                headers = {};

                keys.forEach(function (key) {
                  if (options[key]) {
                    headers[key] = options[key];
                  } else if (isMeta(key)) {
                    headers[key] = options[key];
                  }
                });

                _context3.next = 6;
                return this.req.put(path, localFile, {
                  headers: headers
                });

              case 6:
                _ref7 = _context3.sent;
                responseHeaders = _ref7.headers;
                status = _ref7.status;

                if (!(status === 200)) {
                  _context3.next = 16;
                  break;
                }

                // TODO process prefix x-upyun
                params = ['x-upyun-width', 'x-upyun-height', 'x-upyun-file-type', 'x-upyun-frames'];
                result = {};

                params.forEach(function (item) {
                  var key = item.split('x-upyun-')[1];
                  if (responseHeaders[item]) {
                    result[key] = responseHeaders[item];
                    if (key !== 'file-type') {
                      result[key] = parseInt(result[key], 10);
                    }
                  }
                });
                return _context3.abrupt('return', Object.keys(result).length > 0 ? result : true);

              case 16:
                return _context3.abrupt('return', false);

              case 17:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function putFile(_x7, _x8) {
        return _ref6.apply(this, arguments);
      }

      return putFile;
    }()
  }, {
    key: 'makeDir',
    value: function () {
      var _ref8 = asyncToGenerator(regeneratorRuntime.mark(function _callee4(remotePath) {
        var _ref9, status;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.req.post(remotePath, null, {
                  headers: { folder: 'true' }
                });

              case 2:
                _ref9 = _context4.sent;
                status = _ref9.status;
                return _context4.abrupt('return', status === 200);

              case 5:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function makeDir(_x9) {
        return _ref8.apply(this, arguments);
      }

      return makeDir;
    }()
  }, {
    key: 'headFile',
    value: function () {
      var _ref10 = asyncToGenerator(regeneratorRuntime.mark(function _callee5(remotePath) {
        var _ref11, headers, status, params, result;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.req.head(remotePath);

              case 2:
                _ref11 = _context5.sent;
                headers = _ref11.headers;
                status = _ref11.status;

                if (!(status === 404)) {
                  _context5.next = 7;
                  break;
                }

                return _context5.abrupt('return', false);

              case 7:
                params = ['x-upyun-file-type', 'x-upyun-file-size', 'x-upyun-file-date', 'Content-Md5'];
                result = {};

                params.forEach(function (item) {
                  var key = item.split('x-upyun-file-')[1];
                  if (headers[item]) {
                    result[key] = headers[item];
                    if (key === 'size' || key === 'date') {
                      result[key] = parseInt(result[key], 10);
                    }
                  }
                });
                return _context5.abrupt('return', result);

              case 11:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function headFile(_x10) {
        return _ref10.apply(this, arguments);
      }

      return headFile;
    }()
  }, {
    key: 'deleteFile',
    value: function () {
      var _ref12 = asyncToGenerator(regeneratorRuntime.mark(function _callee6(remotePath) {
        var _ref13, status;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.req.delete(remotePath);

              case 2:
                _ref13 = _context6.sent;
                status = _ref13.status;
                return _context6.abrupt('return', status === 200);

              case 5:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function deleteFile(_x11) {
        return _ref12.apply(this, arguments);
      }

      return deleteFile;
    }()
  }, {
    key: 'deleteDir',
    value: function () {
      var _ref14 = asyncToGenerator(regeneratorRuntime.mark(function _callee7(remotePath) {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.deleteFile(remotePath);

              case 2:
                return _context7.abrupt('return', _context7.sent);

              case 3:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function deleteDir(_x12) {
        return _ref14.apply(this, arguments);
      }

      return deleteDir;
    }()
  }, {
    key: 'getFile',
    value: function () {
      var _ref15 = asyncToGenerator(regeneratorRuntime.mark(function _callee8(remotePath) {
        var saveStream = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var response, stream;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                if (!(saveStream && typeof window !== 'undefined')) {
                  _context8.next = 2;
                  break;
                }

                throw new Error('upyun - save as stream are only available on the server side.');

              case 2:
                _context8.next = 4;
                return this.req({
                  method: 'GET',
                  url: remotePath,
                  responseType: saveStream ? 'stream' : null
                });

              case 4:
                response = _context8.sent;

                if (!(response.status === 404)) {
                  _context8.next = 7;
                  break;
                }

                return _context8.abrupt('return', false);

              case 7:
                if (saveStream) {
                  _context8.next = 9;
                  break;
                }

                return _context8.abrupt('return', response.data);

              case 9:
                stream = response.data.pipe(saveStream);
                return _context8.abrupt('return', new Promise(function (resolve, reject) {
                  stream.on('finish', function () {
                    return resolve(stream);
                  });

                  stream.on('error', reject);
                }));

              case 11:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function getFile(_x14) {
        return _ref15.apply(this, arguments);
      }

      return getFile;
    }()
  }, {
    key: 'updateMetadata',
    value: function () {
      var _ref16 = asyncToGenerator(regeneratorRuntime.mark(function _callee9(remotePath, metas) {
        var operate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'merge';

        var metaHeaders, key, _ref17, status;

        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                metaHeaders = {};

                for (key in metas) {
                  if (!isMeta(key)) {
                    metaHeaders['x-upyun-meta-' + key] = metas[key];
                  } else {
                    metaHeaders[key] = metas;
                  }
                }
                _context9.next = 4;
                return this.req.patch(remotePath + '?metadata=' + operate, null, { headers: metaHeaders });

              case 4:
                _ref17 = _context9.sent;
                status = _ref17.status;
                return _context9.abrupt('return', status === 200);

              case 7:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function updateMetadata(_x16, _x17) {
        return _ref16.apply(this, arguments);
      }

      return updateMetadata;
    }()

    // be careful: this will download the entire file

  }, {
    key: 'getMetadata',
    value: function () {
      var _ref18 = asyncToGenerator(regeneratorRuntime.mark(function _callee10(remotePath) {
        var _ref19, headers, status, result, key;

        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return this.req.get(remotePath);

              case 2:
                _ref19 = _context10.sent;
                headers = _ref19.headers;
                status = _ref19.status;

                if (!(status !== 200)) {
                  _context10.next = 7;
                  break;
                }

                return _context10.abrupt('return', false);

              case 7:
                result = {};

                for (key in headers) {
                  if (isMeta(key)) {
                    result[key] = headers[key];
                  }
                }

                return _context10.abrupt('return', result);

              case 10:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function getMetadata(_x18) {
        return _ref18.apply(this, arguments);
      }

      return getMetadata;
    }()

    /**
     * in browser: type of fileOrPath is File
     * in server: type of fileOrPath is string: local file path
     */

  }, {
    key: 'blockUpload',
    value: function () {
      var _ref20 = asyncToGenerator(regeneratorRuntime.mark(function _callee11(remotePath, fileOrPath) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var isBrowser, fileSize, contentType, _ref21, headers, uuid, nextId, block, blockSize, start, end, _ref22, _headers, _ref23, status;

        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                isBrowser = typeof window !== 'undefined';
                fileSize = void 0;
                contentType = void 0;

                if (!isBrowser) {
                  _context11.next = 8;
                  break;
                }

                fileSize = fileOrPath.size;
                contentType = fileOrPath.type;
                _context11.next = 12;
                break;

              case 8:
                _context11.next = 10;
                return utils.getFileSizeAsync(fileOrPath);

              case 10:
                fileSize = _context11.sent;

                contentType = utils.getContentType(fileOrPath);

              case 12:

                Object.assign(options, {
                  'x-upyun-multi-stage': 'initiate',
                  'x-upyun-multi-length': fileSize,
                  'x-upyun-multi-type': contentType
                });

                _context11.next = 15;
                return this.req.put(remotePath, null, {
                  headers: options
                });

              case 15:
                _ref21 = _context11.sent;
                headers = _ref21.headers;
                uuid = headers['x-upyun-multi-uuid'];
                nextId = headers['x-upyun-next-part-id'];
                block = void 0;

              case 20:
                blockSize = 1024 * 1024;
                start = nextId * blockSize;
                end = Math.min(start + blockSize, fileSize);
                _context11.next = 25;
                return utils.readBlockAsync(fileOrPath, start, end);

              case 25:
                block = _context11.sent;
                _context11.next = 28;
                return this.req.put(remotePath, block, {
                  headers: {
                    'x-upyun-multi-stage': 'upload',
                    'x-upyun-multi-uuid': uuid,
                    'x-upyun-part-id': nextId
                  }
                });

              case 28:
                _ref22 = _context11.sent;
                _headers = _ref22.headers;

                nextId = _headers['x-upyun-next-part-id'];

              case 31:
                if (nextId !== '-1') {
                  _context11.next = 20;
                  break;
                }

              case 32:
                _context11.next = 34;
                return this.req.put(remotePath, null, {
                  headers: {
                    'x-upyun-multi-stage': 'complete',
                    'x-upyun-multi-uuid': uuid
                  }
                });

              case 34:
                _ref23 = _context11.sent;
                status = _ref23.status;
                return _context11.abrupt('return', status === 204 || status === 201);

              case 37:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function blockUpload(_x20, _x21) {
        return _ref20.apply(this, arguments);
      }

      return blockUpload;
    }()
  }, {
    key: 'formPutFile',
    value: function () {
      var _ref24 = asyncToGenerator(regeneratorRuntime.mark(function _callee12(remotePath, localFile) {
        var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var bodySign, result;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                if (!(typeof this.bodySignCallback !== 'function')) {
                  _context12.next = 2;
                  break;
                }

                throw new Error('upyun - must setBodySignCallback first!');

              case 2:

                params['bucket'] = this.bucket.bucketName;
                params['save-key'] = remotePath;
                _context12.next = 6;
                return this.bodySignCallback(this.bucket, params);

              case 6:
                bodySign = _context12.sent;
                _context12.next = 9;
                return formUpload(this.endpoint + '/' + params['bucket'], localFile, bodySign);

              case 9:
                result = _context12.sent;
                return _context12.abrupt('return', result);

              case 11:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function formPutFile(_x23, _x24) {
        return _ref24.apply(this, arguments);
      }

      return formPutFile;
    }()
  }]);
  return Upyun;
}();

function isMeta(key) {
  return key.indexOf('x-upyun-meta-') === 0;
}

function defaultGetHeaderSign(bucket, method, path) {
  var headers = sign.getHeaderSign(bucket, method, path);
  return Promise.resolve(headers);
}

var Bucket = function Bucket(bucketName) {
  var operatorName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var password = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  classCallCheck(this, Bucket);

  this.bucketName = bucketName;
  this.operatorName = operatorName;
  this.password = md5(password);
};

var index = {
  Client: Upyun,
  sign: sign,
  Bucket: Bucket
};

module.exports = index;
