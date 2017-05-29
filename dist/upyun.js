/**
  * UPYUN js-sdk 3.0.0
  * (c) 2017
  * @license MIT
  */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('axios')) :
	typeof define === 'function' && define.amd ? define(['axios'], factory) :
	(global.upyun = factory(global.axios));
}(this, (function (axios) { 'use strict';

axios = 'default' in axios ? axios['default'] : axios;

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

              config.url = encodeURI(config.url);
              path = config.url.substring(config.baseURL.length);
              _context.next = 5;
              return getHeaderSign(bucket, method, path);

            case 5:
              config.headers.common = _context.sent;
              return _context.abrupt('return', config);

            case 7:
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

function readBlockAsync(localFile, start, end) {
  return new Promise(function (resolve, reject) {
    var slice = localFile.slice || localFile.mozSlice || localFile.webkitSlice;
    if (slice) {
      return resolve(slice.call(localFile, start, end));
    } else {
      return reject(new Error('not support File type!'));
    }
  });
}

var utils = {
  readBlockAsync: readBlockAsync
};

var formUpload = (function () {
  var _ref2 = asyncToGenerator(regeneratorRuntime.mark(function _callee(remoteUrl, localFile, _ref) {
    var authorization = _ref.authorization,
        policy = _ref.policy;

    var data, _ref3, status;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            data = new FormData();

            data.append('authorization', authorization);
            data.append('policy', policy);
            data.append('file', localFile);
            _context.next = 6;
            return axios.post(remoteUrl, data);

          case 6:
            _ref3 = _context.sent;
            status = _ref3.status;
            return _context.abrupt('return', status === 200);

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function formUpload(_x, _x2, _x3) {
    return _ref2.apply(this, arguments);
  }

  return formUpload;
})();

/* OAuthSimple
* A simpler version of OAuth
*
* author:     jr conlin
* mail:       src@anticipatr.com
* copyright:  unitedHeroes.net
* version:    1.0
* url:        http://unitedHeroes.net/OAuthSimple
*
* Copyright (c) 2009, unitedHeroes.net
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*     * Redistributions of source code must retain the above copyright
*       notice, this list of conditions and the following disclaimer.
*     * Redistributions in binary form must reproduce the above copyright
*       notice, this list of conditions and the following disclaimer in the
*       documentation and/or other materials provided with the distribution.
*     * Neither the name of the unitedHeroes.net nor the
*       names of its contributors may be used to endorse or promote products
*       derived from this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY UNITEDHEROES.NET ''AS IS'' AND ANY
* EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL UNITEDHEROES.NET BE LIABLE FOR ANY
* DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/**
* Computes a HMAC-SHA1 code.
*
* @param {string} k Secret key.
* @param {string} d Data to be hashed.
* @return {string} The hashed string.
*/
function b64_hmac_sha1(k,d,_p,_z){
  // heavily optimized and compressed version of http://pajhome.org.uk/crypt/md5/sha1.js
  // _p = b64pad, _z = character size; not used here but I left them available just in case
  if(!_p){_p='=';}if(!_z){_z=8;}function _f(t,b,c,d){if(t<20){return(b&c)|((~b)&d);}if(t<40){return b^c^d;}if(t<60){return(b&c)|(b&d)|(c&d);}return b^c^d;}function _k(t){return(t<20)?1518500249:(t<40)?1859775393:(t<60)?-1894007588:-899497514;}function _s(x,y){var l=(x&0xFFFF)+(y&0xFFFF),m=(x>>16)+(y>>16)+(l>>16);return(m<<16)|(l&0xFFFF);}function _r(n,c){return(n<<c)|(n>>>(32-c));}function _c(x,l){x[l>>5]|=0x80<<(24-l%32);x[((l+64>>9)<<4)+15]=l;var w=[80],a=1732584193,b=-271733879,c=-1732584194,d=271733878,e=-1009589776;for(var i=0;i<x.length;i+=16){var o=a,p=b,q=c,r=d,s=e;for(var j=0;j<80;j++){if(j<16){w[j]=x[i+j];}else{w[j]=_r(w[j-3]^w[j-8]^w[j-14]^w[j-16],1);}var t=_s(_s(_r(a,5),_f(j,b,c,d)),_s(_s(e,w[j]),_k(j)));e=d;d=c;c=_r(b,30);b=a;a=t;}a=_s(a,o);b=_s(b,p);c=_s(c,q);d=_s(d,r);e=_s(e,s);}return[a,b,c,d,e];}function _b(s){var b=[],m=(1<<_z)-1;for(var i=0;i<s.length*_z;i+=_z){b[i>>5]|=(s.charCodeAt(i/8)&m)<<(32-_z-i%32);}return b;}function _h(k,d){var b=_b(k);if(b.length>16){b=_c(b,k.length*_z);}var p=[16],o=[16];for(var i=0;i<16;i++){p[i]=b[i]^0x36363636;o[i]=b[i]^0x5C5C5C5C;}var h=_c(p.concat(_b(d)),512+d.length*_z);return _c(o.concat(h),512+160);}function _n(b){var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",s='';for(var i=0;i<b.length*4;i+=3){var r=(((b[i>>2]>>8*(3-i%4))&0xFF)<<16)|(((b[i+1>>2]>>8*(3-(i+1)%4))&0xFF)<<8)|((b[i+2>>2]>>8*(3-(i+2)%4))&0xFF);for(var j=0;j<4;j++){if(i*8+j*6>b.length*32){s+=_p;}else{s+=t.charAt((r>>6*(3-j))&0x3F);}}}return s;}function _x(k,d){return _n(_h(k,d));}return _x(k,d);
}
var index$1 = b64_hmac_sha1;

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var base64 = createCommonjsModule(function (module, exports) {
/*! http://mths.be/base64 v0.1.0 by @mathias | MIT license */
(function(root) {

	// Detect free variables `exports`.
	var freeExports = 'object' == 'object' && exports;

	// Detect free variable `module`.
	var freeModule = 'object' == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code, and use
	// it as `root`.
	var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var InvalidCharacterError = function(message) {
		this.message = message;
	};
	InvalidCharacterError.prototype = new Error;
	InvalidCharacterError.prototype.name = 'InvalidCharacterError';

	var error = function(message) {
		// Note: the error messages used throughout this file match those used by
		// the native `atob`/`btoa` implementation in Chromium.
		throw new InvalidCharacterError(message);
	};

	var TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	// http://whatwg.org/html/common-microsyntaxes.html#space-character
	var REGEX_SPACE_CHARACTERS = /[\t\n\f\r ]/g;

	// `decode` is designed to be fully compatible with `atob` as described in the
	// HTML Standard. http://whatwg.org/html/webappapis.html#dom-windowbase64-atob
	// The optimized base64-decoding algorithm used is based on @atk’s excellent
	// implementation. https://gist.github.com/atk/1020396
	var decode = function(input) {
		input = String(input)
			.replace(REGEX_SPACE_CHARACTERS, '');
		var length = input.length;
		if (length % 4 == 0) {
			input = input.replace(/==?$/, '');
			length = input.length;
		}
		if (
			length % 4 == 1 ||
			// http://whatwg.org/C#alphanumeric-ascii-characters
			/[^+a-zA-Z0-9/]/.test(input)
		) {
			error(
				'Invalid character: the string to be decoded is not correctly encoded.'
			);
		}
		var bitCounter = 0;
		var bitStorage;
		var buffer;
		var output = '';
		var position = -1;
		while (++position < length) {
			buffer = TABLE.indexOf(input.charAt(position));
			bitStorage = bitCounter % 4 ? bitStorage * 64 + buffer : buffer;
			// Unless this is the first of a group of 4 characters…
			if (bitCounter++ % 4) {
				// …convert the first 8 bits to a single ASCII character.
				output += String.fromCharCode(
					0xFF & bitStorage >> (-2 * bitCounter & 6)
				);
			}
		}
		return output;
	};

	// `encode` is designed to be fully compatible with `btoa` as described in the
	// HTML Standard: http://whatwg.org/html/webappapis.html#dom-windowbase64-btoa
	var encode = function(input) {
		input = String(input);
		if (/[^\0-\xFF]/.test(input)) {
			// Note: no need to special-case astral symbols here, as surrogates are
			// matched, and the input is supposed to only contain ASCII anyway.
			error(
				'The string to be encoded contains characters outside of the ' +
				'Latin1 range.'
			);
		}
		var padding = input.length % 3;
		var output = '';
		var position = -1;
		var a;
		var b;
		var c;
		var d;
		var buffer;
		// Make sure any padding is handled outside of the loop.
		var length = input.length - padding;

		while (++position < length) {
			// Read three bytes, i.e. 24 bits.
			a = input.charCodeAt(position) << 16;
			b = input.charCodeAt(++position) << 8;
			c = input.charCodeAt(++position);
			buffer = a + b + c;
			// Turn the 24 bits into four chunks of 6 bits each, and append the
			// matching character for each of them to the output.
			output += (
				TABLE.charAt(buffer >> 18 & 0x3F) +
				TABLE.charAt(buffer >> 12 & 0x3F) +
				TABLE.charAt(buffer >> 6 & 0x3F) +
				TABLE.charAt(buffer & 0x3F)
			);
		}

		if (padding == 2) {
			a = input.charCodeAt(position) << 8;
			b = input.charCodeAt(++position);
			buffer = a + b;
			output += (
				TABLE.charAt(buffer >> 10) +
				TABLE.charAt((buffer >> 4) & 0x3F) +
				TABLE.charAt((buffer << 2) & 0x3F) +
				'='
			);
		} else if (padding == 1) {
			buffer = input.charCodeAt(position);
			output += (
				TABLE.charAt(buffer >> 2) +
				TABLE.charAt((buffer << 4) & 0x3F) +
				'=='
			);
		}

		return output;
	};

	var base64 = {
		'encode': encode,
		'decode': decode,
		'version': '0.1.0'
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof undefined == 'function' &&
		typeof undefined.amd == 'object' &&
		undefined.amd
	) {
		undefined(function() {
			return base64;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = base64;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in base64) {
				base64.hasOwnProperty(key) && (freeExports[key] = base64[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.base64 = base64;
	}

}(commonjsGlobal));
});

var name = "upyun";
var version = "3.0.0";
var description = "UPYUN js sdk";
var main = "dist/upyun.common.js";
var scripts = { "build": "node build/build.js", "test": "npm run test:server && npm run test:client", "test:client": "./node_modules/.bin/karma start tests/karma.conf.js", "test:server": "./node_modules/.bin/mocha --compilers js:babel-register tests/server/*" };
var repository = { "type": "git", "url": "git@github.com:upyun/node-sdk.git" };
var keywords = ["upyun", "js", "nodejs", "sdk", "cdn", "cloud", "storage"];
var author = "Leigh";
var license = "MIT";
var bugs = { "url": "https://github.com/upyun/node-sdk/issues" };
var homepage = "https://github.com/upyun/node-sdk";
var contributors = [{ "name": "yejingx", "email": "yejingx@gmail.com" }, { "name": "Leigh", "email": "i@zhuli.me" }, { "name": "kaidiren", "email": "kaidiren@gmail.com" }, { "name": "Gaara", "email": "sabakugaara@users.noreply.github.com" }];
var devDependencies = { "babel-cli": "^6.24.1", "babel-loader": "^7.0.0", "babel-plugin-external-helpers": "^6.22.0", "babel-plugin-transform-runtime": "^6.23.0", "babel-preset-env": "^1.4.0", "babel-register": "^6.24.1", "chai": "^3.5.0", "istanbul": "^0.4.3", "karma": "^1.7.0", "karma-chrome-launcher": "^2.1.1", "karma-mocha": "^1.3.0", "karma-sourcemap-loader": "^0.3.7", "karma-webpack": "^2.0.3", "mocha": "^3.4.1", "rollup": "^0.41.6", "rollup-plugin-alias": "^1.3.1", "rollup-plugin-babel": "^2.7.1", "rollup-plugin-commonjs": "^8.0.2", "rollup-plugin-json": "^2.1.1", "rollup-plugin-node-resolve": "^3.0.0", "should": "^9.0.2", "uglify-js": "^3.0.11", "webpack": "^2.5.1" };
var dependencies = { "axios": "^0.16.1", "base-64": "^0.1.0", "form-data": "^2.1.4", "hmacsha1": "^1.0.0", "md5": "^2.2.1", "mime-types": "^2.1.15" };
var browser = { "./upyun/utils.js": "./upyun/browser-utils.js", "./upyun/form-upload.js": "./upyun/browser-form-upload.js" };
var peerDependencies = { "babel-polyfill": "^6.23.0" };
var pkg = {
	name: name,
	version: version,
	description: description,
	main: main,
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

var crypt = createCommonjsModule(function (module) {
(function() {
  var base64map
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  crypt = {
    // Bit-wise rotation left
    rotl: function(n, b) {
      return (n << b) | (n >>> (32 - b));
    },

    // Bit-wise rotation right
    rotr: function(n, b) {
      return (n << (32 - b)) | (n >>> b);
    },

    // Swap big-endian to little-endian and vice versa
    endian: function(n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      }

      // Else, assume array and swap all items
      for (var i = 0; i < n.length; i++)
        n[i] = crypt.endian(n[i]);
      return n;
    },

    // Generate an array of any length of random bytes
    randomBytes: function(n) {
      for (var bytes = []; n > 0; n--)
        bytes.push(Math.floor(Math.random() * 256));
      return bytes;
    },

    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function(bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
      return words;
    },

    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function(words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8)
        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex: function(bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }
      return hex.join('');
    },

    // Convert a hex string to a byte array
    hexToBytes: function(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    },

    // Convert a byte array to a base-64 string
    bytesToBase64: function(bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        for (var j = 0; j < 4; j++)
          if (i * 8 + j * 6 <= bytes.length * 8)
            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
          else
            base64.push('=');
      }
      return base64.join('');
    },

    // Convert a base-64 string to a byte array
    base64ToBytes: function(base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
          imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push(((base64map.indexOf(base64.charAt(i - 1))
            & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
            | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
      }
      return bytes;
    }
  };

  module.exports = crypt;
})();
});

var charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
    }
  },

  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      for (var bytes = [], i = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      for (var str = [], i = 0; i < bytes.length; i++)
        str.push(String.fromCharCode(bytes[i]));
      return str.join('');
    }
  }
};

var charenc_1 = charenc;

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
var index$2 = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
};

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

var md5 = createCommonjsModule(function (module) {
(function(){
  var crypt$$1 = crypt,
      utf8 = charenc_1.utf8,
      isBuffer = index$2,
      bin = charenc_1.bin,

  // The core
  md5 = function (message, options) {
    // Convert to byte array
    if (message.constructor == String)
      if (options && options.encoding === 'binary')
        message = bin.stringToBytes(message);
      else
        message = utf8.stringToBytes(message);
    else if (isBuffer(message))
      message = Array.prototype.slice.call(message, 0);
    else if (!Array.isArray(message))
      message = message.toString();
    // else, assume byte array already

    var m = crypt$$1.bytesToWords(message),
        l = message.length * 8,
        a =  1732584193,
        b = -271733879,
        c = -1732584194,
        d =  271733878;

    // Swap endian
    for (var i = 0; i < m.length; i++) {
      m[i] = ((m[i] <<  8) | (m[i] >>> 24)) & 0x00FF00FF |
             ((m[i] << 24) | (m[i] >>>  8)) & 0xFF00FF00;
    }

    // Padding
    m[l >>> 5] |= 0x80 << (l % 32);
    m[(((l + 64) >>> 9) << 4) + 14] = l;

    // Method shortcuts
    var FF = md5._ff,
        GG = md5._gg,
        HH = md5._hh,
        II = md5._ii;

    for (var i = 0; i < m.length; i += 16) {

      var aa = a,
          bb = b,
          cc = c,
          dd = d;

      a = FF(a, b, c, d, m[i+ 0],  7, -680876936);
      d = FF(d, a, b, c, m[i+ 1], 12, -389564586);
      c = FF(c, d, a, b, m[i+ 2], 17,  606105819);
      b = FF(b, c, d, a, m[i+ 3], 22, -1044525330);
      a = FF(a, b, c, d, m[i+ 4],  7, -176418897);
      d = FF(d, a, b, c, m[i+ 5], 12,  1200080426);
      c = FF(c, d, a, b, m[i+ 6], 17, -1473231341);
      b = FF(b, c, d, a, m[i+ 7], 22, -45705983);
      a = FF(a, b, c, d, m[i+ 8],  7,  1770035416);
      d = FF(d, a, b, c, m[i+ 9], 12, -1958414417);
      c = FF(c, d, a, b, m[i+10], 17, -42063);
      b = FF(b, c, d, a, m[i+11], 22, -1990404162);
      a = FF(a, b, c, d, m[i+12],  7,  1804603682);
      d = FF(d, a, b, c, m[i+13], 12, -40341101);
      c = FF(c, d, a, b, m[i+14], 17, -1502002290);
      b = FF(b, c, d, a, m[i+15], 22,  1236535329);

      a = GG(a, b, c, d, m[i+ 1],  5, -165796510);
      d = GG(d, a, b, c, m[i+ 6],  9, -1069501632);
      c = GG(c, d, a, b, m[i+11], 14,  643717713);
      b = GG(b, c, d, a, m[i+ 0], 20, -373897302);
      a = GG(a, b, c, d, m[i+ 5],  5, -701558691);
      d = GG(d, a, b, c, m[i+10],  9,  38016083);
      c = GG(c, d, a, b, m[i+15], 14, -660478335);
      b = GG(b, c, d, a, m[i+ 4], 20, -405537848);
      a = GG(a, b, c, d, m[i+ 9],  5,  568446438);
      d = GG(d, a, b, c, m[i+14],  9, -1019803690);
      c = GG(c, d, a, b, m[i+ 3], 14, -187363961);
      b = GG(b, c, d, a, m[i+ 8], 20,  1163531501);
      a = GG(a, b, c, d, m[i+13],  5, -1444681467);
      d = GG(d, a, b, c, m[i+ 2],  9, -51403784);
      c = GG(c, d, a, b, m[i+ 7], 14,  1735328473);
      b = GG(b, c, d, a, m[i+12], 20, -1926607734);

      a = HH(a, b, c, d, m[i+ 5],  4, -378558);
      d = HH(d, a, b, c, m[i+ 8], 11, -2022574463);
      c = HH(c, d, a, b, m[i+11], 16,  1839030562);
      b = HH(b, c, d, a, m[i+14], 23, -35309556);
      a = HH(a, b, c, d, m[i+ 1],  4, -1530992060);
      d = HH(d, a, b, c, m[i+ 4], 11,  1272893353);
      c = HH(c, d, a, b, m[i+ 7], 16, -155497632);
      b = HH(b, c, d, a, m[i+10], 23, -1094730640);
      a = HH(a, b, c, d, m[i+13],  4,  681279174);
      d = HH(d, a, b, c, m[i+ 0], 11, -358537222);
      c = HH(c, d, a, b, m[i+ 3], 16, -722521979);
      b = HH(b, c, d, a, m[i+ 6], 23,  76029189);
      a = HH(a, b, c, d, m[i+ 9],  4, -640364487);
      d = HH(d, a, b, c, m[i+12], 11, -421815835);
      c = HH(c, d, a, b, m[i+15], 16,  530742520);
      b = HH(b, c, d, a, m[i+ 2], 23, -995338651);

      a = II(a, b, c, d, m[i+ 0],  6, -198630844);
      d = II(d, a, b, c, m[i+ 7], 10,  1126891415);
      c = II(c, d, a, b, m[i+14], 15, -1416354905);
      b = II(b, c, d, a, m[i+ 5], 21, -57434055);
      a = II(a, b, c, d, m[i+12],  6,  1700485571);
      d = II(d, a, b, c, m[i+ 3], 10, -1894986606);
      c = II(c, d, a, b, m[i+10], 15, -1051523);
      b = II(b, c, d, a, m[i+ 1], 21, -2054922799);
      a = II(a, b, c, d, m[i+ 8],  6,  1873313359);
      d = II(d, a, b, c, m[i+15], 10, -30611744);
      c = II(c, d, a, b, m[i+ 6], 15, -1560198380);
      b = II(b, c, d, a, m[i+13], 21,  1309151649);
      a = II(a, b, c, d, m[i+ 4],  6, -145523070);
      d = II(d, a, b, c, m[i+11], 10, -1120210379);
      c = II(c, d, a, b, m[i+ 2], 15,  718787259);
      b = II(b, c, d, a, m[i+ 9], 21, -343485551);

      a = (a + aa) >>> 0;
      b = (b + bb) >>> 0;
      c = (c + cc) >>> 0;
      d = (d + dd) >>> 0;
    }

    return crypt$$1.endian([a, b, c, d]);
  };

  // Auxiliary functions
  md5._ff  = function (a, b, c, d, x, s, t) {
    var n = a + (b & c | ~b & d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._gg  = function (a, b, c, d, x, s, t) {
    var n = a + (b & d | c & ~d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._hh  = function (a, b, c, d, x, s, t) {
    var n = a + (b ^ c ^ d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._ii  = function (a, b, c, d, x, s, t) {
    var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };

  // Package private blocksize
  md5._blocksize = 16;
  md5._digestsize = 16;

  module.exports = function (message, options) {
    if (message === undefined || message === null)
      throw new Error('Illegal argument ' + message);

    var digestbytes = crypt$$1.wordsToBytes(md5(message, options));
    return options && options.asBytes ? digestbytes :
        options && options.asString ? bin.bytesToString(digestbytes) :
        crypt$$1.bytesToHex(digestbytes);
  };

})();
});

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
  var sign = index$1(bucket.password, data.join('&'));
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

function getPurgeHeaderSign(bucket, urls) {
  var date = new Date().toGMTString();
  var str = urls.join('\n');
  var sign = md5(str + '&' + bucket.bucketName + '&' + date + '&' + bucket.password);

  return {
    'Authorization': 'UpYun ' + bucket.bucketName + ':' + bucket.operatorName + ':' + sign,
    'Date': date,
    'User-Agent': 'Js-Sdk/' + pkg.version
  };
}

var sign = {
  genSign: genSign,
  getHeaderSign: getHeaderSign,
  getPolicyAndAuthorization: getPolicyAndAuthorization,
  getPurgeHeaderSign: getPurgeHeaderSign
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
                _context.next = 2;
                return this.req.get(path + '?usage');

              case 2:
                _ref2 = _context.sent;
                data = _ref2.data;
                return _context.abrupt('return', data);

              case 5:
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
                requestHeaders = {
                  'x-list-limit': limit,
                  'x-list-order': order
                };


                if (iter) {
                  requestHeaders['x-list-iter'] = iter;
                }

                _context2.next = 4;
                return this.req.get(path, {
                  headers: requestHeaders
                });

              case 4:
                _ref5 = _context2.sent;
                data = _ref5.data;
                headers = _ref5.headers;
                status = _ref5.status;

                if (!(status === 404)) {
                  _context2.next = 10;
                  break;
                }

                return _context2.abrupt('return', false);

              case 10:
                next = headers['x-upyun-list-iter'];

                if (data) {
                  _context2.next = 13;
                  break;
                }

                return _context2.abrupt('return', {
                  files: [],
                  next: next
                });

              case 13:
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

              case 16:
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

        var keys, headers, _ref7, responseHeaders, status, params, result;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                // optional params
                keys = ['Content-MD5', 'Content-Length', 'Content-Type', 'Content-Secret', 'x-gmkerl-thumb'];
                headers = {};

                keys.forEach(function (key) {
                  var lower = key.toLowerCase();
                  var finded = options[key] || options[lower];
                  if (finded) {
                    headers[key] = finded;
                  } else if (isMeta(key)) {
                    headers[key] = options[key];
                  }
                });

                _context3.next = 5;
                return this.req.put(remotePath, localFile, {
                  headers: headers
                });

              case 5:
                _ref7 = _context3.sent;
                responseHeaders = _ref7.headers;
                status = _ref7.status;

                if (!(status === 200)) {
                  _context3.next = 15;
                  break;
                }

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

              case 15:
                return _context3.abrupt('return', false);

              case 16:
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
  }, {
    key: 'purge',
    value: function () {
      var _ref25 = asyncToGenerator(regeneratorRuntime.mark(function _callee13(urls) {
        var headers, _ref26, data;

        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                if (typeof urls === 'string') {
                  urls = [urls];
                }
                _context13.prev = 1;
                headers = sign.getPurgeHeaderSign(this.bucket, urls);
                _context13.next = 5;
                return axios.post('http://purge.upyun.com/purge/', 'purge=' + urls.join('\n'), {
                  headers: headers
                });

              case 5:
                _ref26 = _context13.sent;
                data = _ref26.data;

                if (!(Object.keys(data.invalid_domain_of_url).length === 0)) {
                  _context13.next = 11;
                  break;
                }

                return _context13.abrupt('return', true);

              case 11:
                throw new Error('some url purge failed ' + data.invalid_domain_of_url.join(' '));

              case 12:
                _context13.next = 17;
                break;

              case 14:
                _context13.prev = 14;
                _context13.t0 = _context13['catch'](1);
                throw new Error('upyun - request failed: ' + _context13.t0.message);

              case 17:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this, [[1, 14]]);
      }));

      function purge(_x25) {
        return _ref25.apply(this, arguments);
      }

      return purge;
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
  var operatorName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var password = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
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

return index;

})));
