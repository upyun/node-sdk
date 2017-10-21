/**
  * UPYUN js-sdk 3.3.1
  * (c) 2017
  * @license MIT
  */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('axios'), require('path')) :
	typeof define === 'function' && define.amd ? define(['axios', 'path'], factory) :
	(global.upyun = factory(global.axios,global.path));
}(this, (function (axios,path) { 'use strict';

axios = 'default' in axios ? axios['default'] : axios;
path = 'default' in path ? path['default'] : path;

// NOTE: choose node.js first
// process is defined in client test
var isBrowser = typeof window !== 'undefined' && (typeof process === 'undefined' || process.title === 'browser');

var adapter = axios.defaults.adapter;

axios.defaults.adapter = function () {
  // NOTE: in electron environment, support http and xhr both, use http adapter first
  if (isBrowser) {
    return adapter;
  }

  var http = require('axios/lib/adapters/http');
  return http;
}();

var createReq = function (endpoint, service, getHeaderSign) {
  var req = axios.create({
    baseURL: endpoint + '/' + service.serviceName
  });

  req.interceptors.request.use(function (config) {
    var method = config.method.toUpperCase();
    var path$$1 = config.url.substring(config.baseURL.length);
    config.url = encodeURI(config.url);

    return getHeaderSign(service, method, path$$1).then(function (headers) {
      config.headers.common = headers;
      return Promise.resolve(config);
    });
  }, function (error) {
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

function formUpload(remoteUrl, localFile, _ref) {
  var authorization = _ref.authorization,
      policy = _ref.policy;

  var data = new FormData();
  data.append('authorization', authorization);
  data.append('policy', policy);
  if (typeof localFile === 'string') {
    localFile = new Blob([localFile], { type: 'text/plain' });
  }
  data.append('file', localFile);
  return axios.post(remoteUrl, data).then(function (_ref2) {
    var status = _ref2.status,
        data = _ref2.data;

    if (status === 200) {
      return Promise.resolve(data);
    }

    return false;
  });
}

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
var hmacsha1 = b64_hmac_sha1;

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
var version = "3.3.0";
var description = "UPYUN js sdk";
var main = "dist/upyun.common.js";
var module$1 = "dist/upyun.esm.js";
var scripts = { "build": "node build/build.js", "test": "npm run test:server && npm run test:client", "test:client": "karma start tests/karma.conf.js", "test:server": "mocha --compilers js:babel-register tests/server/*" };
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
var pkg = {
	name: name,
	version: version,
	description: description,
	main: main,
	module: module$1,
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
	browser: browser
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
var isBuffer_1 = function (obj) {
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
      isBuffer = isBuffer_1,
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
 * @param {object} service
 * @param {string} path - storage path on upyun server, e.g: /your/dir/example.txt
 * @param {string} contentMd5 - md5 of the file that will be uploaded
 */
function getHeaderSign(service, method, path$$1) {
  var contentMd5 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var date = new Date().toGMTString();
  path$$1 = '/' + service.serviceName + path$$1;
  var sign = genSign(service, {
    method: method,
    path: path$$1,
    date: date,
    contentMd5: contentMd5
  });
  return {
    'Authorization': sign,
    'X-Date': date
  };
}

/**
 * generate signature string which can be used in head sign or body sign
 * @param {object} service
 * @param {object} options - must include key is method, path
 */
function genSign(service, options) {
  var method = options.method,
      path$$1 = options.path;


  var data = [method, encodeURI(path$$1)];

  // optional params
  ['date', 'policy', 'contentMd5'].forEach(function (item) {
    if (options[item]) {
      data.push(options[item]);
    }
  });

  // hmacsha1 return base64 encoded string
  var sign = hmacsha1(service.password, data.join('&'));
  return 'UPYUN ' + service.operatorName + ':' + sign;
}

/**
 * get policy and authorization for form api
 * @param {object} service
 * @param {object} - other optional params @see http://docs.upyun.com/api/form_api/#_2
 */
function getPolicyAndAuthorization(service, params) {
  params['service'] = service.serviceName;
  if (typeof params['save-key'] === 'undefined') {
    throw new Error('upyun - calclate body sign need save-key');
  }

  if (typeof params['expiration'] === 'undefined') {
    // default 30 minutes
    params['expiration'] = parseInt(new Date() / 1000 + 30 * 60, 10);
  }

  var policy = base64.encode(JSON.stringify(params));
  var authorization = genSign(service, {
    method: 'POST',
    path: '/' + service.serviceName,
    policy: policy
  });
  return {
    policy: policy,
    authorization: authorization
  };
}

function getPurgeHeaderSign(service, urls) {
  var date = new Date().toGMTString();
  var str = urls.join('\n');
  var sign = md5(str + '&' + service.serviceName + '&' + date + '&' + service.password);

  return {
    'Authorization': 'UpYun ' + service.serviceName + ':' + service.operatorName + ':' + sign,
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

var db = {
	"application/1d-interleaved-parityfec": {"source":"iana"},
	"application/3gpdash-qoe-report+xml": {"source":"iana"},
	"application/3gpp-ims+xml": {"source":"iana"},
	"application/a2l": {"source":"iana"},
	"application/activemessage": {"source":"iana"},
	"application/alto-costmap+json": {"source":"iana","compressible":true},
	"application/alto-costmapfilter+json": {"source":"iana","compressible":true},
	"application/alto-directory+json": {"source":"iana","compressible":true},
	"application/alto-endpointcost+json": {"source":"iana","compressible":true},
	"application/alto-endpointcostparams+json": {"source":"iana","compressible":true},
	"application/alto-endpointprop+json": {"source":"iana","compressible":true},
	"application/alto-endpointpropparams+json": {"source":"iana","compressible":true},
	"application/alto-error+json": {"source":"iana","compressible":true},
	"application/alto-networkmap+json": {"source":"iana","compressible":true},
	"application/alto-networkmapfilter+json": {"source":"iana","compressible":true},
	"application/aml": {"source":"iana"},
	"application/andrew-inset": {"source":"iana","extensions":["ez"]},
	"application/applefile": {"source":"iana"},
	"application/applixware": {"source":"apache","extensions":["aw"]},
	"application/atf": {"source":"iana"},
	"application/atfx": {"source":"iana"},
	"application/atom+xml": {"source":"iana","compressible":true,"extensions":["atom"]},
	"application/atomcat+xml": {"source":"iana","extensions":["atomcat"]},
	"application/atomdeleted+xml": {"source":"iana"},
	"application/atomicmail": {"source":"iana"},
	"application/atomsvc+xml": {"source":"iana","extensions":["atomsvc"]},
	"application/atxml": {"source":"iana"},
	"application/auth-policy+xml": {"source":"iana"},
	"application/bacnet-xdd+zip": {"source":"iana"},
	"application/batch-smtp": {"source":"iana"},
	"application/bdoc": {"compressible":false,"extensions":["bdoc"]},
	"application/beep+xml": {"source":"iana"},
	"application/calendar+json": {"source":"iana","compressible":true},
	"application/calendar+xml": {"source":"iana"},
	"application/call-completion": {"source":"iana"},
	"application/cals-1840": {"source":"iana"},
	"application/cbor": {"source":"iana"},
	"application/cccex": {"source":"iana"},
	"application/ccmp+xml": {"source":"iana"},
	"application/ccxml+xml": {"source":"iana","extensions":["ccxml"]},
	"application/cdfx+xml": {"source":"iana"},
	"application/cdmi-capability": {"source":"iana","extensions":["cdmia"]},
	"application/cdmi-container": {"source":"iana","extensions":["cdmic"]},
	"application/cdmi-domain": {"source":"iana","extensions":["cdmid"]},
	"application/cdmi-object": {"source":"iana","extensions":["cdmio"]},
	"application/cdmi-queue": {"source":"iana","extensions":["cdmiq"]},
	"application/cdni": {"source":"iana"},
	"application/cea": {"source":"iana"},
	"application/cea-2018+xml": {"source":"iana"},
	"application/cellml+xml": {"source":"iana"},
	"application/cfw": {"source":"iana"},
	"application/clue_info+xml": {"source":"iana"},
	"application/cms": {"source":"iana"},
	"application/cnrp+xml": {"source":"iana"},
	"application/coap-group+json": {"source":"iana","compressible":true},
	"application/coap-payload": {"source":"iana"},
	"application/commonground": {"source":"iana"},
	"application/conference-info+xml": {"source":"iana"},
	"application/cose": {"source":"iana"},
	"application/cose-key": {"source":"iana"},
	"application/cose-key-set": {"source":"iana"},
	"application/cpl+xml": {"source":"iana"},
	"application/csrattrs": {"source":"iana"},
	"application/csta+xml": {"source":"iana"},
	"application/cstadata+xml": {"source":"iana"},
	"application/csvm+json": {"source":"iana","compressible":true},
	"application/cu-seeme": {"source":"apache","extensions":["cu"]},
	"application/cybercash": {"source":"iana"},
	"application/dart": {"compressible":true},
	"application/dash+xml": {"source":"iana","extensions":["mpd"]},
	"application/dashdelta": {"source":"iana"},
	"application/davmount+xml": {"source":"iana","extensions":["davmount"]},
	"application/dca-rft": {"source":"iana"},
	"application/dcd": {"source":"iana"},
	"application/dec-dx": {"source":"iana"},
	"application/dialog-info+xml": {"source":"iana"},
	"application/dicom": {"source":"iana"},
	"application/dicom+json": {"source":"iana","compressible":true},
	"application/dicom+xml": {"source":"iana"},
	"application/dii": {"source":"iana"},
	"application/dit": {"source":"iana"},
	"application/dns": {"source":"iana"},
	"application/docbook+xml": {"source":"apache","extensions":["dbk"]},
	"application/dskpp+xml": {"source":"iana"},
	"application/dssc+der": {"source":"iana","extensions":["dssc"]},
	"application/dssc+xml": {"source":"iana","extensions":["xdssc"]},
	"application/dvcs": {"source":"iana"},
	"application/ecmascript": {"source":"iana","compressible":true,"extensions":["ecma"]},
	"application/edi-consent": {"source":"iana"},
	"application/edi-x12": {"source":"iana","compressible":false},
	"application/edifact": {"source":"iana","compressible":false},
	"application/efi": {"source":"iana"},
	"application/emergencycalldata.comment+xml": {"source":"iana"},
	"application/emergencycalldata.control+xml": {"source":"iana"},
	"application/emergencycalldata.deviceinfo+xml": {"source":"iana"},
	"application/emergencycalldata.ecall.msd": {"source":"iana"},
	"application/emergencycalldata.providerinfo+xml": {"source":"iana"},
	"application/emergencycalldata.serviceinfo+xml": {"source":"iana"},
	"application/emergencycalldata.subscriberinfo+xml": {"source":"iana"},
	"application/emergencycalldata.veds+xml": {"source":"iana"},
	"application/emma+xml": {"source":"iana","extensions":["emma"]},
	"application/emotionml+xml": {"source":"iana"},
	"application/encaprtp": {"source":"iana"},
	"application/epp+xml": {"source":"iana"},
	"application/epub+zip": {"source":"iana","extensions":["epub"]},
	"application/eshop": {"source":"iana"},
	"application/exi": {"source":"iana","extensions":["exi"]},
	"application/fastinfoset": {"source":"iana"},
	"application/fastsoap": {"source":"iana"},
	"application/fdt+xml": {"source":"iana"},
	"application/fido.trusted-apps+json": {"compressible":true},
	"application/fits": {"source":"iana"},
	"application/font-sfnt": {"source":"iana"},
	"application/font-tdpfr": {"source":"iana","extensions":["pfr"]},
	"application/font-woff": {"source":"iana","compressible":false,"extensions":["woff"]},
	"application/font-woff2": {"compressible":false,"extensions":["woff2"]},
	"application/framework-attributes+xml": {"source":"iana"},
	"application/geo+json": {"source":"iana","compressible":true,"extensions":["geojson"]},
	"application/geo+json-seq": {"source":"iana"},
	"application/geoxacml+xml": {"source":"iana"},
	"application/gml+xml": {"source":"iana","extensions":["gml"]},
	"application/gpx+xml": {"source":"apache","extensions":["gpx"]},
	"application/gxf": {"source":"apache","extensions":["gxf"]},
	"application/gzip": {"source":"iana","compressible":false,"extensions":["gz"]},
	"application/h224": {"source":"iana"},
	"application/held+xml": {"source":"iana"},
	"application/http": {"source":"iana"},
	"application/hyperstudio": {"source":"iana","extensions":["stk"]},
	"application/ibe-key-request+xml": {"source":"iana"},
	"application/ibe-pkg-reply+xml": {"source":"iana"},
	"application/ibe-pp-data": {"source":"iana"},
	"application/iges": {"source":"iana"},
	"application/im-iscomposing+xml": {"source":"iana"},
	"application/index": {"source":"iana"},
	"application/index.cmd": {"source":"iana"},
	"application/index.obj": {"source":"iana"},
	"application/index.response": {"source":"iana"},
	"application/index.vnd": {"source":"iana"},
	"application/inkml+xml": {"source":"iana","extensions":["ink","inkml"]},
	"application/iotp": {"source":"iana"},
	"application/ipfix": {"source":"iana","extensions":["ipfix"]},
	"application/ipp": {"source":"iana"},
	"application/isup": {"source":"iana"},
	"application/its+xml": {"source":"iana"},
	"application/java-archive": {"source":"apache","compressible":false,"extensions":["jar","war","ear"]},
	"application/java-serialized-object": {"source":"apache","compressible":false,"extensions":["ser"]},
	"application/java-vm": {"source":"apache","compressible":false,"extensions":["class"]},
	"application/javascript": {"source":"iana","charset":"UTF-8","compressible":true,"extensions":["js","mjs"]},
	"application/jf2feed+json": {"source":"iana","compressible":true},
	"application/jose": {"source":"iana"},
	"application/jose+json": {"source":"iana","compressible":true},
	"application/jrd+json": {"source":"iana","compressible":true},
	"application/json": {"source":"iana","charset":"UTF-8","compressible":true,"extensions":["json","map"]},
	"application/json-patch+json": {"source":"iana","compressible":true},
	"application/json-seq": {"source":"iana"},
	"application/json5": {"extensions":["json5"]},
	"application/jsonml+json": {"source":"apache","compressible":true,"extensions":["jsonml"]},
	"application/jwk+json": {"source":"iana","compressible":true},
	"application/jwk-set+json": {"source":"iana","compressible":true},
	"application/jwt": {"source":"iana"},
	"application/kpml-request+xml": {"source":"iana"},
	"application/kpml-response+xml": {"source":"iana"},
	"application/ld+json": {"source":"iana","compressible":true,"extensions":["jsonld"]},
	"application/lgr+xml": {"source":"iana"},
	"application/link-format": {"source":"iana"},
	"application/load-control+xml": {"source":"iana"},
	"application/lost+xml": {"source":"iana","extensions":["lostxml"]},
	"application/lostsync+xml": {"source":"iana"},
	"application/lxf": {"source":"iana"},
	"application/mac-binhex40": {"source":"iana","extensions":["hqx"]},
	"application/mac-compactpro": {"source":"apache","extensions":["cpt"]},
	"application/macwriteii": {"source":"iana"},
	"application/mads+xml": {"source":"iana","extensions":["mads"]},
	"application/manifest+json": {"charset":"UTF-8","compressible":true,"extensions":["webmanifest"]},
	"application/marc": {"source":"iana","extensions":["mrc"]},
	"application/marcxml+xml": {"source":"iana","extensions":["mrcx"]},
	"application/mathematica": {"source":"iana","extensions":["ma","nb","mb"]},
	"application/mathml+xml": {"source":"iana","extensions":["mathml"]},
	"application/mathml-content+xml": {"source":"iana"},
	"application/mathml-presentation+xml": {"source":"iana"},
	"application/mbms-associated-procedure-description+xml": {"source":"iana"},
	"application/mbms-deregister+xml": {"source":"iana"},
	"application/mbms-envelope+xml": {"source":"iana"},
	"application/mbms-msk+xml": {"source":"iana"},
	"application/mbms-msk-response+xml": {"source":"iana"},
	"application/mbms-protection-description+xml": {"source":"iana"},
	"application/mbms-reception-report+xml": {"source":"iana"},
	"application/mbms-register+xml": {"source":"iana"},
	"application/mbms-register-response+xml": {"source":"iana"},
	"application/mbms-schedule+xml": {"source":"iana"},
	"application/mbms-user-service-description+xml": {"source":"iana"},
	"application/mbox": {"source":"iana","extensions":["mbox"]},
	"application/media-policy-dataset+xml": {"source":"iana"},
	"application/media_control+xml": {"source":"iana"},
	"application/mediaservercontrol+xml": {"source":"iana","extensions":["mscml"]},
	"application/merge-patch+json": {"source":"iana","compressible":true},
	"application/metalink+xml": {"source":"apache","extensions":["metalink"]},
	"application/metalink4+xml": {"source":"iana","extensions":["meta4"]},
	"application/mets+xml": {"source":"iana","extensions":["mets"]},
	"application/mf4": {"source":"iana"},
	"application/mikey": {"source":"iana"},
	"application/mmt-usd+xml": {"source":"iana"},
	"application/mods+xml": {"source":"iana","extensions":["mods"]},
	"application/moss-keys": {"source":"iana"},
	"application/moss-signature": {"source":"iana"},
	"application/mosskey-data": {"source":"iana"},
	"application/mosskey-request": {"source":"iana"},
	"application/mp21": {"source":"iana","extensions":["m21","mp21"]},
	"application/mp4": {"source":"iana","extensions":["mp4s","m4p"]},
	"application/mpeg4-generic": {"source":"iana"},
	"application/mpeg4-iod": {"source":"iana"},
	"application/mpeg4-iod-xmt": {"source":"iana"},
	"application/mrb-consumer+xml": {"source":"iana"},
	"application/mrb-publish+xml": {"source":"iana"},
	"application/msc-ivr+xml": {"source":"iana"},
	"application/msc-mixer+xml": {"source":"iana"},
	"application/msword": {"source":"iana","compressible":false,"extensions":["doc","dot"]},
	"application/mud+json": {"source":"iana","compressible":true},
	"application/mxf": {"source":"iana","extensions":["mxf"]},
	"application/n-quads": {"source":"iana"},
	"application/n-triples": {"source":"iana"},
	"application/nasdata": {"source":"iana"},
	"application/news-checkgroups": {"source":"iana"},
	"application/news-groupinfo": {"source":"iana"},
	"application/news-transmission": {"source":"iana"},
	"application/nlsml+xml": {"source":"iana"},
	"application/nss": {"source":"iana"},
	"application/ocsp-request": {"source":"iana"},
	"application/ocsp-response": {"source":"iana"},
	"application/octet-stream": {"source":"iana","compressible":false,"extensions":["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","exe","dll","deb","dmg","iso","img","msi","msp","msm","buffer"]},
	"application/oda": {"source":"iana","extensions":["oda"]},
	"application/odx": {"source":"iana"},
	"application/oebps-package+xml": {"source":"iana","extensions":["opf"]},
	"application/ogg": {"source":"iana","compressible":false,"extensions":["ogx"]},
	"application/omdoc+xml": {"source":"apache","extensions":["omdoc"]},
	"application/onenote": {"source":"apache","extensions":["onetoc","onetoc2","onetmp","onepkg"]},
	"application/oxps": {"source":"iana","extensions":["oxps"]},
	"application/p2p-overlay+xml": {"source":"iana"},
	"application/parityfec": {"source":"iana"},
	"application/passport": {"source":"iana"},
	"application/patch-ops-error+xml": {"source":"iana","extensions":["xer"]},
	"application/pdf": {"source":"iana","compressible":false,"extensions":["pdf"]},
	"application/pdx": {"source":"iana"},
	"application/pgp-encrypted": {"source":"iana","compressible":false,"extensions":["pgp"]},
	"application/pgp-keys": {"source":"iana"},
	"application/pgp-signature": {"source":"iana","extensions":["asc","sig"]},
	"application/pics-rules": {"source":"apache","extensions":["prf"]},
	"application/pidf+xml": {"source":"iana"},
	"application/pidf-diff+xml": {"source":"iana"},
	"application/pkcs10": {"source":"iana","extensions":["p10"]},
	"application/pkcs12": {"source":"iana"},
	"application/pkcs7-mime": {"source":"iana","extensions":["p7m","p7c"]},
	"application/pkcs7-signature": {"source":"iana","extensions":["p7s"]},
	"application/pkcs8": {"source":"iana","extensions":["p8"]},
	"application/pkix-attr-cert": {"source":"iana","extensions":["ac"]},
	"application/pkix-cert": {"source":"iana","extensions":["cer"]},
	"application/pkix-crl": {"source":"iana","extensions":["crl"]},
	"application/pkix-pkipath": {"source":"iana","extensions":["pkipath"]},
	"application/pkixcmp": {"source":"iana","extensions":["pki"]},
	"application/pls+xml": {"source":"iana","extensions":["pls"]},
	"application/poc-settings+xml": {"source":"iana"},
	"application/postscript": {"source":"iana","compressible":true,"extensions":["ai","eps","ps"]},
	"application/ppsp-tracker+json": {"source":"iana","compressible":true},
	"application/problem+json": {"source":"iana","compressible":true},
	"application/problem+xml": {"source":"iana"},
	"application/provenance+xml": {"source":"iana"},
	"application/prs.alvestrand.titrax-sheet": {"source":"iana"},
	"application/prs.cww": {"source":"iana","extensions":["cww"]},
	"application/prs.hpub+zip": {"source":"iana"},
	"application/prs.nprend": {"source":"iana"},
	"application/prs.plucker": {"source":"iana"},
	"application/prs.rdf-xml-crypt": {"source":"iana"},
	"application/prs.xsf+xml": {"source":"iana"},
	"application/pskc+xml": {"source":"iana","extensions":["pskcxml"]},
	"application/qsig": {"source":"iana"},
	"application/raptorfec": {"source":"iana"},
	"application/rdap+json": {"source":"iana","compressible":true},
	"application/rdf+xml": {"source":"iana","compressible":true,"extensions":["rdf"]},
	"application/reginfo+xml": {"source":"iana","extensions":["rif"]},
	"application/relax-ng-compact-syntax": {"source":"iana","extensions":["rnc"]},
	"application/remote-printing": {"source":"iana"},
	"application/reputon+json": {"source":"iana","compressible":true},
	"application/resource-lists+xml": {"source":"iana","extensions":["rl"]},
	"application/resource-lists-diff+xml": {"source":"iana","extensions":["rld"]},
	"application/rfc+xml": {"source":"iana"},
	"application/riscos": {"source":"iana"},
	"application/rlmi+xml": {"source":"iana"},
	"application/rls-services+xml": {"source":"iana","extensions":["rs"]},
	"application/route-apd+xml": {"source":"iana"},
	"application/route-s-tsid+xml": {"source":"iana"},
	"application/route-usd+xml": {"source":"iana"},
	"application/rpki-ghostbusters": {"source":"iana","extensions":["gbr"]},
	"application/rpki-manifest": {"source":"iana","extensions":["mft"]},
	"application/rpki-publication": {"source":"iana"},
	"application/rpki-roa": {"source":"iana","extensions":["roa"]},
	"application/rpki-updown": {"source":"iana"},
	"application/rsd+xml": {"source":"apache","extensions":["rsd"]},
	"application/rss+xml": {"source":"apache","compressible":true,"extensions":["rss"]},
	"application/rtf": {"source":"iana","compressible":true,"extensions":["rtf"]},
	"application/rtploopback": {"source":"iana"},
	"application/rtx": {"source":"iana"},
	"application/samlassertion+xml": {"source":"iana"},
	"application/samlmetadata+xml": {"source":"iana"},
	"application/sbml+xml": {"source":"iana","extensions":["sbml"]},
	"application/scaip+xml": {"source":"iana"},
	"application/scim+json": {"source":"iana","compressible":true},
	"application/scvp-cv-request": {"source":"iana","extensions":["scq"]},
	"application/scvp-cv-response": {"source":"iana","extensions":["scs"]},
	"application/scvp-vp-request": {"source":"iana","extensions":["spq"]},
	"application/scvp-vp-response": {"source":"iana","extensions":["spp"]},
	"application/sdp": {"source":"iana","extensions":["sdp"]},
	"application/sep+xml": {"source":"iana"},
	"application/sep-exi": {"source":"iana"},
	"application/session-info": {"source":"iana"},
	"application/set-payment": {"source":"iana"},
	"application/set-payment-initiation": {"source":"iana","extensions":["setpay"]},
	"application/set-registration": {"source":"iana"},
	"application/set-registration-initiation": {"source":"iana","extensions":["setreg"]},
	"application/sgml": {"source":"iana"},
	"application/sgml-open-catalog": {"source":"iana"},
	"application/shf+xml": {"source":"iana","extensions":["shf"]},
	"application/sieve": {"source":"iana"},
	"application/simple-filter+xml": {"source":"iana"},
	"application/simple-message-summary": {"source":"iana"},
	"application/simplesymbolcontainer": {"source":"iana"},
	"application/slate": {"source":"iana"},
	"application/smil": {"source":"iana"},
	"application/smil+xml": {"source":"iana","extensions":["smi","smil"]},
	"application/smpte336m": {"source":"iana"},
	"application/soap+fastinfoset": {"source":"iana"},
	"application/soap+xml": {"source":"iana","compressible":true},
	"application/sparql-query": {"source":"iana","extensions":["rq"]},
	"application/sparql-results+xml": {"source":"iana","extensions":["srx"]},
	"application/spirits-event+xml": {"source":"iana"},
	"application/sql": {"source":"iana"},
	"application/srgs": {"source":"iana","extensions":["gram"]},
	"application/srgs+xml": {"source":"iana","extensions":["grxml"]},
	"application/sru+xml": {"source":"iana","extensions":["sru"]},
	"application/ssdl+xml": {"source":"apache","extensions":["ssdl"]},
	"application/ssml+xml": {"source":"iana","extensions":["ssml"]},
	"application/tamp-apex-update": {"source":"iana"},
	"application/tamp-apex-update-confirm": {"source":"iana"},
	"application/tamp-community-update": {"source":"iana"},
	"application/tamp-community-update-confirm": {"source":"iana"},
	"application/tamp-error": {"source":"iana"},
	"application/tamp-sequence-adjust": {"source":"iana"},
	"application/tamp-sequence-adjust-confirm": {"source":"iana"},
	"application/tamp-status-query": {"source":"iana"},
	"application/tamp-status-response": {"source":"iana"},
	"application/tamp-update": {"source":"iana"},
	"application/tamp-update-confirm": {"source":"iana"},
	"application/tar": {"compressible":true},
	"application/tei+xml": {"source":"iana","extensions":["tei","teicorpus"]},
	"application/thraud+xml": {"source":"iana","extensions":["tfi"]},
	"application/timestamp-query": {"source":"iana"},
	"application/timestamp-reply": {"source":"iana"},
	"application/timestamped-data": {"source":"iana","extensions":["tsd"]},
	"application/trig": {"source":"iana"},
	"application/ttml+xml": {"source":"iana"},
	"application/tve-trigger": {"source":"iana"},
	"application/ulpfec": {"source":"iana"},
	"application/urc-grpsheet+xml": {"source":"iana"},
	"application/urc-ressheet+xml": {"source":"iana"},
	"application/urc-targetdesc+xml": {"source":"iana"},
	"application/urc-uisocketdesc+xml": {"source":"iana"},
	"application/vcard+json": {"source":"iana","compressible":true},
	"application/vcard+xml": {"source":"iana"},
	"application/vemmi": {"source":"iana"},
	"application/vividence.scriptfile": {"source":"apache"},
	"application/vnd.1000minds.decision-model+xml": {"source":"iana"},
	"application/vnd.3gpp-prose+xml": {"source":"iana"},
	"application/vnd.3gpp-prose-pc3ch+xml": {"source":"iana"},
	"application/vnd.3gpp.access-transfer-events+xml": {"source":"iana"},
	"application/vnd.3gpp.bsf+xml": {"source":"iana"},
	"application/vnd.3gpp.gmop+xml": {"source":"iana"},
	"application/vnd.3gpp.mcptt-info+xml": {"source":"iana"},
	"application/vnd.3gpp.mcptt-mbms-usage-info+xml": {"source":"iana"},
	"application/vnd.3gpp.mid-call+xml": {"source":"iana"},
	"application/vnd.3gpp.pic-bw-large": {"source":"iana","extensions":["plb"]},
	"application/vnd.3gpp.pic-bw-small": {"source":"iana","extensions":["psb"]},
	"application/vnd.3gpp.pic-bw-var": {"source":"iana","extensions":["pvb"]},
	"application/vnd.3gpp.sms": {"source":"iana"},
	"application/vnd.3gpp.sms+xml": {"source":"iana"},
	"application/vnd.3gpp.srvcc-ext+xml": {"source":"iana"},
	"application/vnd.3gpp.srvcc-info+xml": {"source":"iana"},
	"application/vnd.3gpp.state-and-event-info+xml": {"source":"iana"},
	"application/vnd.3gpp.ussd+xml": {"source":"iana"},
	"application/vnd.3gpp2.bcmcsinfo+xml": {"source":"iana"},
	"application/vnd.3gpp2.sms": {"source":"iana"},
	"application/vnd.3gpp2.tcap": {"source":"iana","extensions":["tcap"]},
	"application/vnd.3lightssoftware.imagescal": {"source":"iana"},
	"application/vnd.3m.post-it-notes": {"source":"iana","extensions":["pwn"]},
	"application/vnd.accpac.simply.aso": {"source":"iana","extensions":["aso"]},
	"application/vnd.accpac.simply.imp": {"source":"iana","extensions":["imp"]},
	"application/vnd.acucobol": {"source":"iana","extensions":["acu"]},
	"application/vnd.acucorp": {"source":"iana","extensions":["atc","acutc"]},
	"application/vnd.adobe.air-application-installer-package+zip": {"source":"apache","extensions":["air"]},
	"application/vnd.adobe.flash.movie": {"source":"iana"},
	"application/vnd.adobe.formscentral.fcdt": {"source":"iana","extensions":["fcdt"]},
	"application/vnd.adobe.fxp": {"source":"iana","extensions":["fxp","fxpl"]},
	"application/vnd.adobe.partial-upload": {"source":"iana"},
	"application/vnd.adobe.xdp+xml": {"source":"iana","extensions":["xdp"]},
	"application/vnd.adobe.xfdf": {"source":"iana","extensions":["xfdf"]},
	"application/vnd.aether.imp": {"source":"iana"},
	"application/vnd.ah-barcode": {"source":"iana"},
	"application/vnd.ahead.space": {"source":"iana","extensions":["ahead"]},
	"application/vnd.airzip.filesecure.azf": {"source":"iana","extensions":["azf"]},
	"application/vnd.airzip.filesecure.azs": {"source":"iana","extensions":["azs"]},
	"application/vnd.amazon.ebook": {"source":"apache","extensions":["azw"]},
	"application/vnd.amazon.mobi8-ebook": {"source":"iana"},
	"application/vnd.americandynamics.acc": {"source":"iana","extensions":["acc"]},
	"application/vnd.amiga.ami": {"source":"iana","extensions":["ami"]},
	"application/vnd.amundsen.maze+xml": {"source":"iana"},
	"application/vnd.android.package-archive": {"source":"apache","compressible":false,"extensions":["apk"]},
	"application/vnd.anki": {"source":"iana"},
	"application/vnd.anser-web-certificate-issue-initiation": {"source":"iana","extensions":["cii"]},
	"application/vnd.anser-web-funds-transfer-initiation": {"source":"apache","extensions":["fti"]},
	"application/vnd.antix.game-component": {"source":"iana","extensions":["atx"]},
	"application/vnd.apache.thrift.binary": {"source":"iana"},
	"application/vnd.apache.thrift.compact": {"source":"iana"},
	"application/vnd.apache.thrift.json": {"source":"iana"},
	"application/vnd.api+json": {"source":"iana","compressible":true},
	"application/vnd.apothekende.reservation+json": {"source":"iana","compressible":true},
	"application/vnd.apple.installer+xml": {"source":"iana","extensions":["mpkg"]},
	"application/vnd.apple.mpegurl": {"source":"iana","extensions":["m3u8"]},
	"application/vnd.apple.pkpass": {"compressible":false,"extensions":["pkpass"]},
	"application/vnd.arastra.swi": {"source":"iana"},
	"application/vnd.aristanetworks.swi": {"source":"iana","extensions":["swi"]},
	"application/vnd.artsquare": {"source":"iana"},
	"application/vnd.astraea-software.iota": {"source":"iana","extensions":["iota"]},
	"application/vnd.audiograph": {"source":"iana","extensions":["aep"]},
	"application/vnd.autopackage": {"source":"iana"},
	"application/vnd.avistar+xml": {"source":"iana"},
	"application/vnd.balsamiq.bmml+xml": {"source":"iana"},
	"application/vnd.balsamiq.bmpr": {"source":"iana"},
	"application/vnd.bekitzur-stech+json": {"source":"iana","compressible":true},
	"application/vnd.bint.med-content": {"source":"iana"},
	"application/vnd.biopax.rdf+xml": {"source":"iana"},
	"application/vnd.blink-idb-value-wrapper": {"source":"iana"},
	"application/vnd.blueice.multipass": {"source":"iana","extensions":["mpm"]},
	"application/vnd.bluetooth.ep.oob": {"source":"iana"},
	"application/vnd.bluetooth.le.oob": {"source":"iana"},
	"application/vnd.bmi": {"source":"iana","extensions":["bmi"]},
	"application/vnd.businessobjects": {"source":"iana","extensions":["rep"]},
	"application/vnd.cab-jscript": {"source":"iana"},
	"application/vnd.canon-cpdl": {"source":"iana"},
	"application/vnd.canon-lips": {"source":"iana"},
	"application/vnd.capasystems-pg+json": {"source":"iana","compressible":true},
	"application/vnd.cendio.thinlinc.clientconf": {"source":"iana"},
	"application/vnd.century-systems.tcp_stream": {"source":"iana"},
	"application/vnd.chemdraw+xml": {"source":"iana","extensions":["cdxml"]},
	"application/vnd.chess-pgn": {"source":"iana"},
	"application/vnd.chipnuts.karaoke-mmd": {"source":"iana","extensions":["mmd"]},
	"application/vnd.cinderella": {"source":"iana","extensions":["cdy"]},
	"application/vnd.cirpack.isdn-ext": {"source":"iana"},
	"application/vnd.citationstyles.style+xml": {"source":"iana"},
	"application/vnd.claymore": {"source":"iana","extensions":["cla"]},
	"application/vnd.cloanto.rp9": {"source":"iana","extensions":["rp9"]},
	"application/vnd.clonk.c4group": {"source":"iana","extensions":["c4g","c4d","c4f","c4p","c4u"]},
	"application/vnd.cluetrust.cartomobile-config": {"source":"iana","extensions":["c11amc"]},
	"application/vnd.cluetrust.cartomobile-config-pkg": {"source":"iana","extensions":["c11amz"]},
	"application/vnd.coffeescript": {"source":"iana"},
	"application/vnd.collection+json": {"source":"iana","compressible":true},
	"application/vnd.collection.doc+json": {"source":"iana","compressible":true},
	"application/vnd.collection.next+json": {"source":"iana","compressible":true},
	"application/vnd.comicbook+zip": {"source":"iana"},
	"application/vnd.commerce-battelle": {"source":"iana"},
	"application/vnd.commonspace": {"source":"iana","extensions":["csp"]},
	"application/vnd.contact.cmsg": {"source":"iana","extensions":["cdbcmsg"]},
	"application/vnd.coreos.ignition+json": {"source":"iana","compressible":true},
	"application/vnd.cosmocaller": {"source":"iana","extensions":["cmc"]},
	"application/vnd.crick.clicker": {"source":"iana","extensions":["clkx"]},
	"application/vnd.crick.clicker.keyboard": {"source":"iana","extensions":["clkk"]},
	"application/vnd.crick.clicker.palette": {"source":"iana","extensions":["clkp"]},
	"application/vnd.crick.clicker.template": {"source":"iana","extensions":["clkt"]},
	"application/vnd.crick.clicker.wordbank": {"source":"iana","extensions":["clkw"]},
	"application/vnd.criticaltools.wbs+xml": {"source":"iana","extensions":["wbs"]},
	"application/vnd.ctc-posml": {"source":"iana","extensions":["pml"]},
	"application/vnd.ctct.ws+xml": {"source":"iana"},
	"application/vnd.cups-pdf": {"source":"iana"},
	"application/vnd.cups-postscript": {"source":"iana"},
	"application/vnd.cups-ppd": {"source":"iana","extensions":["ppd"]},
	"application/vnd.cups-raster": {"source":"iana"},
	"application/vnd.cups-raw": {"source":"iana"},
	"application/vnd.curl": {"source":"iana"},
	"application/vnd.curl.car": {"source":"apache","extensions":["car"]},
	"application/vnd.curl.pcurl": {"source":"apache","extensions":["pcurl"]},
	"application/vnd.cyan.dean.root+xml": {"source":"iana"},
	"application/vnd.cybank": {"source":"iana"},
	"application/vnd.d2l.coursepackage1p0+zip": {"source":"iana"},
	"application/vnd.dart": {"source":"iana","compressible":true,"extensions":["dart"]},
	"application/vnd.data-vision.rdz": {"source":"iana","extensions":["rdz"]},
	"application/vnd.datapackage+json": {"source":"iana","compressible":true},
	"application/vnd.dataresource+json": {"source":"iana","compressible":true},
	"application/vnd.debian.binary-package": {"source":"iana"},
	"application/vnd.dece.data": {"source":"iana","extensions":["uvf","uvvf","uvd","uvvd"]},
	"application/vnd.dece.ttml+xml": {"source":"iana","extensions":["uvt","uvvt"]},
	"application/vnd.dece.unspecified": {"source":"iana","extensions":["uvx","uvvx"]},
	"application/vnd.dece.zip": {"source":"iana","extensions":["uvz","uvvz"]},
	"application/vnd.denovo.fcselayout-link": {"source":"iana","extensions":["fe_launch"]},
	"application/vnd.desmume-movie": {"source":"iana"},
	"application/vnd.desmume.movie": {"source":"apache"},
	"application/vnd.dir-bi.plate-dl-nosuffix": {"source":"iana"},
	"application/vnd.dm.delegation+xml": {"source":"iana"},
	"application/vnd.dna": {"source":"iana","extensions":["dna"]},
	"application/vnd.document+json": {"source":"iana","compressible":true},
	"application/vnd.dolby.mlp": {"source":"apache","extensions":["mlp"]},
	"application/vnd.dolby.mobile.1": {"source":"iana"},
	"application/vnd.dolby.mobile.2": {"source":"iana"},
	"application/vnd.doremir.scorecloud-binary-document": {"source":"iana"},
	"application/vnd.dpgraph": {"source":"iana","extensions":["dpg"]},
	"application/vnd.dreamfactory": {"source":"iana","extensions":["dfac"]},
	"application/vnd.drive+json": {"source":"iana","compressible":true},
	"application/vnd.ds-keypoint": {"source":"apache","extensions":["kpxx"]},
	"application/vnd.dtg.local": {"source":"iana"},
	"application/vnd.dtg.local.flash": {"source":"iana"},
	"application/vnd.dtg.local.html": {"source":"iana"},
	"application/vnd.dvb.ait": {"source":"iana","extensions":["ait"]},
	"application/vnd.dvb.dvbj": {"source":"iana"},
	"application/vnd.dvb.esgcontainer": {"source":"iana"},
	"application/vnd.dvb.ipdcdftnotifaccess": {"source":"iana"},
	"application/vnd.dvb.ipdcesgaccess": {"source":"iana"},
	"application/vnd.dvb.ipdcesgaccess2": {"source":"iana"},
	"application/vnd.dvb.ipdcesgpdd": {"source":"iana"},
	"application/vnd.dvb.ipdcroaming": {"source":"iana"},
	"application/vnd.dvb.iptv.alfec-base": {"source":"iana"},
	"application/vnd.dvb.iptv.alfec-enhancement": {"source":"iana"},
	"application/vnd.dvb.notif-aggregate-root+xml": {"source":"iana"},
	"application/vnd.dvb.notif-container+xml": {"source":"iana"},
	"application/vnd.dvb.notif-generic+xml": {"source":"iana"},
	"application/vnd.dvb.notif-ia-msglist+xml": {"source":"iana"},
	"application/vnd.dvb.notif-ia-registration-request+xml": {"source":"iana"},
	"application/vnd.dvb.notif-ia-registration-response+xml": {"source":"iana"},
	"application/vnd.dvb.notif-init+xml": {"source":"iana"},
	"application/vnd.dvb.pfr": {"source":"iana"},
	"application/vnd.dvb.service": {"source":"iana","extensions":["svc"]},
	"application/vnd.dxr": {"source":"iana"},
	"application/vnd.dynageo": {"source":"iana","extensions":["geo"]},
	"application/vnd.dzr": {"source":"iana"},
	"application/vnd.easykaraoke.cdgdownload": {"source":"iana"},
	"application/vnd.ecdis-update": {"source":"iana"},
	"application/vnd.ecowin.chart": {"source":"iana","extensions":["mag"]},
	"application/vnd.ecowin.filerequest": {"source":"iana"},
	"application/vnd.ecowin.fileupdate": {"source":"iana"},
	"application/vnd.ecowin.series": {"source":"iana"},
	"application/vnd.ecowin.seriesrequest": {"source":"iana"},
	"application/vnd.ecowin.seriesupdate": {"source":"iana"},
	"application/vnd.efi.img": {"source":"iana"},
	"application/vnd.efi.iso": {"source":"iana"},
	"application/vnd.emclient.accessrequest+xml": {"source":"iana"},
	"application/vnd.enliven": {"source":"iana","extensions":["nml"]},
	"application/vnd.enphase.envoy": {"source":"iana"},
	"application/vnd.eprints.data+xml": {"source":"iana"},
	"application/vnd.epson.esf": {"source":"iana","extensions":["esf"]},
	"application/vnd.epson.msf": {"source":"iana","extensions":["msf"]},
	"application/vnd.epson.quickanime": {"source":"iana","extensions":["qam"]},
	"application/vnd.epson.salt": {"source":"iana","extensions":["slt"]},
	"application/vnd.epson.ssf": {"source":"iana","extensions":["ssf"]},
	"application/vnd.ericsson.quickcall": {"source":"iana"},
	"application/vnd.espass-espass+zip": {"source":"iana"},
	"application/vnd.eszigno3+xml": {"source":"iana","extensions":["es3","et3"]},
	"application/vnd.etsi.aoc+xml": {"source":"iana"},
	"application/vnd.etsi.asic-e+zip": {"source":"iana"},
	"application/vnd.etsi.asic-s+zip": {"source":"iana"},
	"application/vnd.etsi.cug+xml": {"source":"iana"},
	"application/vnd.etsi.iptvcommand+xml": {"source":"iana"},
	"application/vnd.etsi.iptvdiscovery+xml": {"source":"iana"},
	"application/vnd.etsi.iptvprofile+xml": {"source":"iana"},
	"application/vnd.etsi.iptvsad-bc+xml": {"source":"iana"},
	"application/vnd.etsi.iptvsad-cod+xml": {"source":"iana"},
	"application/vnd.etsi.iptvsad-npvr+xml": {"source":"iana"},
	"application/vnd.etsi.iptvservice+xml": {"source":"iana"},
	"application/vnd.etsi.iptvsync+xml": {"source":"iana"},
	"application/vnd.etsi.iptvueprofile+xml": {"source":"iana"},
	"application/vnd.etsi.mcid+xml": {"source":"iana"},
	"application/vnd.etsi.mheg5": {"source":"iana"},
	"application/vnd.etsi.overload-control-policy-dataset+xml": {"source":"iana"},
	"application/vnd.etsi.pstn+xml": {"source":"iana"},
	"application/vnd.etsi.sci+xml": {"source":"iana"},
	"application/vnd.etsi.simservs+xml": {"source":"iana"},
	"application/vnd.etsi.timestamp-token": {"source":"iana"},
	"application/vnd.etsi.tsl+xml": {"source":"iana"},
	"application/vnd.etsi.tsl.der": {"source":"iana"},
	"application/vnd.eudora.data": {"source":"iana"},
	"application/vnd.evolv.ecig.profile": {"source":"iana"},
	"application/vnd.evolv.ecig.settings": {"source":"iana"},
	"application/vnd.evolv.ecig.theme": {"source":"iana"},
	"application/vnd.ezpix-album": {"source":"iana","extensions":["ez2"]},
	"application/vnd.ezpix-package": {"source":"iana","extensions":["ez3"]},
	"application/vnd.f-secure.mobile": {"source":"iana"},
	"application/vnd.fastcopy-disk-image": {"source":"iana"},
	"application/vnd.fdf": {"source":"iana","extensions":["fdf"]},
	"application/vnd.fdsn.mseed": {"source":"iana","extensions":["mseed"]},
	"application/vnd.fdsn.seed": {"source":"iana","extensions":["seed","dataless"]},
	"application/vnd.ffsns": {"source":"iana"},
	"application/vnd.filmit.zfc": {"source":"iana"},
	"application/vnd.fints": {"source":"iana"},
	"application/vnd.firemonkeys.cloudcell": {"source":"iana"},
	"application/vnd.flographit": {"source":"iana","extensions":["gph"]},
	"application/vnd.fluxtime.clip": {"source":"iana","extensions":["ftc"]},
	"application/vnd.font-fontforge-sfd": {"source":"iana"},
	"application/vnd.framemaker": {"source":"iana","extensions":["fm","frame","maker","book"]},
	"application/vnd.frogans.fnc": {"source":"iana","extensions":["fnc"]},
	"application/vnd.frogans.ltf": {"source":"iana","extensions":["ltf"]},
	"application/vnd.fsc.weblaunch": {"source":"iana","extensions":["fsc"]},
	"application/vnd.fujitsu.oasys": {"source":"iana","extensions":["oas"]},
	"application/vnd.fujitsu.oasys2": {"source":"iana","extensions":["oa2"]},
	"application/vnd.fujitsu.oasys3": {"source":"iana","extensions":["oa3"]},
	"application/vnd.fujitsu.oasysgp": {"source":"iana","extensions":["fg5"]},
	"application/vnd.fujitsu.oasysprs": {"source":"iana","extensions":["bh2"]},
	"application/vnd.fujixerox.art-ex": {"source":"iana"},
	"application/vnd.fujixerox.art4": {"source":"iana"},
	"application/vnd.fujixerox.ddd": {"source":"iana","extensions":["ddd"]},
	"application/vnd.fujixerox.docuworks": {"source":"iana","extensions":["xdw"]},
	"application/vnd.fujixerox.docuworks.binder": {"source":"iana","extensions":["xbd"]},
	"application/vnd.fujixerox.docuworks.container": {"source":"iana"},
	"application/vnd.fujixerox.hbpl": {"source":"iana"},
	"application/vnd.fut-misnet": {"source":"iana"},
	"application/vnd.fuzzysheet": {"source":"iana","extensions":["fzs"]},
	"application/vnd.genomatix.tuxedo": {"source":"iana","extensions":["txd"]},
	"application/vnd.geo+json": {"source":"iana","compressible":true},
	"application/vnd.geocube+xml": {"source":"iana"},
	"application/vnd.geogebra.file": {"source":"iana","extensions":["ggb"]},
	"application/vnd.geogebra.tool": {"source":"iana","extensions":["ggt"]},
	"application/vnd.geometry-explorer": {"source":"iana","extensions":["gex","gre"]},
	"application/vnd.geonext": {"source":"iana","extensions":["gxt"]},
	"application/vnd.geoplan": {"source":"iana","extensions":["g2w"]},
	"application/vnd.geospace": {"source":"iana","extensions":["g3w"]},
	"application/vnd.gerber": {"source":"iana"},
	"application/vnd.globalplatform.card-content-mgt": {"source":"iana"},
	"application/vnd.globalplatform.card-content-mgt-response": {"source":"iana"},
	"application/vnd.gmx": {"source":"iana","extensions":["gmx"]},
	"application/vnd.google-apps.document": {"compressible":false,"extensions":["gdoc"]},
	"application/vnd.google-apps.presentation": {"compressible":false,"extensions":["gslides"]},
	"application/vnd.google-apps.spreadsheet": {"compressible":false,"extensions":["gsheet"]},
	"application/vnd.google-earth.kml+xml": {"source":"iana","compressible":true,"extensions":["kml"]},
	"application/vnd.google-earth.kmz": {"source":"iana","compressible":false,"extensions":["kmz"]},
	"application/vnd.gov.sk.e-form+xml": {"source":"iana"},
	"application/vnd.gov.sk.e-form+zip": {"source":"iana"},
	"application/vnd.gov.sk.xmldatacontainer+xml": {"source":"iana"},
	"application/vnd.grafeq": {"source":"iana","extensions":["gqf","gqs"]},
	"application/vnd.gridmp": {"source":"iana"},
	"application/vnd.groove-account": {"source":"iana","extensions":["gac"]},
	"application/vnd.groove-help": {"source":"iana","extensions":["ghf"]},
	"application/vnd.groove-identity-message": {"source":"iana","extensions":["gim"]},
	"application/vnd.groove-injector": {"source":"iana","extensions":["grv"]},
	"application/vnd.groove-tool-message": {"source":"iana","extensions":["gtm"]},
	"application/vnd.groove-tool-template": {"source":"iana","extensions":["tpl"]},
	"application/vnd.groove-vcard": {"source":"iana","extensions":["vcg"]},
	"application/vnd.hal+json": {"source":"iana","compressible":true},
	"application/vnd.hal+xml": {"source":"iana","extensions":["hal"]},
	"application/vnd.handheld-entertainment+xml": {"source":"iana","extensions":["zmm"]},
	"application/vnd.hbci": {"source":"iana","extensions":["hbci"]},
	"application/vnd.hc+json": {"source":"iana","compressible":true},
	"application/vnd.hcl-bireports": {"source":"iana"},
	"application/vnd.hdt": {"source":"iana"},
	"application/vnd.heroku+json": {"source":"iana","compressible":true},
	"application/vnd.hhe.lesson-player": {"source":"iana","extensions":["les"]},
	"application/vnd.hp-hpgl": {"source":"iana","extensions":["hpgl"]},
	"application/vnd.hp-hpid": {"source":"iana","extensions":["hpid"]},
	"application/vnd.hp-hps": {"source":"iana","extensions":["hps"]},
	"application/vnd.hp-jlyt": {"source":"iana","extensions":["jlt"]},
	"application/vnd.hp-pcl": {"source":"iana","extensions":["pcl"]},
	"application/vnd.hp-pclxl": {"source":"iana","extensions":["pclxl"]},
	"application/vnd.httphone": {"source":"iana"},
	"application/vnd.hydrostatix.sof-data": {"source":"iana","extensions":["sfd-hdstx"]},
	"application/vnd.hyper-item+json": {"source":"iana","compressible":true},
	"application/vnd.hyperdrive+json": {"source":"iana","compressible":true},
	"application/vnd.hzn-3d-crossword": {"source":"iana"},
	"application/vnd.ibm.afplinedata": {"source":"iana"},
	"application/vnd.ibm.electronic-media": {"source":"iana"},
	"application/vnd.ibm.minipay": {"source":"iana","extensions":["mpy"]},
	"application/vnd.ibm.modcap": {"source":"iana","extensions":["afp","listafp","list3820"]},
	"application/vnd.ibm.rights-management": {"source":"iana","extensions":["irm"]},
	"application/vnd.ibm.secure-container": {"source":"iana","extensions":["sc"]},
	"application/vnd.iccprofile": {"source":"iana","extensions":["icc","icm"]},
	"application/vnd.ieee.1905": {"source":"iana"},
	"application/vnd.igloader": {"source":"iana","extensions":["igl"]},
	"application/vnd.imagemeter.folder+zip": {"source":"iana"},
	"application/vnd.imagemeter.image+zip": {"source":"iana"},
	"application/vnd.immervision-ivp": {"source":"iana","extensions":["ivp"]},
	"application/vnd.immervision-ivu": {"source":"iana","extensions":["ivu"]},
	"application/vnd.ims.imsccv1p1": {"source":"iana"},
	"application/vnd.ims.imsccv1p2": {"source":"iana"},
	"application/vnd.ims.imsccv1p3": {"source":"iana"},
	"application/vnd.ims.lis.v2.result+json": {"source":"iana","compressible":true},
	"application/vnd.ims.lti.v2.toolconsumerprofile+json": {"source":"iana","compressible":true},
	"application/vnd.ims.lti.v2.toolproxy+json": {"source":"iana","compressible":true},
	"application/vnd.ims.lti.v2.toolproxy.id+json": {"source":"iana","compressible":true},
	"application/vnd.ims.lti.v2.toolsettings+json": {"source":"iana","compressible":true},
	"application/vnd.ims.lti.v2.toolsettings.simple+json": {"source":"iana","compressible":true},
	"application/vnd.informedcontrol.rms+xml": {"source":"iana"},
	"application/vnd.informix-visionary": {"source":"iana"},
	"application/vnd.infotech.project": {"source":"iana"},
	"application/vnd.infotech.project+xml": {"source":"iana"},
	"application/vnd.innopath.wamp.notification": {"source":"iana"},
	"application/vnd.insors.igm": {"source":"iana","extensions":["igm"]},
	"application/vnd.intercon.formnet": {"source":"iana","extensions":["xpw","xpx"]},
	"application/vnd.intergeo": {"source":"iana","extensions":["i2g"]},
	"application/vnd.intertrust.digibox": {"source":"iana"},
	"application/vnd.intertrust.nncp": {"source":"iana"},
	"application/vnd.intu.qbo": {"source":"iana","extensions":["qbo"]},
	"application/vnd.intu.qfx": {"source":"iana","extensions":["qfx"]},
	"application/vnd.iptc.g2.catalogitem+xml": {"source":"iana"},
	"application/vnd.iptc.g2.conceptitem+xml": {"source":"iana"},
	"application/vnd.iptc.g2.knowledgeitem+xml": {"source":"iana"},
	"application/vnd.iptc.g2.newsitem+xml": {"source":"iana"},
	"application/vnd.iptc.g2.newsmessage+xml": {"source":"iana"},
	"application/vnd.iptc.g2.packageitem+xml": {"source":"iana"},
	"application/vnd.iptc.g2.planningitem+xml": {"source":"iana"},
	"application/vnd.ipunplugged.rcprofile": {"source":"iana","extensions":["rcprofile"]},
	"application/vnd.irepository.package+xml": {"source":"iana","extensions":["irp"]},
	"application/vnd.is-xpr": {"source":"iana","extensions":["xpr"]},
	"application/vnd.isac.fcs": {"source":"iana","extensions":["fcs"]},
	"application/vnd.jam": {"source":"iana","extensions":["jam"]},
	"application/vnd.japannet-directory-service": {"source":"iana"},
	"application/vnd.japannet-jpnstore-wakeup": {"source":"iana"},
	"application/vnd.japannet-payment-wakeup": {"source":"iana"},
	"application/vnd.japannet-registration": {"source":"iana"},
	"application/vnd.japannet-registration-wakeup": {"source":"iana"},
	"application/vnd.japannet-setstore-wakeup": {"source":"iana"},
	"application/vnd.japannet-verification": {"source":"iana"},
	"application/vnd.japannet-verification-wakeup": {"source":"iana"},
	"application/vnd.jcp.javame.midlet-rms": {"source":"iana","extensions":["rms"]},
	"application/vnd.jisp": {"source":"iana","extensions":["jisp"]},
	"application/vnd.joost.joda-archive": {"source":"iana","extensions":["joda"]},
	"application/vnd.jsk.isdn-ngn": {"source":"iana"},
	"application/vnd.kahootz": {"source":"iana","extensions":["ktz","ktr"]},
	"application/vnd.kde.karbon": {"source":"iana","extensions":["karbon"]},
	"application/vnd.kde.kchart": {"source":"iana","extensions":["chrt"]},
	"application/vnd.kde.kformula": {"source":"iana","extensions":["kfo"]},
	"application/vnd.kde.kivio": {"source":"iana","extensions":["flw"]},
	"application/vnd.kde.kontour": {"source":"iana","extensions":["kon"]},
	"application/vnd.kde.kpresenter": {"source":"iana","extensions":["kpr","kpt"]},
	"application/vnd.kde.kspread": {"source":"iana","extensions":["ksp"]},
	"application/vnd.kde.kword": {"source":"iana","extensions":["kwd","kwt"]},
	"application/vnd.kenameaapp": {"source":"iana","extensions":["htke"]},
	"application/vnd.kidspiration": {"source":"iana","extensions":["kia"]},
	"application/vnd.kinar": {"source":"iana","extensions":["kne","knp"]},
	"application/vnd.koan": {"source":"iana","extensions":["skp","skd","skt","skm"]},
	"application/vnd.kodak-descriptor": {"source":"iana","extensions":["sse"]},
	"application/vnd.las.las+json": {"source":"iana","compressible":true},
	"application/vnd.las.las+xml": {"source":"iana","extensions":["lasxml"]},
	"application/vnd.liberty-request+xml": {"source":"iana"},
	"application/vnd.llamagraphics.life-balance.desktop": {"source":"iana","extensions":["lbd"]},
	"application/vnd.llamagraphics.life-balance.exchange+xml": {"source":"iana","extensions":["lbe"]},
	"application/vnd.lotus-1-2-3": {"source":"iana","extensions":["123"]},
	"application/vnd.lotus-approach": {"source":"iana","extensions":["apr"]},
	"application/vnd.lotus-freelance": {"source":"iana","extensions":["pre"]},
	"application/vnd.lotus-notes": {"source":"iana","extensions":["nsf"]},
	"application/vnd.lotus-organizer": {"source":"iana","extensions":["org"]},
	"application/vnd.lotus-screencam": {"source":"iana","extensions":["scm"]},
	"application/vnd.lotus-wordpro": {"source":"iana","extensions":["lwp"]},
	"application/vnd.macports.portpkg": {"source":"iana","extensions":["portpkg"]},
	"application/vnd.mapbox-vector-tile": {"source":"iana"},
	"application/vnd.marlin.drm.actiontoken+xml": {"source":"iana"},
	"application/vnd.marlin.drm.conftoken+xml": {"source":"iana"},
	"application/vnd.marlin.drm.license+xml": {"source":"iana"},
	"application/vnd.marlin.drm.mdcf": {"source":"iana"},
	"application/vnd.mason+json": {"source":"iana","compressible":true},
	"application/vnd.maxmind.maxmind-db": {"source":"iana"},
	"application/vnd.mcd": {"source":"iana","extensions":["mcd"]},
	"application/vnd.medcalcdata": {"source":"iana","extensions":["mc1"]},
	"application/vnd.mediastation.cdkey": {"source":"iana","extensions":["cdkey"]},
	"application/vnd.meridian-slingshot": {"source":"iana"},
	"application/vnd.mfer": {"source":"iana","extensions":["mwf"]},
	"application/vnd.mfmp": {"source":"iana","extensions":["mfm"]},
	"application/vnd.micro+json": {"source":"iana","compressible":true},
	"application/vnd.micrografx.flo": {"source":"iana","extensions":["flo"]},
	"application/vnd.micrografx.igx": {"source":"iana","extensions":["igx"]},
	"application/vnd.microsoft.portable-executable": {"source":"iana"},
	"application/vnd.microsoft.windows.thumbnail-cache": {"source":"iana"},
	"application/vnd.miele+json": {"source":"iana","compressible":true},
	"application/vnd.mif": {"source":"iana","extensions":["mif"]},
	"application/vnd.minisoft-hp3000-save": {"source":"iana"},
	"application/vnd.mitsubishi.misty-guard.trustweb": {"source":"iana"},
	"application/vnd.mobius.daf": {"source":"iana","extensions":["daf"]},
	"application/vnd.mobius.dis": {"source":"iana","extensions":["dis"]},
	"application/vnd.mobius.mbk": {"source":"iana","extensions":["mbk"]},
	"application/vnd.mobius.mqy": {"source":"iana","extensions":["mqy"]},
	"application/vnd.mobius.msl": {"source":"iana","extensions":["msl"]},
	"application/vnd.mobius.plc": {"source":"iana","extensions":["plc"]},
	"application/vnd.mobius.txf": {"source":"iana","extensions":["txf"]},
	"application/vnd.mophun.application": {"source":"iana","extensions":["mpn"]},
	"application/vnd.mophun.certificate": {"source":"iana","extensions":["mpc"]},
	"application/vnd.motorola.flexsuite": {"source":"iana"},
	"application/vnd.motorola.flexsuite.adsi": {"source":"iana"},
	"application/vnd.motorola.flexsuite.fis": {"source":"iana"},
	"application/vnd.motorola.flexsuite.gotap": {"source":"iana"},
	"application/vnd.motorola.flexsuite.kmr": {"source":"iana"},
	"application/vnd.motorola.flexsuite.ttc": {"source":"iana"},
	"application/vnd.motorola.flexsuite.wem": {"source":"iana"},
	"application/vnd.motorola.iprm": {"source":"iana"},
	"application/vnd.mozilla.xul+xml": {"source":"iana","compressible":true,"extensions":["xul"]},
	"application/vnd.ms-3mfdocument": {"source":"iana"},
	"application/vnd.ms-artgalry": {"source":"iana","extensions":["cil"]},
	"application/vnd.ms-asf": {"source":"iana"},
	"application/vnd.ms-cab-compressed": {"source":"iana","extensions":["cab"]},
	"application/vnd.ms-color.iccprofile": {"source":"apache"},
	"application/vnd.ms-excel": {"source":"iana","compressible":false,"extensions":["xls","xlm","xla","xlc","xlt","xlw"]},
	"application/vnd.ms-excel.addin.macroenabled.12": {"source":"iana","extensions":["xlam"]},
	"application/vnd.ms-excel.sheet.binary.macroenabled.12": {"source":"iana","extensions":["xlsb"]},
	"application/vnd.ms-excel.sheet.macroenabled.12": {"source":"iana","extensions":["xlsm"]},
	"application/vnd.ms-excel.template.macroenabled.12": {"source":"iana","extensions":["xltm"]},
	"application/vnd.ms-fontobject": {"source":"iana","compressible":true,"extensions":["eot"]},
	"application/vnd.ms-htmlhelp": {"source":"iana","extensions":["chm"]},
	"application/vnd.ms-ims": {"source":"iana","extensions":["ims"]},
	"application/vnd.ms-lrm": {"source":"iana","extensions":["lrm"]},
	"application/vnd.ms-office.activex+xml": {"source":"iana"},
	"application/vnd.ms-officetheme": {"source":"iana","extensions":["thmx"]},
	"application/vnd.ms-opentype": {"source":"apache","compressible":true},
	"application/vnd.ms-outlook": {"compressible":false,"extensions":["msg"]},
	"application/vnd.ms-package.obfuscated-opentype": {"source":"apache"},
	"application/vnd.ms-pki.seccat": {"source":"apache","extensions":["cat"]},
	"application/vnd.ms-pki.stl": {"source":"apache","extensions":["stl"]},
	"application/vnd.ms-playready.initiator+xml": {"source":"iana"},
	"application/vnd.ms-powerpoint": {"source":"iana","compressible":false,"extensions":["ppt","pps","pot"]},
	"application/vnd.ms-powerpoint.addin.macroenabled.12": {"source":"iana","extensions":["ppam"]},
	"application/vnd.ms-powerpoint.presentation.macroenabled.12": {"source":"iana","extensions":["pptm"]},
	"application/vnd.ms-powerpoint.slide.macroenabled.12": {"source":"iana","extensions":["sldm"]},
	"application/vnd.ms-powerpoint.slideshow.macroenabled.12": {"source":"iana","extensions":["ppsm"]},
	"application/vnd.ms-powerpoint.template.macroenabled.12": {"source":"iana","extensions":["potm"]},
	"application/vnd.ms-printdevicecapabilities+xml": {"source":"iana"},
	"application/vnd.ms-printing.printticket+xml": {"source":"apache"},
	"application/vnd.ms-printschematicket+xml": {"source":"iana"},
	"application/vnd.ms-project": {"source":"iana","extensions":["mpp","mpt"]},
	"application/vnd.ms-tnef": {"source":"iana"},
	"application/vnd.ms-windows.devicepairing": {"source":"iana"},
	"application/vnd.ms-windows.nwprinting.oob": {"source":"iana"},
	"application/vnd.ms-windows.printerpairing": {"source":"iana"},
	"application/vnd.ms-windows.wsd.oob": {"source":"iana"},
	"application/vnd.ms-wmdrm.lic-chlg-req": {"source":"iana"},
	"application/vnd.ms-wmdrm.lic-resp": {"source":"iana"},
	"application/vnd.ms-wmdrm.meter-chlg-req": {"source":"iana"},
	"application/vnd.ms-wmdrm.meter-resp": {"source":"iana"},
	"application/vnd.ms-word.document.macroenabled.12": {"source":"iana","extensions":["docm"]},
	"application/vnd.ms-word.template.macroenabled.12": {"source":"iana","extensions":["dotm"]},
	"application/vnd.ms-works": {"source":"iana","extensions":["wps","wks","wcm","wdb"]},
	"application/vnd.ms-wpl": {"source":"iana","extensions":["wpl"]},
	"application/vnd.ms-xpsdocument": {"source":"iana","compressible":false,"extensions":["xps"]},
	"application/vnd.msa-disk-image": {"source":"iana"},
	"application/vnd.mseq": {"source":"iana","extensions":["mseq"]},
	"application/vnd.msign": {"source":"iana"},
	"application/vnd.multiad.creator": {"source":"iana"},
	"application/vnd.multiad.creator.cif": {"source":"iana"},
	"application/vnd.music-niff": {"source":"iana"},
	"application/vnd.musician": {"source":"iana","extensions":["mus"]},
	"application/vnd.muvee.style": {"source":"iana","extensions":["msty"]},
	"application/vnd.mynfc": {"source":"iana","extensions":["taglet"]},
	"application/vnd.ncd.control": {"source":"iana"},
	"application/vnd.ncd.reference": {"source":"iana"},
	"application/vnd.nearst.inv+json": {"source":"iana","compressible":true},
	"application/vnd.nervana": {"source":"iana"},
	"application/vnd.netfpx": {"source":"iana"},
	"application/vnd.neurolanguage.nlu": {"source":"iana","extensions":["nlu"]},
	"application/vnd.nintendo.nitro.rom": {"source":"iana"},
	"application/vnd.nintendo.snes.rom": {"source":"iana"},
	"application/vnd.nitf": {"source":"iana","extensions":["ntf","nitf"]},
	"application/vnd.noblenet-directory": {"source":"iana","extensions":["nnd"]},
	"application/vnd.noblenet-sealer": {"source":"iana","extensions":["nns"]},
	"application/vnd.noblenet-web": {"source":"iana","extensions":["nnw"]},
	"application/vnd.nokia.catalogs": {"source":"iana"},
	"application/vnd.nokia.conml+wbxml": {"source":"iana"},
	"application/vnd.nokia.conml+xml": {"source":"iana"},
	"application/vnd.nokia.iptv.config+xml": {"source":"iana"},
	"application/vnd.nokia.isds-radio-presets": {"source":"iana"},
	"application/vnd.nokia.landmark+wbxml": {"source":"iana"},
	"application/vnd.nokia.landmark+xml": {"source":"iana"},
	"application/vnd.nokia.landmarkcollection+xml": {"source":"iana"},
	"application/vnd.nokia.n-gage.ac+xml": {"source":"iana"},
	"application/vnd.nokia.n-gage.data": {"source":"iana","extensions":["ngdat"]},
	"application/vnd.nokia.n-gage.symbian.install": {"source":"iana","extensions":["n-gage"]},
	"application/vnd.nokia.ncd": {"source":"iana"},
	"application/vnd.nokia.pcd+wbxml": {"source":"iana"},
	"application/vnd.nokia.pcd+xml": {"source":"iana"},
	"application/vnd.nokia.radio-preset": {"source":"iana","extensions":["rpst"]},
	"application/vnd.nokia.radio-presets": {"source":"iana","extensions":["rpss"]},
	"application/vnd.novadigm.edm": {"source":"iana","extensions":["edm"]},
	"application/vnd.novadigm.edx": {"source":"iana","extensions":["edx"]},
	"application/vnd.novadigm.ext": {"source":"iana","extensions":["ext"]},
	"application/vnd.ntt-local.content-share": {"source":"iana"},
	"application/vnd.ntt-local.file-transfer": {"source":"iana"},
	"application/vnd.ntt-local.ogw_remote-access": {"source":"iana"},
	"application/vnd.ntt-local.sip-ta_remote": {"source":"iana"},
	"application/vnd.ntt-local.sip-ta_tcp_stream": {"source":"iana"},
	"application/vnd.oasis.opendocument.chart": {"source":"iana","extensions":["odc"]},
	"application/vnd.oasis.opendocument.chart-template": {"source":"iana","extensions":["otc"]},
	"application/vnd.oasis.opendocument.database": {"source":"iana","extensions":["odb"]},
	"application/vnd.oasis.opendocument.formula": {"source":"iana","extensions":["odf"]},
	"application/vnd.oasis.opendocument.formula-template": {"source":"iana","extensions":["odft"]},
	"application/vnd.oasis.opendocument.graphics": {"source":"iana","compressible":false,"extensions":["odg"]},
	"application/vnd.oasis.opendocument.graphics-template": {"source":"iana","extensions":["otg"]},
	"application/vnd.oasis.opendocument.image": {"source":"iana","extensions":["odi"]},
	"application/vnd.oasis.opendocument.image-template": {"source":"iana","extensions":["oti"]},
	"application/vnd.oasis.opendocument.presentation": {"source":"iana","compressible":false,"extensions":["odp"]},
	"application/vnd.oasis.opendocument.presentation-template": {"source":"iana","extensions":["otp"]},
	"application/vnd.oasis.opendocument.spreadsheet": {"source":"iana","compressible":false,"extensions":["ods"]},
	"application/vnd.oasis.opendocument.spreadsheet-template": {"source":"iana","extensions":["ots"]},
	"application/vnd.oasis.opendocument.text": {"source":"iana","compressible":false,"extensions":["odt"]},
	"application/vnd.oasis.opendocument.text-master": {"source":"iana","extensions":["odm"]},
	"application/vnd.oasis.opendocument.text-template": {"source":"iana","extensions":["ott"]},
	"application/vnd.oasis.opendocument.text-web": {"source":"iana","extensions":["oth"]},
	"application/vnd.obn": {"source":"iana"},
	"application/vnd.ocf+cbor": {"source":"iana"},
	"application/vnd.oftn.l10n+json": {"source":"iana","compressible":true},
	"application/vnd.oipf.contentaccessdownload+xml": {"source":"iana"},
	"application/vnd.oipf.contentaccessstreaming+xml": {"source":"iana"},
	"application/vnd.oipf.cspg-hexbinary": {"source":"iana"},
	"application/vnd.oipf.dae.svg+xml": {"source":"iana"},
	"application/vnd.oipf.dae.xhtml+xml": {"source":"iana"},
	"application/vnd.oipf.mippvcontrolmessage+xml": {"source":"iana"},
	"application/vnd.oipf.pae.gem": {"source":"iana"},
	"application/vnd.oipf.spdiscovery+xml": {"source":"iana"},
	"application/vnd.oipf.spdlist+xml": {"source":"iana"},
	"application/vnd.oipf.ueprofile+xml": {"source":"iana"},
	"application/vnd.oipf.userprofile+xml": {"source":"iana"},
	"application/vnd.olpc-sugar": {"source":"iana","extensions":["xo"]},
	"application/vnd.oma-scws-config": {"source":"iana"},
	"application/vnd.oma-scws-http-request": {"source":"iana"},
	"application/vnd.oma-scws-http-response": {"source":"iana"},
	"application/vnd.oma.bcast.associated-procedure-parameter+xml": {"source":"iana"},
	"application/vnd.oma.bcast.drm-trigger+xml": {"source":"iana"},
	"application/vnd.oma.bcast.imd+xml": {"source":"iana"},
	"application/vnd.oma.bcast.ltkm": {"source":"iana"},
	"application/vnd.oma.bcast.notification+xml": {"source":"iana"},
	"application/vnd.oma.bcast.provisioningtrigger": {"source":"iana"},
	"application/vnd.oma.bcast.sgboot": {"source":"iana"},
	"application/vnd.oma.bcast.sgdd+xml": {"source":"iana"},
	"application/vnd.oma.bcast.sgdu": {"source":"iana"},
	"application/vnd.oma.bcast.simple-symbol-container": {"source":"iana"},
	"application/vnd.oma.bcast.smartcard-trigger+xml": {"source":"iana"},
	"application/vnd.oma.bcast.sprov+xml": {"source":"iana"},
	"application/vnd.oma.bcast.stkm": {"source":"iana"},
	"application/vnd.oma.cab-address-book+xml": {"source":"iana"},
	"application/vnd.oma.cab-feature-handler+xml": {"source":"iana"},
	"application/vnd.oma.cab-pcc+xml": {"source":"iana"},
	"application/vnd.oma.cab-subs-invite+xml": {"source":"iana"},
	"application/vnd.oma.cab-user-prefs+xml": {"source":"iana"},
	"application/vnd.oma.dcd": {"source":"iana"},
	"application/vnd.oma.dcdc": {"source":"iana"},
	"application/vnd.oma.dd2+xml": {"source":"iana","extensions":["dd2"]},
	"application/vnd.oma.drm.risd+xml": {"source":"iana"},
	"application/vnd.oma.group-usage-list+xml": {"source":"iana"},
	"application/vnd.oma.lwm2m+json": {"source":"iana","compressible":true},
	"application/vnd.oma.lwm2m+tlv": {"source":"iana"},
	"application/vnd.oma.pal+xml": {"source":"iana"},
	"application/vnd.oma.poc.detailed-progress-report+xml": {"source":"iana"},
	"application/vnd.oma.poc.final-report+xml": {"source":"iana"},
	"application/vnd.oma.poc.groups+xml": {"source":"iana"},
	"application/vnd.oma.poc.invocation-descriptor+xml": {"source":"iana"},
	"application/vnd.oma.poc.optimized-progress-report+xml": {"source":"iana"},
	"application/vnd.oma.push": {"source":"iana"},
	"application/vnd.oma.scidm.messages+xml": {"source":"iana"},
	"application/vnd.oma.xcap-directory+xml": {"source":"iana"},
	"application/vnd.omads-email+xml": {"source":"iana"},
	"application/vnd.omads-file+xml": {"source":"iana"},
	"application/vnd.omads-folder+xml": {"source":"iana"},
	"application/vnd.omaloc-supl-init": {"source":"iana"},
	"application/vnd.onepager": {"source":"iana"},
	"application/vnd.onepagertamp": {"source":"iana"},
	"application/vnd.onepagertamx": {"source":"iana"},
	"application/vnd.onepagertat": {"source":"iana"},
	"application/vnd.onepagertatp": {"source":"iana"},
	"application/vnd.onepagertatx": {"source":"iana"},
	"application/vnd.openblox.game+xml": {"source":"iana"},
	"application/vnd.openblox.game-binary": {"source":"iana"},
	"application/vnd.openeye.oeb": {"source":"iana"},
	"application/vnd.openofficeorg.extension": {"source":"apache","extensions":["oxt"]},
	"application/vnd.openstreetmap.data+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.custom-properties+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.drawing+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.extended-properties+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.presentationml-template": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": {"source":"iana","compressible":false,"extensions":["pptx"]},
	"application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.presentationml.slide": {"source":"iana","extensions":["sldx"]},
	"application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.presentationml.slideshow": {"source":"iana","extensions":["ppsx"]},
	"application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.presentationml.template": {"source":"apache","extensions":["potx"]},
	"application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml-template": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {"source":"iana","compressible":false,"extensions":["xlsx"]},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.template": {"source":"apache","extensions":["xltx"]},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.theme+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.themeoverride+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.vmldrawing": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.wordprocessingml-template": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": {"source":"iana","compressible":false,"extensions":["docx"]},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.template": {"source":"apache","extensions":["dotx"]},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {"source":"iana"},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {"source":"iana"},
	"application/vnd.openxmlformats-package.core-properties+xml": {"source":"iana"},
	"application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {"source":"iana"},
	"application/vnd.openxmlformats-package.relationships+xml": {"source":"iana"},
	"application/vnd.oracle.resource+json": {"source":"iana","compressible":true},
	"application/vnd.orange.indata": {"source":"iana"},
	"application/vnd.osa.netdeploy": {"source":"iana"},
	"application/vnd.osgeo.mapguide.package": {"source":"iana","extensions":["mgp"]},
	"application/vnd.osgi.bundle": {"source":"iana"},
	"application/vnd.osgi.dp": {"source":"iana","extensions":["dp"]},
	"application/vnd.osgi.subsystem": {"source":"iana","extensions":["esa"]},
	"application/vnd.otps.ct-kip+xml": {"source":"iana"},
	"application/vnd.oxli.countgraph": {"source":"iana"},
	"application/vnd.pagerduty+json": {"source":"iana","compressible":true},
	"application/vnd.palm": {"source":"iana","extensions":["pdb","pqa","oprc"]},
	"application/vnd.panoply": {"source":"iana"},
	"application/vnd.paos+xml": {"source":"iana"},
	"application/vnd.paos.xml": {"source":"apache"},
	"application/vnd.pawaafile": {"source":"iana","extensions":["paw"]},
	"application/vnd.pcos": {"source":"iana"},
	"application/vnd.pg.format": {"source":"iana","extensions":["str"]},
	"application/vnd.pg.osasli": {"source":"iana","extensions":["ei6"]},
	"application/vnd.piaccess.application-licence": {"source":"iana"},
	"application/vnd.picsel": {"source":"iana","extensions":["efif"]},
	"application/vnd.pmi.widget": {"source":"iana","extensions":["wg"]},
	"application/vnd.poc.group-advertisement+xml": {"source":"iana"},
	"application/vnd.pocketlearn": {"source":"iana","extensions":["plf"]},
	"application/vnd.powerbuilder6": {"source":"iana","extensions":["pbd"]},
	"application/vnd.powerbuilder6-s": {"source":"iana"},
	"application/vnd.powerbuilder7": {"source":"iana"},
	"application/vnd.powerbuilder7-s": {"source":"iana"},
	"application/vnd.powerbuilder75": {"source":"iana"},
	"application/vnd.powerbuilder75-s": {"source":"iana"},
	"application/vnd.preminet": {"source":"iana"},
	"application/vnd.previewsystems.box": {"source":"iana","extensions":["box"]},
	"application/vnd.proteus.magazine": {"source":"iana","extensions":["mgz"]},
	"application/vnd.publishare-delta-tree": {"source":"iana","extensions":["qps"]},
	"application/vnd.pvi.ptid1": {"source":"iana","extensions":["ptid"]},
	"application/vnd.pwg-multiplexed": {"source":"iana"},
	"application/vnd.pwg-xhtml-print+xml": {"source":"iana"},
	"application/vnd.qualcomm.brew-app-res": {"source":"iana"},
	"application/vnd.quarantainenet": {"source":"iana"},
	"application/vnd.quark.quarkxpress": {"source":"iana","extensions":["qxd","qxt","qwd","qwt","qxl","qxb"]},
	"application/vnd.quobject-quoxdocument": {"source":"iana"},
	"application/vnd.radisys.moml+xml": {"source":"iana"},
	"application/vnd.radisys.msml+xml": {"source":"iana"},
	"application/vnd.radisys.msml-audit+xml": {"source":"iana"},
	"application/vnd.radisys.msml-audit-conf+xml": {"source":"iana"},
	"application/vnd.radisys.msml-audit-conn+xml": {"source":"iana"},
	"application/vnd.radisys.msml-audit-dialog+xml": {"source":"iana"},
	"application/vnd.radisys.msml-audit-stream+xml": {"source":"iana"},
	"application/vnd.radisys.msml-conf+xml": {"source":"iana"},
	"application/vnd.radisys.msml-dialog+xml": {"source":"iana"},
	"application/vnd.radisys.msml-dialog-base+xml": {"source":"iana"},
	"application/vnd.radisys.msml-dialog-fax-detect+xml": {"source":"iana"},
	"application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {"source":"iana"},
	"application/vnd.radisys.msml-dialog-group+xml": {"source":"iana"},
	"application/vnd.radisys.msml-dialog-speech+xml": {"source":"iana"},
	"application/vnd.radisys.msml-dialog-transform+xml": {"source":"iana"},
	"application/vnd.rainstor.data": {"source":"iana"},
	"application/vnd.rapid": {"source":"iana"},
	"application/vnd.rar": {"source":"iana"},
	"application/vnd.realvnc.bed": {"source":"iana","extensions":["bed"]},
	"application/vnd.recordare.musicxml": {"source":"iana","extensions":["mxl"]},
	"application/vnd.recordare.musicxml+xml": {"source":"iana","extensions":["musicxml"]},
	"application/vnd.renlearn.rlprint": {"source":"iana"},
	"application/vnd.rig.cryptonote": {"source":"iana","extensions":["cryptonote"]},
	"application/vnd.rim.cod": {"source":"apache","extensions":["cod"]},
	"application/vnd.rn-realmedia": {"source":"apache","extensions":["rm"]},
	"application/vnd.rn-realmedia-vbr": {"source":"apache","extensions":["rmvb"]},
	"application/vnd.route66.link66+xml": {"source":"iana","extensions":["link66"]},
	"application/vnd.rs-274x": {"source":"iana"},
	"application/vnd.ruckus.download": {"source":"iana"},
	"application/vnd.s3sms": {"source":"iana"},
	"application/vnd.sailingtracker.track": {"source":"iana","extensions":["st"]},
	"application/vnd.sbm.cid": {"source":"iana"},
	"application/vnd.sbm.mid2": {"source":"iana"},
	"application/vnd.scribus": {"source":"iana"},
	"application/vnd.sealed.3df": {"source":"iana"},
	"application/vnd.sealed.csf": {"source":"iana"},
	"application/vnd.sealed.doc": {"source":"iana"},
	"application/vnd.sealed.eml": {"source":"iana"},
	"application/vnd.sealed.mht": {"source":"iana"},
	"application/vnd.sealed.net": {"source":"iana"},
	"application/vnd.sealed.ppt": {"source":"iana"},
	"application/vnd.sealed.tiff": {"source":"iana"},
	"application/vnd.sealed.xls": {"source":"iana"},
	"application/vnd.sealedmedia.softseal.html": {"source":"iana"},
	"application/vnd.sealedmedia.softseal.pdf": {"source":"iana"},
	"application/vnd.seemail": {"source":"iana","extensions":["see"]},
	"application/vnd.sema": {"source":"iana","extensions":["sema"]},
	"application/vnd.semd": {"source":"iana","extensions":["semd"]},
	"application/vnd.semf": {"source":"iana","extensions":["semf"]},
	"application/vnd.shana.informed.formdata": {"source":"iana","extensions":["ifm"]},
	"application/vnd.shana.informed.formtemplate": {"source":"iana","extensions":["itp"]},
	"application/vnd.shana.informed.interchange": {"source":"iana","extensions":["iif"]},
	"application/vnd.shana.informed.package": {"source":"iana","extensions":["ipk"]},
	"application/vnd.sigrok.session": {"source":"iana"},
	"application/vnd.simtech-mindmapper": {"source":"iana","extensions":["twd","twds"]},
	"application/vnd.siren+json": {"source":"iana","compressible":true},
	"application/vnd.smaf": {"source":"iana","extensions":["mmf"]},
	"application/vnd.smart.notebook": {"source":"iana"},
	"application/vnd.smart.teacher": {"source":"iana","extensions":["teacher"]},
	"application/vnd.software602.filler.form+xml": {"source":"iana"},
	"application/vnd.software602.filler.form-xml-zip": {"source":"iana"},
	"application/vnd.solent.sdkm+xml": {"source":"iana","extensions":["sdkm","sdkd"]},
	"application/vnd.spotfire.dxp": {"source":"iana","extensions":["dxp"]},
	"application/vnd.spotfire.sfs": {"source":"iana","extensions":["sfs"]},
	"application/vnd.sss-cod": {"source":"iana"},
	"application/vnd.sss-dtf": {"source":"iana"},
	"application/vnd.sss-ntf": {"source":"iana"},
	"application/vnd.stardivision.calc": {"source":"apache","extensions":["sdc"]},
	"application/vnd.stardivision.draw": {"source":"apache","extensions":["sda"]},
	"application/vnd.stardivision.impress": {"source":"apache","extensions":["sdd"]},
	"application/vnd.stardivision.math": {"source":"apache","extensions":["smf"]},
	"application/vnd.stardivision.writer": {"source":"apache","extensions":["sdw","vor"]},
	"application/vnd.stardivision.writer-global": {"source":"apache","extensions":["sgl"]},
	"application/vnd.stepmania.package": {"source":"iana","extensions":["smzip"]},
	"application/vnd.stepmania.stepchart": {"source":"iana","extensions":["sm"]},
	"application/vnd.street-stream": {"source":"iana"},
	"application/vnd.sun.wadl+xml": {"source":"iana","compressible":true,"extensions":["wadl"]},
	"application/vnd.sun.xml.calc": {"source":"apache","extensions":["sxc"]},
	"application/vnd.sun.xml.calc.template": {"source":"apache","extensions":["stc"]},
	"application/vnd.sun.xml.draw": {"source":"apache","extensions":["sxd"]},
	"application/vnd.sun.xml.draw.template": {"source":"apache","extensions":["std"]},
	"application/vnd.sun.xml.impress": {"source":"apache","extensions":["sxi"]},
	"application/vnd.sun.xml.impress.template": {"source":"apache","extensions":["sti"]},
	"application/vnd.sun.xml.math": {"source":"apache","extensions":["sxm"]},
	"application/vnd.sun.xml.writer": {"source":"apache","extensions":["sxw"]},
	"application/vnd.sun.xml.writer.global": {"source":"apache","extensions":["sxg"]},
	"application/vnd.sun.xml.writer.template": {"source":"apache","extensions":["stw"]},
	"application/vnd.sus-calendar": {"source":"iana","extensions":["sus","susp"]},
	"application/vnd.svd": {"source":"iana","extensions":["svd"]},
	"application/vnd.swiftview-ics": {"source":"iana"},
	"application/vnd.symbian.install": {"source":"apache","extensions":["sis","sisx"]},
	"application/vnd.syncml+xml": {"source":"iana","extensions":["xsm"]},
	"application/vnd.syncml.dm+wbxml": {"source":"iana","extensions":["bdm"]},
	"application/vnd.syncml.dm+xml": {"source":"iana","extensions":["xdm"]},
	"application/vnd.syncml.dm.notification": {"source":"iana"},
	"application/vnd.syncml.dmddf+wbxml": {"source":"iana"},
	"application/vnd.syncml.dmddf+xml": {"source":"iana"},
	"application/vnd.syncml.dmtnds+wbxml": {"source":"iana"},
	"application/vnd.syncml.dmtnds+xml": {"source":"iana"},
	"application/vnd.syncml.ds.notification": {"source":"iana"},
	"application/vnd.tableschema+json": {"source":"iana","compressible":true},
	"application/vnd.tao.intent-module-archive": {"source":"iana","extensions":["tao"]},
	"application/vnd.tcpdump.pcap": {"source":"iana","extensions":["pcap","cap","dmp"]},
	"application/vnd.tmd.mediaflex.api+xml": {"source":"iana"},
	"application/vnd.tml": {"source":"iana"},
	"application/vnd.tmobile-livetv": {"source":"iana","extensions":["tmo"]},
	"application/vnd.tri.onesource": {"source":"iana"},
	"application/vnd.trid.tpt": {"source":"iana","extensions":["tpt"]},
	"application/vnd.triscape.mxs": {"source":"iana","extensions":["mxs"]},
	"application/vnd.trueapp": {"source":"iana","extensions":["tra"]},
	"application/vnd.truedoc": {"source":"iana"},
	"application/vnd.ubisoft.webplayer": {"source":"iana"},
	"application/vnd.ufdl": {"source":"iana","extensions":["ufd","ufdl"]},
	"application/vnd.uiq.theme": {"source":"iana","extensions":["utz"]},
	"application/vnd.umajin": {"source":"iana","extensions":["umj"]},
	"application/vnd.unity": {"source":"iana","extensions":["unityweb"]},
	"application/vnd.uoml+xml": {"source":"iana","extensions":["uoml"]},
	"application/vnd.uplanet.alert": {"source":"iana"},
	"application/vnd.uplanet.alert-wbxml": {"source":"iana"},
	"application/vnd.uplanet.bearer-choice": {"source":"iana"},
	"application/vnd.uplanet.bearer-choice-wbxml": {"source":"iana"},
	"application/vnd.uplanet.cacheop": {"source":"iana"},
	"application/vnd.uplanet.cacheop-wbxml": {"source":"iana"},
	"application/vnd.uplanet.channel": {"source":"iana"},
	"application/vnd.uplanet.channel-wbxml": {"source":"iana"},
	"application/vnd.uplanet.list": {"source":"iana"},
	"application/vnd.uplanet.list-wbxml": {"source":"iana"},
	"application/vnd.uplanet.listcmd": {"source":"iana"},
	"application/vnd.uplanet.listcmd-wbxml": {"source":"iana"},
	"application/vnd.uplanet.signal": {"source":"iana"},
	"application/vnd.uri-map": {"source":"iana"},
	"application/vnd.valve.source.material": {"source":"iana"},
	"application/vnd.vcx": {"source":"iana","extensions":["vcx"]},
	"application/vnd.vd-study": {"source":"iana"},
	"application/vnd.vectorworks": {"source":"iana"},
	"application/vnd.vel+json": {"source":"iana","compressible":true},
	"application/vnd.verimatrix.vcas": {"source":"iana"},
	"application/vnd.vidsoft.vidconference": {"source":"iana"},
	"application/vnd.visio": {"source":"iana","extensions":["vsd","vst","vss","vsw"]},
	"application/vnd.visionary": {"source":"iana","extensions":["vis"]},
	"application/vnd.vividence.scriptfile": {"source":"iana"},
	"application/vnd.vsf": {"source":"iana","extensions":["vsf"]},
	"application/vnd.wap.sic": {"source":"iana"},
	"application/vnd.wap.slc": {"source":"iana"},
	"application/vnd.wap.wbxml": {"source":"iana","extensions":["wbxml"]},
	"application/vnd.wap.wmlc": {"source":"iana","extensions":["wmlc"]},
	"application/vnd.wap.wmlscriptc": {"source":"iana","extensions":["wmlsc"]},
	"application/vnd.webturbo": {"source":"iana","extensions":["wtb"]},
	"application/vnd.wfa.p2p": {"source":"iana"},
	"application/vnd.wfa.wsc": {"source":"iana"},
	"application/vnd.windows.devicepairing": {"source":"iana"},
	"application/vnd.wmc": {"source":"iana"},
	"application/vnd.wmf.bootstrap": {"source":"iana"},
	"application/vnd.wolfram.mathematica": {"source":"iana"},
	"application/vnd.wolfram.mathematica.package": {"source":"iana"},
	"application/vnd.wolfram.player": {"source":"iana","extensions":["nbp"]},
	"application/vnd.wordperfect": {"source":"iana","extensions":["wpd"]},
	"application/vnd.wqd": {"source":"iana","extensions":["wqd"]},
	"application/vnd.wrq-hp3000-labelled": {"source":"iana"},
	"application/vnd.wt.stf": {"source":"iana","extensions":["stf"]},
	"application/vnd.wv.csp+wbxml": {"source":"iana"},
	"application/vnd.wv.csp+xml": {"source":"iana"},
	"application/vnd.wv.ssp+xml": {"source":"iana"},
	"application/vnd.xacml+json": {"source":"iana","compressible":true},
	"application/vnd.xara": {"source":"iana","extensions":["xar"]},
	"application/vnd.xfdl": {"source":"iana","extensions":["xfdl"]},
	"application/vnd.xfdl.webform": {"source":"iana"},
	"application/vnd.xmi+xml": {"source":"iana"},
	"application/vnd.xmpie.cpkg": {"source":"iana"},
	"application/vnd.xmpie.dpkg": {"source":"iana"},
	"application/vnd.xmpie.plan": {"source":"iana"},
	"application/vnd.xmpie.ppkg": {"source":"iana"},
	"application/vnd.xmpie.xlim": {"source":"iana"},
	"application/vnd.yamaha.hv-dic": {"source":"iana","extensions":["hvd"]},
	"application/vnd.yamaha.hv-script": {"source":"iana","extensions":["hvs"]},
	"application/vnd.yamaha.hv-voice": {"source":"iana","extensions":["hvp"]},
	"application/vnd.yamaha.openscoreformat": {"source":"iana","extensions":["osf"]},
	"application/vnd.yamaha.openscoreformat.osfpvg+xml": {"source":"iana","extensions":["osfpvg"]},
	"application/vnd.yamaha.remote-setup": {"source":"iana"},
	"application/vnd.yamaha.smaf-audio": {"source":"iana","extensions":["saf"]},
	"application/vnd.yamaha.smaf-phrase": {"source":"iana","extensions":["spf"]},
	"application/vnd.yamaha.through-ngn": {"source":"iana"},
	"application/vnd.yamaha.tunnel-udpencap": {"source":"iana"},
	"application/vnd.yaoweme": {"source":"iana"},
	"application/vnd.yellowriver-custom-menu": {"source":"iana","extensions":["cmp"]},
	"application/vnd.zul": {"source":"iana","extensions":["zir","zirz"]},
	"application/vnd.zzazz.deck+xml": {"source":"iana","extensions":["zaz"]},
	"application/voicexml+xml": {"source":"iana","extensions":["vxml"]},
	"application/vq-rtcpxr": {"source":"iana"},
	"application/watcherinfo+xml": {"source":"iana"},
	"application/whoispp-query": {"source":"iana"},
	"application/whoispp-response": {"source":"iana"},
	"application/widget": {"source":"iana","extensions":["wgt"]},
	"application/winhlp": {"source":"apache","extensions":["hlp"]},
	"application/wita": {"source":"iana"},
	"application/wordperfect5.1": {"source":"iana"},
	"application/wsdl+xml": {"source":"iana","extensions":["wsdl"]},
	"application/wspolicy+xml": {"source":"iana","extensions":["wspolicy"]},
	"application/x-7z-compressed": {"source":"apache","compressible":false,"extensions":["7z"]},
	"application/x-abiword": {"source":"apache","extensions":["abw"]},
	"application/x-ace-compressed": {"source":"apache","extensions":["ace"]},
	"application/x-amf": {"source":"apache"},
	"application/x-apple-diskimage": {"source":"apache","extensions":["dmg"]},
	"application/x-arj": {"compressible":false,"extensions":["arj"]},
	"application/x-authorware-bin": {"source":"apache","extensions":["aab","x32","u32","vox"]},
	"application/x-authorware-map": {"source":"apache","extensions":["aam"]},
	"application/x-authorware-seg": {"source":"apache","extensions":["aas"]},
	"application/x-bcpio": {"source":"apache","extensions":["bcpio"]},
	"application/x-bdoc": {"compressible":false,"extensions":["bdoc"]},
	"application/x-bittorrent": {"source":"apache","extensions":["torrent"]},
	"application/x-blorb": {"source":"apache","extensions":["blb","blorb"]},
	"application/x-bzip": {"source":"apache","compressible":false,"extensions":["bz"]},
	"application/x-bzip2": {"source":"apache","compressible":false,"extensions":["bz2","boz"]},
	"application/x-cbr": {"source":"apache","extensions":["cbr","cba","cbt","cbz","cb7"]},
	"application/x-cdlink": {"source":"apache","extensions":["vcd"]},
	"application/x-cfs-compressed": {"source":"apache","extensions":["cfs"]},
	"application/x-chat": {"source":"apache","extensions":["chat"]},
	"application/x-chess-pgn": {"source":"apache","extensions":["pgn"]},
	"application/x-chrome-extension": {"extensions":["crx"]},
	"application/x-cocoa": {"source":"nginx","extensions":["cco"]},
	"application/x-compress": {"source":"apache"},
	"application/x-conference": {"source":"apache","extensions":["nsc"]},
	"application/x-cpio": {"source":"apache","extensions":["cpio"]},
	"application/x-csh": {"source":"apache","extensions":["csh"]},
	"application/x-deb": {"compressible":false},
	"application/x-debian-package": {"source":"apache","extensions":["deb","udeb"]},
	"application/x-dgc-compressed": {"source":"apache","extensions":["dgc"]},
	"application/x-director": {"source":"apache","extensions":["dir","dcr","dxr","cst","cct","cxt","w3d","fgd","swa"]},
	"application/x-doom": {"source":"apache","extensions":["wad"]},
	"application/x-dtbncx+xml": {"source":"apache","extensions":["ncx"]},
	"application/x-dtbook+xml": {"source":"apache","extensions":["dtb"]},
	"application/x-dtbresource+xml": {"source":"apache","extensions":["res"]},
	"application/x-dvi": {"source":"apache","compressible":false,"extensions":["dvi"]},
	"application/x-envoy": {"source":"apache","extensions":["evy"]},
	"application/x-eva": {"source":"apache","extensions":["eva"]},
	"application/x-font-bdf": {"source":"apache","extensions":["bdf"]},
	"application/x-font-dos": {"source":"apache"},
	"application/x-font-framemaker": {"source":"apache"},
	"application/x-font-ghostscript": {"source":"apache","extensions":["gsf"]},
	"application/x-font-libgrx": {"source":"apache"},
	"application/x-font-linux-psf": {"source":"apache","extensions":["psf"]},
	"application/x-font-otf": {"source":"apache","compressible":true,"extensions":["otf"]},
	"application/x-font-pcf": {"source":"apache","extensions":["pcf"]},
	"application/x-font-snf": {"source":"apache","extensions":["snf"]},
	"application/x-font-speedo": {"source":"apache"},
	"application/x-font-sunos-news": {"source":"apache"},
	"application/x-font-ttf": {"source":"apache","compressible":true,"extensions":["ttf","ttc"]},
	"application/x-font-type1": {"source":"apache","extensions":["pfa","pfb","pfm","afm"]},
	"application/x-font-vfont": {"source":"apache"},
	"application/x-freearc": {"source":"apache","extensions":["arc"]},
	"application/x-futuresplash": {"source":"apache","extensions":["spl"]},
	"application/x-gca-compressed": {"source":"apache","extensions":["gca"]},
	"application/x-glulx": {"source":"apache","extensions":["ulx"]},
	"application/x-gnumeric": {"source":"apache","extensions":["gnumeric"]},
	"application/x-gramps-xml": {"source":"apache","extensions":["gramps"]},
	"application/x-gtar": {"source":"apache","extensions":["gtar"]},
	"application/x-gzip": {"source":"apache"},
	"application/x-hdf": {"source":"apache","extensions":["hdf"]},
	"application/x-httpd-php": {"compressible":true,"extensions":["php"]},
	"application/x-install-instructions": {"source":"apache","extensions":["install"]},
	"application/x-iso9660-image": {"source":"apache","extensions":["iso"]},
	"application/x-java-archive-diff": {"source":"nginx","extensions":["jardiff"]},
	"application/x-java-jnlp-file": {"source":"apache","compressible":false,"extensions":["jnlp"]},
	"application/x-javascript": {"compressible":true},
	"application/x-latex": {"source":"apache","compressible":false,"extensions":["latex"]},
	"application/x-lua-bytecode": {"extensions":["luac"]},
	"application/x-lzh-compressed": {"source":"apache","extensions":["lzh","lha"]},
	"application/x-makeself": {"source":"nginx","extensions":["run"]},
	"application/x-mie": {"source":"apache","extensions":["mie"]},
	"application/x-mobipocket-ebook": {"source":"apache","extensions":["prc","mobi"]},
	"application/x-mpegurl": {"compressible":false},
	"application/x-ms-application": {"source":"apache","extensions":["application"]},
	"application/x-ms-shortcut": {"source":"apache","extensions":["lnk"]},
	"application/x-ms-wmd": {"source":"apache","extensions":["wmd"]},
	"application/x-ms-wmz": {"source":"apache","extensions":["wmz"]},
	"application/x-ms-xbap": {"source":"apache","extensions":["xbap"]},
	"application/x-msaccess": {"source":"apache","extensions":["mdb"]},
	"application/x-msbinder": {"source":"apache","extensions":["obd"]},
	"application/x-mscardfile": {"source":"apache","extensions":["crd"]},
	"application/x-msclip": {"source":"apache","extensions":["clp"]},
	"application/x-msdos-program": {"extensions":["exe"]},
	"application/x-msdownload": {"source":"apache","extensions":["exe","dll","com","bat","msi"]},
	"application/x-msmediaview": {"source":"apache","extensions":["mvb","m13","m14"]},
	"application/x-msmetafile": {"source":"apache","extensions":["wmf","wmz","emf","emz"]},
	"application/x-msmoney": {"source":"apache","extensions":["mny"]},
	"application/x-mspublisher": {"source":"apache","extensions":["pub"]},
	"application/x-msschedule": {"source":"apache","extensions":["scd"]},
	"application/x-msterminal": {"source":"apache","extensions":["trm"]},
	"application/x-mswrite": {"source":"apache","extensions":["wri"]},
	"application/x-netcdf": {"source":"apache","extensions":["nc","cdf"]},
	"application/x-ns-proxy-autoconfig": {"compressible":true,"extensions":["pac"]},
	"application/x-nzb": {"source":"apache","extensions":["nzb"]},
	"application/x-perl": {"source":"nginx","extensions":["pl","pm"]},
	"application/x-pilot": {"source":"nginx","extensions":["prc","pdb"]},
	"application/x-pkcs12": {"source":"apache","compressible":false,"extensions":["p12","pfx"]},
	"application/x-pkcs7-certificates": {"source":"apache","extensions":["p7b","spc"]},
	"application/x-pkcs7-certreqresp": {"source":"apache","extensions":["p7r"]},
	"application/x-rar-compressed": {"source":"apache","compressible":false,"extensions":["rar"]},
	"application/x-redhat-package-manager": {"source":"nginx","extensions":["rpm"]},
	"application/x-research-info-systems": {"source":"apache","extensions":["ris"]},
	"application/x-sea": {"source":"nginx","extensions":["sea"]},
	"application/x-sh": {"source":"apache","compressible":true,"extensions":["sh"]},
	"application/x-shar": {"source":"apache","extensions":["shar"]},
	"application/x-shockwave-flash": {"source":"apache","compressible":false,"extensions":["swf"]},
	"application/x-silverlight-app": {"source":"apache","extensions":["xap"]},
	"application/x-sql": {"source":"apache","extensions":["sql"]},
	"application/x-stuffit": {"source":"apache","compressible":false,"extensions":["sit"]},
	"application/x-stuffitx": {"source":"apache","extensions":["sitx"]},
	"application/x-subrip": {"source":"apache","extensions":["srt"]},
	"application/x-sv4cpio": {"source":"apache","extensions":["sv4cpio"]},
	"application/x-sv4crc": {"source":"apache","extensions":["sv4crc"]},
	"application/x-t3vm-image": {"source":"apache","extensions":["t3"]},
	"application/x-tads": {"source":"apache","extensions":["gam"]},
	"application/x-tar": {"source":"apache","compressible":true,"extensions":["tar"]},
	"application/x-tcl": {"source":"apache","extensions":["tcl","tk"]},
	"application/x-tex": {"source":"apache","extensions":["tex"]},
	"application/x-tex-tfm": {"source":"apache","extensions":["tfm"]},
	"application/x-texinfo": {"source":"apache","extensions":["texinfo","texi"]},
	"application/x-tgif": {"source":"apache","extensions":["obj"]},
	"application/x-ustar": {"source":"apache","extensions":["ustar"]},
	"application/x-virtualbox-hdd": {"compressible":true,"extensions":["hdd"]},
	"application/x-virtualbox-ova": {"compressible":true,"extensions":["ova"]},
	"application/x-virtualbox-ovf": {"compressible":true,"extensions":["ovf"]},
	"application/x-virtualbox-vbox": {"compressible":true,"extensions":["vbox"]},
	"application/x-virtualbox-vbox-extpack": {"compressible":false,"extensions":["vbox-extpack"]},
	"application/x-virtualbox-vdi": {"compressible":true,"extensions":["vdi"]},
	"application/x-virtualbox-vhd": {"compressible":true,"extensions":["vhd"]},
	"application/x-virtualbox-vmdk": {"compressible":true,"extensions":["vmdk"]},
	"application/x-wais-source": {"source":"apache","extensions":["src"]},
	"application/x-web-app-manifest+json": {"compressible":true,"extensions":["webapp"]},
	"application/x-www-form-urlencoded": {"source":"iana","compressible":true},
	"application/x-x509-ca-cert": {"source":"apache","extensions":["der","crt","pem"]},
	"application/x-xfig": {"source":"apache","extensions":["fig"]},
	"application/x-xliff+xml": {"source":"apache","extensions":["xlf"]},
	"application/x-xpinstall": {"source":"apache","compressible":false,"extensions":["xpi"]},
	"application/x-xz": {"source":"apache","extensions":["xz"]},
	"application/x-zmachine": {"source":"apache","extensions":["z1","z2","z3","z4","z5","z6","z7","z8"]},
	"application/x400-bp": {"source":"iana"},
	"application/xacml+xml": {"source":"iana"},
	"application/xaml+xml": {"source":"apache","extensions":["xaml"]},
	"application/xcap-att+xml": {"source":"iana"},
	"application/xcap-caps+xml": {"source":"iana"},
	"application/xcap-diff+xml": {"source":"iana","extensions":["xdf"]},
	"application/xcap-el+xml": {"source":"iana"},
	"application/xcap-error+xml": {"source":"iana"},
	"application/xcap-ns+xml": {"source":"iana"},
	"application/xcon-conference-info+xml": {"source":"iana"},
	"application/xcon-conference-info-diff+xml": {"source":"iana"},
	"application/xenc+xml": {"source":"iana","extensions":["xenc"]},
	"application/xhtml+xml": {"source":"iana","compressible":true,"extensions":["xhtml","xht"]},
	"application/xhtml-voice+xml": {"source":"apache"},
	"application/xml": {"source":"iana","compressible":true,"extensions":["xml","xsl","xsd","rng"]},
	"application/xml-dtd": {"source":"iana","compressible":true,"extensions":["dtd"]},
	"application/xml-external-parsed-entity": {"source":"iana"},
	"application/xml-patch+xml": {"source":"iana"},
	"application/xmpp+xml": {"source":"iana"},
	"application/xop+xml": {"source":"iana","compressible":true,"extensions":["xop"]},
	"application/xproc+xml": {"source":"apache","extensions":["xpl"]},
	"application/xslt+xml": {"source":"iana","extensions":["xslt"]},
	"application/xspf+xml": {"source":"apache","extensions":["xspf"]},
	"application/xv+xml": {"source":"iana","extensions":["mxml","xhvml","xvml","xvm"]},
	"application/yang": {"source":"iana","extensions":["yang"]},
	"application/yang-data+json": {"source":"iana","compressible":true},
	"application/yang-data+xml": {"source":"iana"},
	"application/yang-patch+json": {"source":"iana","compressible":true},
	"application/yang-patch+xml": {"source":"iana"},
	"application/yin+xml": {"source":"iana","extensions":["yin"]},
	"application/zip": {"source":"iana","compressible":false,"extensions":["zip"]},
	"application/zlib": {"source":"iana"},
	"audio/1d-interleaved-parityfec": {"source":"iana"},
	"audio/32kadpcm": {"source":"iana"},
	"audio/3gpp": {"source":"iana","compressible":false,"extensions":["3gpp"]},
	"audio/3gpp2": {"source":"iana"},
	"audio/ac3": {"source":"iana"},
	"audio/adpcm": {"source":"apache","extensions":["adp"]},
	"audio/amr": {"source":"iana"},
	"audio/amr-wb": {"source":"iana"},
	"audio/amr-wb+": {"source":"iana"},
	"audio/aptx": {"source":"iana"},
	"audio/asc": {"source":"iana"},
	"audio/atrac-advanced-lossless": {"source":"iana"},
	"audio/atrac-x": {"source":"iana"},
	"audio/atrac3": {"source":"iana"},
	"audio/basic": {"source":"iana","compressible":false,"extensions":["au","snd"]},
	"audio/bv16": {"source":"iana"},
	"audio/bv32": {"source":"iana"},
	"audio/clearmode": {"source":"iana"},
	"audio/cn": {"source":"iana"},
	"audio/dat12": {"source":"iana"},
	"audio/dls": {"source":"iana"},
	"audio/dsr-es201108": {"source":"iana"},
	"audio/dsr-es202050": {"source":"iana"},
	"audio/dsr-es202211": {"source":"iana"},
	"audio/dsr-es202212": {"source":"iana"},
	"audio/dv": {"source":"iana"},
	"audio/dvi4": {"source":"iana"},
	"audio/eac3": {"source":"iana"},
	"audio/encaprtp": {"source":"iana"},
	"audio/evrc": {"source":"iana"},
	"audio/evrc-qcp": {"source":"iana"},
	"audio/evrc0": {"source":"iana"},
	"audio/evrc1": {"source":"iana"},
	"audio/evrcb": {"source":"iana"},
	"audio/evrcb0": {"source":"iana"},
	"audio/evrcb1": {"source":"iana"},
	"audio/evrcnw": {"source":"iana"},
	"audio/evrcnw0": {"source":"iana"},
	"audio/evrcnw1": {"source":"iana"},
	"audio/evrcwb": {"source":"iana"},
	"audio/evrcwb0": {"source":"iana"},
	"audio/evrcwb1": {"source":"iana"},
	"audio/evs": {"source":"iana"},
	"audio/fwdred": {"source":"iana"},
	"audio/g711-0": {"source":"iana"},
	"audio/g719": {"source":"iana"},
	"audio/g722": {"source":"iana"},
	"audio/g7221": {"source":"iana"},
	"audio/g723": {"source":"iana"},
	"audio/g726-16": {"source":"iana"},
	"audio/g726-24": {"source":"iana"},
	"audio/g726-32": {"source":"iana"},
	"audio/g726-40": {"source":"iana"},
	"audio/g728": {"source":"iana"},
	"audio/g729": {"source":"iana"},
	"audio/g7291": {"source":"iana"},
	"audio/g729d": {"source":"iana"},
	"audio/g729e": {"source":"iana"},
	"audio/gsm": {"source":"iana"},
	"audio/gsm-efr": {"source":"iana"},
	"audio/gsm-hr-08": {"source":"iana"},
	"audio/ilbc": {"source":"iana"},
	"audio/ip-mr_v2.5": {"source":"iana"},
	"audio/isac": {"source":"apache"},
	"audio/l16": {"source":"iana"},
	"audio/l20": {"source":"iana"},
	"audio/l24": {"source":"iana","compressible":false},
	"audio/l8": {"source":"iana"},
	"audio/lpc": {"source":"iana"},
	"audio/melp": {"source":"iana"},
	"audio/melp1200": {"source":"iana"},
	"audio/melp2400": {"source":"iana"},
	"audio/melp600": {"source":"iana"},
	"audio/midi": {"source":"apache","extensions":["mid","midi","kar","rmi"]},
	"audio/mobile-xmf": {"source":"iana"},
	"audio/mp3": {"compressible":false,"extensions":["mp3"]},
	"audio/mp4": {"source":"iana","compressible":false,"extensions":["m4a","mp4a"]},
	"audio/mp4a-latm": {"source":"iana"},
	"audio/mpa": {"source":"iana"},
	"audio/mpa-robust": {"source":"iana"},
	"audio/mpeg": {"source":"iana","compressible":false,"extensions":["mpga","mp2","mp2a","mp3","m2a","m3a"]},
	"audio/mpeg4-generic": {"source":"iana"},
	"audio/musepack": {"source":"apache"},
	"audio/ogg": {"source":"iana","compressible":false,"extensions":["oga","ogg","spx"]},
	"audio/opus": {"source":"iana"},
	"audio/parityfec": {"source":"iana"},
	"audio/pcma": {"source":"iana"},
	"audio/pcma-wb": {"source":"iana"},
	"audio/pcmu": {"source":"iana"},
	"audio/pcmu-wb": {"source":"iana"},
	"audio/prs.sid": {"source":"iana"},
	"audio/qcelp": {"source":"iana"},
	"audio/raptorfec": {"source":"iana"},
	"audio/red": {"source":"iana"},
	"audio/rtp-enc-aescm128": {"source":"iana"},
	"audio/rtp-midi": {"source":"iana"},
	"audio/rtploopback": {"source":"iana"},
	"audio/rtx": {"source":"iana"},
	"audio/s3m": {"source":"apache","extensions":["s3m"]},
	"audio/silk": {"source":"apache","extensions":["sil"]},
	"audio/smv": {"source":"iana"},
	"audio/smv-qcp": {"source":"iana"},
	"audio/smv0": {"source":"iana"},
	"audio/sp-midi": {"source":"iana"},
	"audio/speex": {"source":"iana"},
	"audio/t140c": {"source":"iana"},
	"audio/t38": {"source":"iana"},
	"audio/telephone-event": {"source":"iana"},
	"audio/tone": {"source":"iana"},
	"audio/uemclip": {"source":"iana"},
	"audio/ulpfec": {"source":"iana"},
	"audio/vdvi": {"source":"iana"},
	"audio/vmr-wb": {"source":"iana"},
	"audio/vnd.3gpp.iufp": {"source":"iana"},
	"audio/vnd.4sb": {"source":"iana"},
	"audio/vnd.audiokoz": {"source":"iana"},
	"audio/vnd.celp": {"source":"iana"},
	"audio/vnd.cisco.nse": {"source":"iana"},
	"audio/vnd.cmles.radio-events": {"source":"iana"},
	"audio/vnd.cns.anp1": {"source":"iana"},
	"audio/vnd.cns.inf1": {"source":"iana"},
	"audio/vnd.dece.audio": {"source":"iana","extensions":["uva","uvva"]},
	"audio/vnd.digital-winds": {"source":"iana","extensions":["eol"]},
	"audio/vnd.dlna.adts": {"source":"iana"},
	"audio/vnd.dolby.heaac.1": {"source":"iana"},
	"audio/vnd.dolby.heaac.2": {"source":"iana"},
	"audio/vnd.dolby.mlp": {"source":"iana"},
	"audio/vnd.dolby.mps": {"source":"iana"},
	"audio/vnd.dolby.pl2": {"source":"iana"},
	"audio/vnd.dolby.pl2x": {"source":"iana"},
	"audio/vnd.dolby.pl2z": {"source":"iana"},
	"audio/vnd.dolby.pulse.1": {"source":"iana"},
	"audio/vnd.dra": {"source":"iana","extensions":["dra"]},
	"audio/vnd.dts": {"source":"iana","extensions":["dts"]},
	"audio/vnd.dts.hd": {"source":"iana","extensions":["dtshd"]},
	"audio/vnd.dvb.file": {"source":"iana"},
	"audio/vnd.everad.plj": {"source":"iana"},
	"audio/vnd.hns.audio": {"source":"iana"},
	"audio/vnd.lucent.voice": {"source":"iana","extensions":["lvp"]},
	"audio/vnd.ms-playready.media.pya": {"source":"iana","extensions":["pya"]},
	"audio/vnd.nokia.mobile-xmf": {"source":"iana"},
	"audio/vnd.nortel.vbk": {"source":"iana"},
	"audio/vnd.nuera.ecelp4800": {"source":"iana","extensions":["ecelp4800"]},
	"audio/vnd.nuera.ecelp7470": {"source":"iana","extensions":["ecelp7470"]},
	"audio/vnd.nuera.ecelp9600": {"source":"iana","extensions":["ecelp9600"]},
	"audio/vnd.octel.sbc": {"source":"iana"},
	"audio/vnd.presonus.multitrack": {"source":"iana"},
	"audio/vnd.qcelp": {"source":"iana"},
	"audio/vnd.rhetorex.32kadpcm": {"source":"iana"},
	"audio/vnd.rip": {"source":"iana","extensions":["rip"]},
	"audio/vnd.rn-realaudio": {"compressible":false},
	"audio/vnd.sealedmedia.softseal.mpeg": {"source":"iana"},
	"audio/vnd.vmx.cvsd": {"source":"iana"},
	"audio/vnd.wave": {"compressible":false},
	"audio/vorbis": {"source":"iana","compressible":false},
	"audio/vorbis-config": {"source":"iana"},
	"audio/wav": {"compressible":false,"extensions":["wav"]},
	"audio/wave": {"compressible":false,"extensions":["wav"]},
	"audio/webm": {"source":"apache","compressible":false,"extensions":["weba"]},
	"audio/x-aac": {"source":"apache","compressible":false,"extensions":["aac"]},
	"audio/x-aiff": {"source":"apache","extensions":["aif","aiff","aifc"]},
	"audio/x-caf": {"source":"apache","compressible":false,"extensions":["caf"]},
	"audio/x-flac": {"source":"apache","extensions":["flac"]},
	"audio/x-m4a": {"source":"nginx","extensions":["m4a"]},
	"audio/x-matroska": {"source":"apache","extensions":["mka"]},
	"audio/x-mpegurl": {"source":"apache","extensions":["m3u"]},
	"audio/x-ms-wax": {"source":"apache","extensions":["wax"]},
	"audio/x-ms-wma": {"source":"apache","extensions":["wma"]},
	"audio/x-pn-realaudio": {"source":"apache","extensions":["ram","ra"]},
	"audio/x-pn-realaudio-plugin": {"source":"apache","extensions":["rmp"]},
	"audio/x-realaudio": {"source":"nginx","extensions":["ra"]},
	"audio/x-tta": {"source":"apache"},
	"audio/x-wav": {"source":"apache","extensions":["wav"]},
	"audio/xm": {"source":"apache","extensions":["xm"]},
	"chemical/x-cdx": {"source":"apache","extensions":["cdx"]},
	"chemical/x-cif": {"source":"apache","extensions":["cif"]},
	"chemical/x-cmdf": {"source":"apache","extensions":["cmdf"]},
	"chemical/x-cml": {"source":"apache","extensions":["cml"]},
	"chemical/x-csml": {"source":"apache","extensions":["csml"]},
	"chemical/x-pdb": {"source":"apache"},
	"chemical/x-xyz": {"source":"apache","extensions":["xyz"]},
	"font/otf": {"compressible":true,"extensions":["otf"]},
	"image/apng": {"compressible":false,"extensions":["apng"]},
	"image/bmp": {"source":"iana","compressible":true,"extensions":["bmp"]},
	"image/cgm": {"source":"iana","extensions":["cgm"]},
	"image/dicom-rle": {"source":"iana"},
	"image/emf": {"source":"iana"},
	"image/fits": {"source":"iana"},
	"image/g3fax": {"source":"iana","extensions":["g3"]},
	"image/gif": {"source":"iana","compressible":false,"extensions":["gif"]},
	"image/ief": {"source":"iana","extensions":["ief"]},
	"image/jls": {"source":"iana"},
	"image/jp2": {"source":"iana"},
	"image/jpeg": {"source":"iana","compressible":false,"extensions":["jpeg","jpg","jpe"]},
	"image/jpm": {"source":"iana"},
	"image/jpx": {"source":"iana"},
	"image/ktx": {"source":"iana","extensions":["ktx"]},
	"image/naplps": {"source":"iana"},
	"image/pjpeg": {"compressible":false},
	"image/png": {"source":"iana","compressible":false,"extensions":["png"]},
	"image/prs.btif": {"source":"iana","extensions":["btif"]},
	"image/prs.pti": {"source":"iana"},
	"image/pwg-raster": {"source":"iana"},
	"image/sgi": {"source":"apache","extensions":["sgi"]},
	"image/svg+xml": {"source":"iana","compressible":true,"extensions":["svg","svgz"]},
	"image/t38": {"source":"iana"},
	"image/tiff": {"source":"iana","compressible":false,"extensions":["tiff","tif"]},
	"image/tiff-fx": {"source":"iana"},
	"image/vnd.adobe.photoshop": {"source":"iana","compressible":true,"extensions":["psd"]},
	"image/vnd.airzip.accelerator.azv": {"source":"iana"},
	"image/vnd.cns.inf2": {"source":"iana"},
	"image/vnd.dece.graphic": {"source":"iana","extensions":["uvi","uvvi","uvg","uvvg"]},
	"image/vnd.djvu": {"source":"iana","extensions":["djvu","djv"]},
	"image/vnd.dvb.subtitle": {"source":"iana","extensions":["sub"]},
	"image/vnd.dwg": {"source":"iana","extensions":["dwg"]},
	"image/vnd.dxf": {"source":"iana","extensions":["dxf"]},
	"image/vnd.fastbidsheet": {"source":"iana","extensions":["fbs"]},
	"image/vnd.fpx": {"source":"iana","extensions":["fpx"]},
	"image/vnd.fst": {"source":"iana","extensions":["fst"]},
	"image/vnd.fujixerox.edmics-mmr": {"source":"iana","extensions":["mmr"]},
	"image/vnd.fujixerox.edmics-rlc": {"source":"iana","extensions":["rlc"]},
	"image/vnd.globalgraphics.pgb": {"source":"iana"},
	"image/vnd.microsoft.icon": {"source":"iana"},
	"image/vnd.mix": {"source":"iana"},
	"image/vnd.mozilla.apng": {"source":"iana"},
	"image/vnd.ms-modi": {"source":"iana","extensions":["mdi"]},
	"image/vnd.ms-photo": {"source":"apache","extensions":["wdp"]},
	"image/vnd.net-fpx": {"source":"iana","extensions":["npx"]},
	"image/vnd.radiance": {"source":"iana"},
	"image/vnd.sealed.png": {"source":"iana"},
	"image/vnd.sealedmedia.softseal.gif": {"source":"iana"},
	"image/vnd.sealedmedia.softseal.jpg": {"source":"iana"},
	"image/vnd.svf": {"source":"iana"},
	"image/vnd.tencent.tap": {"source":"iana"},
	"image/vnd.valve.source.texture": {"source":"iana"},
	"image/vnd.wap.wbmp": {"source":"iana","extensions":["wbmp"]},
	"image/vnd.xiff": {"source":"iana","extensions":["xif"]},
	"image/vnd.zbrush.pcx": {"source":"iana"},
	"image/webp": {"source":"apache","extensions":["webp"]},
	"image/wmf": {"source":"iana"},
	"image/x-3ds": {"source":"apache","extensions":["3ds"]},
	"image/x-cmu-raster": {"source":"apache","extensions":["ras"]},
	"image/x-cmx": {"source":"apache","extensions":["cmx"]},
	"image/x-freehand": {"source":"apache","extensions":["fh","fhc","fh4","fh5","fh7"]},
	"image/x-icon": {"source":"apache","compressible":true,"extensions":["ico"]},
	"image/x-jng": {"source":"nginx","extensions":["jng"]},
	"image/x-mrsid-image": {"source":"apache","extensions":["sid"]},
	"image/x-ms-bmp": {"source":"nginx","compressible":true,"extensions":["bmp"]},
	"image/x-pcx": {"source":"apache","extensions":["pcx"]},
	"image/x-pict": {"source":"apache","extensions":["pic","pct"]},
	"image/x-portable-anymap": {"source":"apache","extensions":["pnm"]},
	"image/x-portable-bitmap": {"source":"apache","extensions":["pbm"]},
	"image/x-portable-graymap": {"source":"apache","extensions":["pgm"]},
	"image/x-portable-pixmap": {"source":"apache","extensions":["ppm"]},
	"image/x-rgb": {"source":"apache","extensions":["rgb"]},
	"image/x-tga": {"source":"apache","extensions":["tga"]},
	"image/x-xbitmap": {"source":"apache","extensions":["xbm"]},
	"image/x-xcf": {"compressible":false},
	"image/x-xpixmap": {"source":"apache","extensions":["xpm"]},
	"image/x-xwindowdump": {"source":"apache","extensions":["xwd"]},
	"message/cpim": {"source":"iana"},
	"message/delivery-status": {"source":"iana"},
	"message/disposition-notification": {"source":"iana"},
	"message/external-body": {"source":"iana"},
	"message/feedback-report": {"source":"iana"},
	"message/global": {"source":"iana"},
	"message/global-delivery-status": {"source":"iana"},
	"message/global-disposition-notification": {"source":"iana"},
	"message/global-headers": {"source":"iana"},
	"message/http": {"source":"iana","compressible":false},
	"message/imdn+xml": {"source":"iana","compressible":true},
	"message/news": {"source":"iana"},
	"message/partial": {"source":"iana","compressible":false},
	"message/rfc822": {"source":"iana","compressible":true,"extensions":["eml","mime"]},
	"message/s-http": {"source":"iana"},
	"message/sip": {"source":"iana"},
	"message/sipfrag": {"source":"iana"},
	"message/tracking-status": {"source":"iana"},
	"message/vnd.si.simp": {"source":"iana"},
	"message/vnd.wfa.wsc": {"source":"iana"},
	"model/3mf": {"source":"iana"},
	"model/gltf+json": {"source":"iana","compressible":true,"extensions":["gltf"]},
	"model/gltf-binary": {"compressible":true,"extensions":["glb"]},
	"model/iges": {"source":"iana","compressible":false,"extensions":["igs","iges"]},
	"model/mesh": {"source":"iana","compressible":false,"extensions":["msh","mesh","silo"]},
	"model/vnd.collada+xml": {"source":"iana","extensions":["dae"]},
	"model/vnd.dwf": {"source":"iana","extensions":["dwf"]},
	"model/vnd.flatland.3dml": {"source":"iana"},
	"model/vnd.gdl": {"source":"iana","extensions":["gdl"]},
	"model/vnd.gs-gdl": {"source":"apache"},
	"model/vnd.gs.gdl": {"source":"iana"},
	"model/vnd.gtw": {"source":"iana","extensions":["gtw"]},
	"model/vnd.moml+xml": {"source":"iana"},
	"model/vnd.mts": {"source":"iana","extensions":["mts"]},
	"model/vnd.opengex": {"source":"iana"},
	"model/vnd.parasolid.transmit.binary": {"source":"iana"},
	"model/vnd.parasolid.transmit.text": {"source":"iana"},
	"model/vnd.rosette.annotated-data-model": {"source":"iana"},
	"model/vnd.valve.source.compiled-map": {"source":"iana"},
	"model/vnd.vtu": {"source":"iana","extensions":["vtu"]},
	"model/vrml": {"source":"iana","compressible":false,"extensions":["wrl","vrml"]},
	"model/x3d+binary": {"source":"apache","compressible":false,"extensions":["x3db","x3dbz"]},
	"model/x3d+fastinfoset": {"source":"iana"},
	"model/x3d+vrml": {"source":"apache","compressible":false,"extensions":["x3dv","x3dvz"]},
	"model/x3d+xml": {"source":"iana","compressible":true,"extensions":["x3d","x3dz"]},
	"model/x3d-vrml": {"source":"iana"},
	"multipart/alternative": {"source":"iana","compressible":false},
	"multipart/appledouble": {"source":"iana"},
	"multipart/byteranges": {"source":"iana"},
	"multipart/digest": {"source":"iana"},
	"multipart/encrypted": {"source":"iana","compressible":false},
	"multipart/form-data": {"source":"iana","compressible":false},
	"multipart/header-set": {"source":"iana"},
	"multipart/mixed": {"source":"iana","compressible":false},
	"multipart/parallel": {"source":"iana"},
	"multipart/related": {"source":"iana","compressible":false},
	"multipart/report": {"source":"iana"},
	"multipart/signed": {"source":"iana","compressible":false},
	"multipart/vnd.bint.med-plus": {"source":"iana"},
	"multipart/voice-message": {"source":"iana"},
	"multipart/x-mixed-replace": {"source":"iana"},
	"text/1d-interleaved-parityfec": {"source":"iana"},
	"text/cache-manifest": {"source":"iana","compressible":true,"extensions":["appcache","manifest"]},
	"text/calendar": {"source":"iana","extensions":["ics","ifb"]},
	"text/calender": {"compressible":true},
	"text/cmd": {"compressible":true},
	"text/coffeescript": {"extensions":["coffee","litcoffee"]},
	"text/css": {"source":"iana","charset":"UTF-8","compressible":true,"extensions":["css"]},
	"text/csv": {"source":"iana","compressible":true,"extensions":["csv"]},
	"text/csv-schema": {"source":"iana"},
	"text/directory": {"source":"iana"},
	"text/dns": {"source":"iana"},
	"text/ecmascript": {"source":"iana"},
	"text/encaprtp": {"source":"iana"},
	"text/enriched": {"source":"iana"},
	"text/fwdred": {"source":"iana"},
	"text/grammar-ref-list": {"source":"iana"},
	"text/hjson": {"extensions":["hjson"]},
	"text/html": {"source":"iana","compressible":true,"extensions":["html","htm","shtml"]},
	"text/jade": {"extensions":["jade"]},
	"text/javascript": {"source":"iana","compressible":true},
	"text/jcr-cnd": {"source":"iana"},
	"text/jsx": {"compressible":true,"extensions":["jsx"]},
	"text/less": {"extensions":["less"]},
	"text/markdown": {"source":"iana","compressible":true,"extensions":["markdown","md"]},
	"text/mathml": {"source":"nginx","extensions":["mml"]},
	"text/mizar": {"source":"iana"},
	"text/n3": {"source":"iana","compressible":true,"extensions":["n3"]},
	"text/parameters": {"source":"iana"},
	"text/parityfec": {"source":"iana"},
	"text/plain": {"source":"iana","compressible":true,"extensions":["txt","text","conf","def","list","log","in","ini"]},
	"text/provenance-notation": {"source":"iana"},
	"text/prs.fallenstein.rst": {"source":"iana"},
	"text/prs.lines.tag": {"source":"iana","extensions":["dsc"]},
	"text/prs.prop.logic": {"source":"iana"},
	"text/raptorfec": {"source":"iana"},
	"text/red": {"source":"iana"},
	"text/rfc822-headers": {"source":"iana"},
	"text/richtext": {"source":"iana","compressible":true,"extensions":["rtx"]},
	"text/rtf": {"source":"iana","compressible":true,"extensions":["rtf"]},
	"text/rtp-enc-aescm128": {"source":"iana"},
	"text/rtploopback": {"source":"iana"},
	"text/rtx": {"source":"iana"},
	"text/sgml": {"source":"iana","extensions":["sgml","sgm"]},
	"text/slim": {"extensions":["slim","slm"]},
	"text/strings": {"source":"iana"},
	"text/stylus": {"extensions":["stylus","styl"]},
	"text/t140": {"source":"iana"},
	"text/tab-separated-values": {"source":"iana","compressible":true,"extensions":["tsv"]},
	"text/troff": {"source":"iana","extensions":["t","tr","roff","man","me","ms"]},
	"text/turtle": {"source":"iana","extensions":["ttl"]},
	"text/ulpfec": {"source":"iana"},
	"text/uri-list": {"source":"iana","compressible":true,"extensions":["uri","uris","urls"]},
	"text/vcard": {"source":"iana","compressible":true,"extensions":["vcard"]},
	"text/vnd.a": {"source":"iana"},
	"text/vnd.abc": {"source":"iana"},
	"text/vnd.ascii-art": {"source":"iana"},
	"text/vnd.curl": {"source":"iana","extensions":["curl"]},
	"text/vnd.curl.dcurl": {"source":"apache","extensions":["dcurl"]},
	"text/vnd.curl.mcurl": {"source":"apache","extensions":["mcurl"]},
	"text/vnd.curl.scurl": {"source":"apache","extensions":["scurl"]},
	"text/vnd.debian.copyright": {"source":"iana"},
	"text/vnd.dmclientscript": {"source":"iana"},
	"text/vnd.dvb.subtitle": {"source":"iana","extensions":["sub"]},
	"text/vnd.esmertec.theme-descriptor": {"source":"iana"},
	"text/vnd.fly": {"source":"iana","extensions":["fly"]},
	"text/vnd.fmi.flexstor": {"source":"iana","extensions":["flx"]},
	"text/vnd.graphviz": {"source":"iana","extensions":["gv"]},
	"text/vnd.in3d.3dml": {"source":"iana","extensions":["3dml"]},
	"text/vnd.in3d.spot": {"source":"iana","extensions":["spot"]},
	"text/vnd.iptc.newsml": {"source":"iana"},
	"text/vnd.iptc.nitf": {"source":"iana"},
	"text/vnd.latex-z": {"source":"iana"},
	"text/vnd.motorola.reflex": {"source":"iana"},
	"text/vnd.ms-mediapackage": {"source":"iana"},
	"text/vnd.net2phone.commcenter.command": {"source":"iana"},
	"text/vnd.radisys.msml-basic-layout": {"source":"iana"},
	"text/vnd.si.uricatalogue": {"source":"iana"},
	"text/vnd.sun.j2me.app-descriptor": {"source":"iana","extensions":["jad"]},
	"text/vnd.trolltech.linguist": {"source":"iana"},
	"text/vnd.wap.si": {"source":"iana"},
	"text/vnd.wap.sl": {"source":"iana"},
	"text/vnd.wap.wml": {"source":"iana","extensions":["wml"]},
	"text/vnd.wap.wmlscript": {"source":"iana","extensions":["wmls"]},
	"text/vtt": {"charset":"UTF-8","compressible":true,"extensions":["vtt"]},
	"text/x-asm": {"source":"apache","extensions":["s","asm"]},
	"text/x-c": {"source":"apache","extensions":["c","cc","cxx","cpp","h","hh","dic"]},
	"text/x-component": {"source":"nginx","extensions":["htc"]},
	"text/x-fortran": {"source":"apache","extensions":["f","for","f77","f90"]},
	"text/x-gwt-rpc": {"compressible":true},
	"text/x-handlebars-template": {"extensions":["hbs"]},
	"text/x-java-source": {"source":"apache","extensions":["java"]},
	"text/x-jquery-tmpl": {"compressible":true},
	"text/x-lua": {"extensions":["lua"]},
	"text/x-markdown": {"compressible":true,"extensions":["mkd"]},
	"text/x-nfo": {"source":"apache","extensions":["nfo"]},
	"text/x-opml": {"source":"apache","extensions":["opml"]},
	"text/x-org": {"compressible":true,"extensions":["org"]},
	"text/x-pascal": {"source":"apache","extensions":["p","pas"]},
	"text/x-processing": {"compressible":true,"extensions":["pde"]},
	"text/x-sass": {"extensions":["sass"]},
	"text/x-scss": {"extensions":["scss"]},
	"text/x-setext": {"source":"apache","extensions":["etx"]},
	"text/x-sfv": {"source":"apache","extensions":["sfv"]},
	"text/x-suse-ymp": {"compressible":true,"extensions":["ymp"]},
	"text/x-uuencode": {"source":"apache","extensions":["uu"]},
	"text/x-vcalendar": {"source":"apache","extensions":["vcs"]},
	"text/x-vcard": {"source":"apache","extensions":["vcf"]},
	"text/xml": {"source":"iana","compressible":true,"extensions":["xml"]},
	"text/xml-external-parsed-entity": {"source":"iana"},
	"text/yaml": {"extensions":["yaml","yml"]},
	"video/1d-interleaved-parityfec": {"source":"iana"},
	"video/3gpp": {"source":"iana","extensions":["3gp","3gpp"]},
	"video/3gpp-tt": {"source":"iana"},
	"video/3gpp2": {"source":"iana","extensions":["3g2"]},
	"video/bmpeg": {"source":"iana"},
	"video/bt656": {"source":"iana"},
	"video/celb": {"source":"iana"},
	"video/dv": {"source":"iana"},
	"video/encaprtp": {"source":"iana"},
	"video/h261": {"source":"iana","extensions":["h261"]},
	"video/h263": {"source":"iana","extensions":["h263"]},
	"video/h263-1998": {"source":"iana"},
	"video/h263-2000": {"source":"iana"},
	"video/h264": {"source":"iana","extensions":["h264"]},
	"video/h264-rcdo": {"source":"iana"},
	"video/h264-svc": {"source":"iana"},
	"video/h265": {"source":"iana"},
	"video/iso.segment": {"source":"iana"},
	"video/jpeg": {"source":"iana","extensions":["jpgv"]},
	"video/jpeg2000": {"source":"iana"},
	"video/jpm": {"source":"apache","extensions":["jpm","jpgm"]},
	"video/mj2": {"source":"iana","extensions":["mj2","mjp2"]},
	"video/mp1s": {"source":"iana"},
	"video/mp2p": {"source":"iana"},
	"video/mp2t": {"source":"iana","extensions":["ts"]},
	"video/mp4": {"source":"iana","compressible":false,"extensions":["mp4","mp4v","mpg4"]},
	"video/mp4v-es": {"source":"iana"},
	"video/mpeg": {"source":"iana","compressible":false,"extensions":["mpeg","mpg","mpe","m1v","m2v"]},
	"video/mpeg4-generic": {"source":"iana"},
	"video/mpv": {"source":"iana"},
	"video/nv": {"source":"iana"},
	"video/ogg": {"source":"iana","compressible":false,"extensions":["ogv"]},
	"video/parityfec": {"source":"iana"},
	"video/pointer": {"source":"iana"},
	"video/quicktime": {"source":"iana","compressible":false,"extensions":["qt","mov"]},
	"video/raptorfec": {"source":"iana"},
	"video/raw": {"source":"iana"},
	"video/rtp-enc-aescm128": {"source":"iana"},
	"video/rtploopback": {"source":"iana"},
	"video/rtx": {"source":"iana"},
	"video/smpte292m": {"source":"iana"},
	"video/ulpfec": {"source":"iana"},
	"video/vc1": {"source":"iana"},
	"video/vnd.cctv": {"source":"iana"},
	"video/vnd.dece.hd": {"source":"iana","extensions":["uvh","uvvh"]},
	"video/vnd.dece.mobile": {"source":"iana","extensions":["uvm","uvvm"]},
	"video/vnd.dece.mp4": {"source":"iana"},
	"video/vnd.dece.pd": {"source":"iana","extensions":["uvp","uvvp"]},
	"video/vnd.dece.sd": {"source":"iana","extensions":["uvs","uvvs"]},
	"video/vnd.dece.video": {"source":"iana","extensions":["uvv","uvvv"]},
	"video/vnd.directv.mpeg": {"source":"iana"},
	"video/vnd.directv.mpeg-tts": {"source":"iana"},
	"video/vnd.dlna.mpeg-tts": {"source":"iana"},
	"video/vnd.dvb.file": {"source":"iana","extensions":["dvb"]},
	"video/vnd.fvt": {"source":"iana","extensions":["fvt"]},
	"video/vnd.hns.video": {"source":"iana"},
	"video/vnd.iptvforum.1dparityfec-1010": {"source":"iana"},
	"video/vnd.iptvforum.1dparityfec-2005": {"source":"iana"},
	"video/vnd.iptvforum.2dparityfec-1010": {"source":"iana"},
	"video/vnd.iptvforum.2dparityfec-2005": {"source":"iana"},
	"video/vnd.iptvforum.ttsavc": {"source":"iana"},
	"video/vnd.iptvforum.ttsmpeg2": {"source":"iana"},
	"video/vnd.motorola.video": {"source":"iana"},
	"video/vnd.motorola.videop": {"source":"iana"},
	"video/vnd.mpegurl": {"source":"iana","extensions":["mxu","m4u"]},
	"video/vnd.ms-playready.media.pyv": {"source":"iana","extensions":["pyv"]},
	"video/vnd.nokia.interleaved-multimedia": {"source":"iana"},
	"video/vnd.nokia.videovoip": {"source":"iana"},
	"video/vnd.objectvideo": {"source":"iana"},
	"video/vnd.radgamettools.bink": {"source":"iana"},
	"video/vnd.radgamettools.smacker": {"source":"iana"},
	"video/vnd.sealed.mpeg1": {"source":"iana"},
	"video/vnd.sealed.mpeg4": {"source":"iana"},
	"video/vnd.sealed.swf": {"source":"iana"},
	"video/vnd.sealedmedia.softseal.mov": {"source":"iana"},
	"video/vnd.uvvu.mp4": {"source":"iana","extensions":["uvu","uvvu"]},
	"video/vnd.vivo": {"source":"iana","extensions":["viv"]},
	"video/vp8": {"source":"iana"},
	"video/webm": {"source":"apache","compressible":false,"extensions":["webm"]},
	"video/x-f4v": {"source":"apache","extensions":["f4v"]},
	"video/x-fli": {"source":"apache","extensions":["fli"]},
	"video/x-flv": {"source":"apache","compressible":false,"extensions":["flv"]},
	"video/x-m4v": {"source":"apache","extensions":["m4v"]},
	"video/x-matroska": {"source":"apache","compressible":false,"extensions":["mkv","mk3d","mks"]},
	"video/x-mng": {"source":"apache","extensions":["mng"]},
	"video/x-ms-asf": {"source":"apache","extensions":["asf","asx"]},
	"video/x-ms-vob": {"source":"apache","extensions":["vob"]},
	"video/x-ms-wm": {"source":"apache","extensions":["wm"]},
	"video/x-ms-wmv": {"source":"apache","compressible":false,"extensions":["wmv"]},
	"video/x-ms-wmx": {"source":"apache","extensions":["wmx"]},
	"video/x-ms-wvx": {"source":"apache","extensions":["wvx"]},
	"video/x-msvideo": {"source":"apache","extensions":["avi"]},
	"video/x-sgi-movie": {"source":"apache","extensions":["movie"]},
	"video/x-smv": {"source":"apache","extensions":["smv"]},
	"x-conference/x-cooltalk": {"source":"apache","extensions":["ice"]},
	"x-shader/x-fragment": {"compressible":true},
	"x-shader/x-vertex": {"compressible":true}
};

var db$1 = Object.freeze({
	default: db
});

var require$$0$1 = ( db$1 && db ) || db$1;

/*!
 * mime-db
 * Copyright(c) 2014 Jonathan Ong
 * MIT Licensed
 */

/**
 * Module exports.
 */

var mimeDb = require$$0$1;

var mimeTypes = createCommonjsModule(function (module, exports) {
/*!
 * mime-types
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */


var extname = path.extname;

/**
 * Module variables.
 * @private
 */

var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
var TEXT_TYPE_REGEXP = /^text\//i;

/**
 * Module exports.
 * @public
 */

exports.charset = charset;
exports.charsets = { lookup: charset };
exports.contentType = contentType;
exports.extension = extension;
exports.extensions = Object.create(null);
exports.lookup = lookup;
exports.types = Object.create(null);

// Populate the extensions/types maps
populateMaps(exports.extensions, exports.types);

/**
 * Get the default charset for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */

function charset (type) {
  if (!type || typeof type !== 'string') {
    return false
  }

  // TODO: use media-typer
  var match = EXTRACT_TYPE_REGEXP.exec(type);
  var mime = match && mimeDb[match[1].toLowerCase()];

  if (mime && mime.charset) {
    return mime.charset
  }

  // default text/* to utf-8
  if (match && TEXT_TYPE_REGEXP.test(match[1])) {
    return 'UTF-8'
  }

  return false
}

/**
 * Create a full Content-Type header given a MIME type or extension.
 *
 * @param {string} str
 * @return {boolean|string}
 */

function contentType (str) {
  // TODO: should this even be in this module?
  if (!str || typeof str !== 'string') {
    return false
  }

  var mime = str.indexOf('/') === -1
    ? exports.lookup(str)
    : str;

  if (!mime) {
    return false
  }

  // TODO: use content-type or other module
  if (mime.indexOf('charset') === -1) {
    var charset = exports.charset(mime);
    if (charset) mime += '; charset=' + charset.toLowerCase();
  }

  return mime
}

/**
 * Get the default extension for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */

function extension (type) {
  if (!type || typeof type !== 'string') {
    return false
  }

  // TODO: use media-typer
  var match = EXTRACT_TYPE_REGEXP.exec(type);

  // get extensions
  var exts = match && exports.extensions[match[1].toLowerCase()];

  if (!exts || !exts.length) {
    return false
  }

  return exts[0]
}

/**
 * Lookup the MIME type for a file path/extension.
 *
 * @param {string} path
 * @return {boolean|string}
 */

function lookup (path$$1) {
  if (!path$$1 || typeof path$$1 !== 'string') {
    return false
  }

  // get the extension ("ext" or ".ext" or full path)
  var extension = extname('x.' + path$$1)
    .toLowerCase()
    .substr(1);

  if (!extension) {
    return false
  }

  return exports.types[extension] || false
}

/**
 * Populate the extensions and types maps.
 * @private
 */

function populateMaps (extensions, types) {
  // source preference (least -> most)
  var preference = ['nginx', 'apache', undefined, 'iana'];

  Object.keys(mimeDb).forEach(function forEachMimeType (type) {
    var mime = mimeDb[type];
    var exts = mime.extensions;

    if (!exts || !exts.length) {
      return
    }

    // mime -> extensions
    extensions[type] = exts;

    // extension -> mime
    for (var i = 0; i < exts.length; i++) {
      var extension = exts[i];

      if (types[extension]) {
        var from = preference.indexOf(mimeDb[types[extension]].source);
        var to = preference.indexOf(mime.source);

        if (types[extension] !== 'application/octet-stream' &&
          (from > to || (from === to && types[extension].substr(0, 12) === 'application/'))) {
          // skip the remapping
          continue
        }
      }

      // set the extension -> mime
      types[extension] = type;
    }
  });
}
});

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

var Upyun = function () {
  /**
   * @param {object} service - a instance of Service class
   * @param {object} params - optional params
   * @param {callback} getHeaderSign - callback function to get header sign
   */
  function Upyun(service) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var getHeaderSign$$1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    classCallCheck(this, Upyun);

    if (typeof service.serviceName === 'undefined') {
      throw new Error('upyun - must config serviceName');
    }

    if (typeof params === 'function') {
      getHeaderSign$$1 = params;
      params = {};
    }

    if (typeof getHeaderSign$$1 !== 'function' && isBrowser) {
      throw new Error('upyun - must config a callback function getHeaderSign in client side');
    }

    if (!isBrowser && (typeof service.operatorName === 'undefined' || typeof service.password === 'undefined')) {
      throw new Error('upyun - must config operateName and password in server side');
    }

    var config = Object.assign({
      domain: 'v0.api.upyun.com',
      protocol: 'https'
    }, params);
    this.endpoint = config.protocol + '://' + config.domain;

    this.req = createReq(this.endpoint, service, getHeaderSign$$1 || defaultGetHeaderSign);
    // NOTE this will be removed
    this.bucket = service;
    this.service = service;
    if (!isBrowser) {
      this.setBodySignCallback(sign.getPolicyAndAuthorization);
    }
  }

  createClass(Upyun, [{
    key: 'setService',
    value: function setService(service) {
      this.service = service;
      this.req.defaults.baseURL = this.endpoint + '/' + service.serviceName;
    }

    // NOTE this will be removed

  }, {
    key: 'setBucket',
    value: function setBucket(bucket) {
      return this.setService(bucket);
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
    value: function usage() {
      var path$$1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';

      return this.req.get(path$$1 + '?usage').then(function (_ref) {
        var data = _ref.data;

        return Promise.resolve(data);
      });
    }
  }, {
    key: 'listDir',
    value: function listDir() {
      var path$$1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';

      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$limit = _ref2.limit,
          limit = _ref2$limit === undefined ? 100 : _ref2$limit,
          _ref2$order = _ref2.order,
          order = _ref2$order === undefined ? 'asc' : _ref2$order,
          _ref2$iter = _ref2.iter,
          iter = _ref2$iter === undefined ? '' : _ref2$iter;

      var requestHeaders = {};

      // NOTE: 默认值可以省去请求头设置，避免跨域影响
      if (limit !== 100) {
        requestHeaders['x-list-limit'] = limit;
      }

      if (order !== 'asc') {
        requestHeaders['x-list-order'] = order;
      }

      if (iter) {
        requestHeaders['x-list-iter'] = iter;
      }

      return this.req.get(path$$1, {
        headers: requestHeaders
      }).then(function (_ref3) {
        var data = _ref3.data,
            headers = _ref3.headers,
            status = _ref3.status;

        if (status === 404) {
          return false;
        }

        var next = headers['x-upyun-list-iter'];
        if (!data) {
          return Promise.resolve({
            files: [],
            next: next
          });
        }

        var items = data.split('\n');
        var files = items.map(function (item) {
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

        return Promise.resolve({
          files: files,
          next: next
        });
      });
    }

    /**
     * @param localFile: file content, available type is Stream | String | Buffer for server; File | String for client
     * @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send
     * @see https://github.com/mzabriskie/axios/blob/master/lib/adapters/http.js#L32
     */

  }, {
    key: 'putFile',
    value: function putFile(remotePath, localFile) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      // optional params
      var keys = ['Content-MD5', 'Content-Length', 'Content-Type', 'Content-Secret', 'x-gmkerl-thumb'];
      var headers = {};
      keys.forEach(function (key) {
        var lower = key.toLowerCase();
        var finded = options[key] || options[lower];
        if (finded) {
          headers[key] = finded;
        } else if (isMeta(key)) {
          headers[key] = options[key];
        }
      });

      if (!headers['content-type']) {
        var defaultType = 'application/octet-stream';
        headers['content-type'] = mimeTypes.lookup(remotePath) || defaultType;
      }

      return this.req.put(remotePath, localFile, {
        headers: headers
      }).then(function (_ref4) {
        var responseHeaders = _ref4.headers,
            status = _ref4.status;

        if (status !== 200) {
          return Promise.resolve(false);
        }

        var params = ['x-upyun-width', 'x-upyun-height', 'x-upyun-file-type', 'x-upyun-frames'];
        var result = {};
        params.forEach(function (item) {
          var key = item.split('x-upyun-')[1];
          if (responseHeaders[item]) {
            result[key] = responseHeaders[item];
            if (key !== 'file-type') {
              result[key] = parseInt(result[key], 10);
            }
          }
        });
        return Promise.resolve(Object.keys(result).length > 0 ? result : true);
      });
    }
  }, {
    key: 'makeDir',
    value: function makeDir(remotePath) {
      return this.req.post(remotePath, null, {
        headers: { folder: 'true' }
      }).then(function (_ref5) {
        var status = _ref5.status;

        return Promise.resolve(status === 200);
      });
    }
  }, {
    key: 'headFile',
    value: function headFile(remotePath) {
      return this.req.head(remotePath).then(function (_ref6) {
        var headers = _ref6.headers,
            status = _ref6.status;

        if (status === 404) {
          return Promise.resolve(false);
        }

        var params = ['x-upyun-file-type', 'x-upyun-file-size', 'x-upyun-file-date', 'Content-Md5'];
        var result = {};
        params.forEach(function (item) {
          var key = item.split('x-upyun-file-')[1];
          if (headers[item]) {
            result[key] = headers[item];
            if (key === 'size' || key === 'date') {
              result[key] = parseInt(result[key], 10);
            }
          }
        });
        return Promise.resolve(result);
      });
    }
  }, {
    key: 'deleteFile',
    value: function deleteFile(remotePath) {
      var isAsync = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var headers = {};
      if (isAsync) {
        headers['x-upyun-async'] = true;
      }
      return this.req.delete(remotePath, {
        headers: headers
      }).then(function (_ref7) {
        var status = _ref7.status;

        return Promise.resolve(status === 200);
      });
    }
  }, {
    key: 'deleteDir',
    value: function deleteDir() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return this.deleteFile.apply(this, args);
    }
  }, {
    key: 'getFile',
    value: function getFile(remotePath) {
      var saveStream = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (saveStream && isBrowser) {
        throw new Error('upyun - save as stream are only available on the server side.');
      }

      return this.req({
        method: 'GET',
        url: remotePath,
        responseType: saveStream ? 'stream' : null
      }).then(function (response) {
        if (response.status === 404) {
          return Promise.resolve(false);
        }

        if (!saveStream) {
          return Promise.resolve(response.data);
        }

        var stream = response.data.pipe(saveStream);

        return new Promise(function (resolve, reject) {
          stream.on('finish', function () {
            return resolve(stream);
          });

          stream.on('error', reject);
        });
      });
    }
  }, {
    key: 'updateMetadata',
    value: function updateMetadata(remotePath, metas) {
      var operate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'merge';

      var metaHeaders = {};
      for (var key in metas) {
        if (!isMeta(key)) {
          metaHeaders['x-upyun-meta-' + key] = metas[key];
        } else {
          metaHeaders[key] = metas;
        }
      }

      return this.req.patch(remotePath + '?metadata=' + operate, null, { headers: metaHeaders }).then(function (_ref8) {
        var status = _ref8.status;

        return Promise.resolve(status === 200);
      });
    }

    // be careful: this will download the entire file

  }, {
    key: 'getMetadata',
    value: function getMetadata(remotePath) {
      return this.req.get(remotePath).then(function (_ref9) {
        var headers = _ref9.headers,
            status = _ref9.status;

        if (status !== 200) {
          return Promise.resolve(false);
        }

        var result = {};
        for (var key in headers) {
          if (isMeta(key)) {
            result[key] = headers[key];
          }
        }

        return Promise.resolve(result);
      });
    }

    /**
     * in browser: type of fileOrPath is File
     * in server: type of fileOrPath is string: local file path
     */

  }, {
    key: 'blockUpload',
    value: function blockUpload(remotePath, fileOrPath) {
      var _this = this;

      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var fileSizePromise = void 0;
      var contentType$$1 = void 0;
      if (isBrowser) {
        fileSizePromise = Promise.resolve(fileOrPath.size);
        contentType$$1 = fileOrPath.type;
      } else {
        fileSizePromise = utils.getFileSizeAsync(fileOrPath);
        contentType$$1 = utils.getContentType(fileOrPath);
      }

      return fileSizePromise.then(function (fileSize) {
        Object.assign(options, {
          'x-upyun-multi-stage': 'initiate',
          'x-upyun-multi-length': fileSize,
          'x-upyun-multi-type': contentType$$1
        });

        var blockSize = 1024 * 1024;
        var blocks = Math.ceil(fileSize / blockSize);

        return _this.req.put(remotePath, null, {
          headers: options
        }).then(function (_ref10) {
          var headers = _ref10.headers;

          var uuid = headers['x-upyun-multi-uuid'];
          var nextId = headers['x-upyun-next-part-id'];

          var p = Promise.resolve(nextId);
          for (var index = 0; index < blocks; index++) {
            p = p.then(function (nextId) {
              var start = nextId * blockSize;
              var end = Math.min(start + blockSize, fileSize);
              var blockPromise = utils.readBlockAsync(fileOrPath, start, end);
              return blockPromise.then(function (block) {
                return _this.req.put(remotePath, block, {
                  headers: {
                    'x-upyun-multi-stage': 'upload',
                    'x-upyun-multi-uuid': uuid,
                    'x-upyun-part-id': nextId
                  }
                }).then(function (_ref11) {
                  var headers = _ref11.headers;

                  nextId = headers['x-upyun-next-part-id'];
                  return Promise.resolve(nextId);
                });
              });
            });
          }

          return p.then(function () {
            return _this.req.put(remotePath, null, {
              headers: {
                'x-upyun-multi-stage': 'complete',
                'x-upyun-multi-uuid': uuid
              }
            }).then(function (_ref12) {
              var status = _ref12.status;

              return Promise.resolve(status === 204 || status === 201);
            });
          });
        });
      });
    }
  }, {
    key: 'formPutFile',
    value: function formPutFile(remotePath, localFile) {
      var _this2 = this;

      var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      if (typeof this.bodySignCallback !== 'function') {
        throw new Error('upyun - must setBodySignCallback first!');
      }

      params['service'] = this.service.serviceName;
      params['save-key'] = remotePath;
      var result = this.bodySignCallback(this.service, params);
      if (typeof result.then !== 'function') {
        result = Promise.resolve(result);
      }

      return result.then(function (bodySign) {
        return formUpload(_this2.endpoint + '/' + params['service'], localFile, bodySign).then(function (result) {
          return Promise.resolve(result);
        });
      });
    }
  }, {
    key: 'purge',
    value: function purge(urls) {
      if (typeof urls === 'string') {
        urls = [urls];
      }
      var headers = sign.getPurgeHeaderSign(this.service, urls);
      return axios.post('http://purge.upyun.com/purge/', 'purge=' + urls.join('\n'), {
        headers: headers
      }).then(function (_ref13) {
        var data = _ref13.data;

        if (Object.keys(data.invalid_domain_of_url).length === 0) {
          return true;
        } else {
          throw new Error('some url purge failed ' + data.invalid_domain_of_url.join(' '));
        }
      }, function (err) {
        throw new Error('upyun - request failed: ' + err.message);
      });
    }
  }]);
  return Upyun;
}();

function isMeta(key) {
  return key.indexOf('x-upyun-meta-') === 0;
}

function defaultGetHeaderSign(service, method, path$$1) {
  var headers = sign.getHeaderSign(service, method, path$$1);
  return Promise.resolve(headers);
}

var Service = function Service(serviceName) {
  var operatorName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var password = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  classCallCheck(this, Service);

  // NOTE bucketName will be removed
  this.bucketName = serviceName;
  this.serviceName = this.bucketName;
  this.operatorName = operatorName;
  this.password = md5(password);
};

var index = {
  Client: Upyun,
  sign: sign,
  Bucket: Service,
  Service: Service
};

return index;

})));
