/**
 * vue-webview-js-bridge v0.0.8
 * (c) 2019 Kntt
 * @license MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.VueWebviewJsBridge = factory());
}(this, (function () { 'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
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

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  /**
   * 获取数据类型
   * @param {*} o
   * @returns {string}
   */
  var type = function type(o) {
    var types = {
      '[object Array]': 'array',
      '[object Date]': 'date',
      '[object RegExp]': 'regexp',
      '[object Object]': 'object',
      '[object Error]': 'error'
    };

    if (o == null) {
      return String(o);
    }
    return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' ? types[Object.prototype.toString.call(o)] || 'object' : typeof o === 'undefined' ? 'undefined' : _typeof(o);
  };

  /**
   * 获取设备信息
   */
  var getDeviceInfo = function getDeviceInfo() {
    var device = {};
    var ua = navigator.userAgent;

    var windows = ua.match(/(Windows Phone);?[\s\/]+([\d.]+)?/);
    var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
    var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
    var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
    var iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);

    device.ios = device.android = device.windows = device.iphone = device.ipod = device.ipad = device.androidChrome = false;

    // Windows
    if (windows) {
      device.os = 'windows';
      device.osVersion = windows[2];
      device.windows = true;
    }
    // Android
    if (android && !windows) {
      device.os = 'android';
      device.osVersion = android[2];
      device.android = true;
      device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
    }
    if (ipad || iphone || ipod) {
      device.os = 'ios';
      device.ios = true;
    }
    // iOS
    if (iphone && !ipod) {
      device.osVersion = iphone[2].replace(/_/g, '.');
      device.iphone = true;
    }
    if (ipad) {
      device.osVersion = ipad[2].replace(/_/g, '.');
      device.ipad = true;
    }
    if (ipod) {
      device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
      device.iphone = true;
    }
    // iOS 8+ changed UA
    if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
      if (device.osVersion.split('.')[0] === '10') {
        device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
      }
    }
    device.iphonex = device.ios && screen.height === 812 && screen.width === 375;
    // Webview
    device.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i);

    return device;
  };

  /**
   * VueJsBridgePlugin
   * @author Kntt 20190216
   */

  var MockBridge = function () {
    function MockBridge(mockHandler) {
      classCallCheck(this, MockBridge);

      if (Object.prototype.toString.call(mockHandler) !== '[object Function]') {
        throw new Error('mockHandler ' + type(mockHandler) + ' is not a function');
      }
      this.mockHandler = mockHandler;
    }

    createClass(MockBridge, [{
      key: 'registerHandler',
      value: function registerHandler(name, fn) {}
    }, {
      key: 'callHandler',
      value: function callHandler(nativeHandler, payload, callback) {
        this.mockHandler(payload, callback);
      }
    }]);
    return MockBridge;
  }();

  /**
   * VueJsBridgePlugin
   * @author Kntt 20190216
   */
  var deviceInfo = getDeviceInfo();

  var VueJsBridgePlugin = function () {
    function VueJsBridgePlugin() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      classCallCheck(this, VueJsBridgePlugin);

      this.options = options;
    }
    /**
     * 初始化核心bridge插件
     * @param {function} callback
     * callback 回传 bridge插件实例
     */


    createClass(VueJsBridgePlugin, [{
      key: 'init',
      value: function init(callback) {
        var _options = this.options,
            debug = _options.debug,
            mock = _options.mock,
            mockHandler = _options.mockHandler;
        // 如果mock & mockHandler 同时存在，注册MockBridge，方便开发

        if (mock && mockHandler) {
          debug && console.log('[VueJsBridge] work in mock mode...');
          var bridge = new MockBridge(mockHandler);
          return callback(bridge);
        }
        if (deviceInfo.android) {
          // 以下为[JsBridge](https://github.com/lzyzsd/JsBridge)源码 -- android
          if (window.WebViewJavascriptBridge) {
            callback(window.WebViewJavascriptBridge);
          } else {
            document.addEventListener('WebViewJavascriptBridgeReady', function () {
              callback(window.WebViewJavascriptBridge);
            }, false);
          }
        } else {
          // 以下为[WebViewJavascriptBridge](https://github.com/marcuswestin/WebViewJavascriptBridge)源码 -- ios
          if (window.WebViewJavascriptBridge) {
            return callback(window.WebViewJavascriptBridge);
          }
          if (window.WVJBCallbacks) {
            return window.WVJBCallbacks.push(callback);
          }
          window.WVJBCallbacks = [callback];
          var WVJBIframe = document.createElement('iframe');
          WVJBIframe.style.display = 'none';
          WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
          document.documentElement.appendChild(WVJBIframe);
          setTimeout(function () {
            document.documentElement.removeChild(WVJBIframe);
          }, 0);
        }
      }
      /**
       * 注册提供native调用的方法
       * @param {string} name 方法名称
       * @param {function} fn 回调方法， 两个参数 data, callback
       * 第一个参数是native传递的数据 data
       * 第二个参数是native提供的回调函数 callback，前端处理完成后可以通过 callback通知native
       */

    }, {
      key: 'registerHandler',
      value: function registerHandler(name, fn) {
        var _this = this;

        var delay = this.options.delay;
        // birdge初始化需要时间，延迟处理注册方法

        setTimeout(function () {
          _this.init(function (bridge) {
            bridge.registerHandler(name, fn);
          });
        }, delay);
      }
      /**
       * 前端调用native的方法
       * @param {any} payload
       * payload 参数通过和native协商定义
       * @example
       * {
       *    type: 'nativeMethodType',
       *    data: 'data from front'
       * }
       */

    }, {
      key: 'callHandler',
      value: function callHandler(payload) {
        var _options2 = this.options,
            debug = _options2.debug,
            nativeHandlerName = _options2.nativeHandlerName;

        var _resolve = void 0;
        var _reject = void 0;
        // 生成promise对象，保留resolve，reject
        var readyPromise = new Promise(function (resolve, reject) {
          _resolve = resolve;
          _reject = reject;
        });
        debug && console.info('[VueJsBridge] Start calling NativeHandler with payload:', payload);
        this.init(function (bridge) {
          try {
            bridge.callHandler(nativeHandlerName, payload, function (response) {
              debug && console.info('[VueJsBridge] Success response:', response);
              // 调用成功，使用保留的resolve改变返回的promise状态
              _resolve(response);
            });
          } catch (e) {
            debug && console.info('[VueJsBridge] Failed error:', e);
            // 调用成功，使用保留的reject改变返回的promise状态
            _reject(e);
          }
        });
        return readyPromise;
      }
    }]);
    return VueJsBridgePlugin;
  }();

  var defaultOptions = {
    debug: true,
    schemaName: 'yy',
    delay: 200,
    nativeHandlerName: 'nativeHandler',
    mock: true,
    mockHandler: null
  };

  var index = {
    install: function install(Vue, options) {
      var initConfig = _extends({}, defaultOptions, options);
      Object.defineProperty(Vue.prototype, '$bridge', { value: new VueJsBridgePlugin(initConfig) });
    },

    version: '0.0.8'
  };

  return index;

})));
