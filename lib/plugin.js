/**
 * VueJsBridgePlugin
 * @author Kntt 20190216
 */
import MockBridge from './mock'
import { getDeviceInfo } from './utils'
const deviceInfo = getDeviceInfo()
export default class VueJsBridgePlugin {
  constructor (options = {}) {
    this.options = options
  }
  /**
   * 初始化核心bridge插件
   * @param {function} callback
   * callback 回传 bridge插件实例
   */
  init (callback) {
    const { debug, mock, mockHandler } = this.options
    // 如果mock & mockHandler 同时存在，注册MockBridge，方便开发
    if (mock && mockHandler) {
      debug && console.log(`[VueJsBridge] work in mock mode...`)
      const bridge = new MockBridge(mockHandler)
      return callback(bridge)
    }
    if (deviceInfo.android) {
      // 以下为[JsBridge](https://github.com/lzyzsd/JsBridge)源码 -- android
      if (window.WebViewJavascriptBridge) {
        callback(window.WebViewJavascriptBridge)
      } else {
        document.addEventListener('WebViewJavascriptBridgeReady', function () {
          callback(window.WebViewJavascriptBridge)
        }, false)
      }
    } else {
      // 以下为[WebViewJavascriptBridge](https://github.com/marcuswestin/WebViewJavascriptBridge)源码 -- ios
      if (window.WebViewJavascriptBridge) {
        return callback(window.WebViewJavascriptBridge)
      }
      if (window.WVJBCallbacks) {
        return window.WVJBCallbacks.push(callback)
      }
      window.WVJBCallbacks = [callback]
      var WVJBIframe = document.createElement('iframe')
      WVJBIframe.style.display = 'none'
      WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__'
      document.documentElement.appendChild(WVJBIframe)
      setTimeout(function () {
        document.documentElement.removeChild(WVJBIframe)
      }, 0)
    }
  }
  /**
   * 注册提供native调用的方法
   * @param {string} name 方法名称
   * @param {function} fn 回调方法， 两个参数 data, callback
   * 第一个参数是native传递的数据 data
   * 第二个参数是native提供的回调函数 callback，前端处理完成后可以通过 callback通知native
   */
  registerHandler (name, fn) {
    const { delay } = this.options
    // birdge初始化需要时间，延迟处理注册方法
    setTimeout(() => {
      this.init(function (bridge) {
        bridge.registerHandler(name, fn)
      })
    }, delay)
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
  callHandler (payload) {
    const { debug, nativeHandlerName } = this.options
    let _resolve
    let _reject
    // 生成promise对象，保留resolve，reject
    const readyPromise = new Promise((resolve, reject) => {
      _resolve = resolve
      _reject = reject
    })
    debug && console.info(`[VueJsBridge] Start calling NativeHandler with payload:`, payload)
    this.init(function (bridge) {
      try {
        bridge.callHandler(nativeHandlerName, payload, (response) => {
          debug && console.info(`[VueJsBridge] Success response:`, response)
          // 调用成功，使用保留的resolve改变返回的promise状态
          _resolve(response)
        })
      } catch (e) {
        debug && console.info(`[VueJsBridge] Failed error:`, e)
        // 调用成功，使用保留的reject改变返回的promise状态
        _reject(e)
      }
    })
    return readyPromise
  }
}
