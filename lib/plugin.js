/**
 * VueJsBridgePlugin
 * @author Kntt 20190216
 */
import MockBridge from './mock'

export default class VueJsBridgePlugin {
  options = null
  constructor (options) {
    this.options = options
  }
  init (callback) {
    const { debug, mock, mockHandler } = this.options
    if (mock && mockHandler) {
      debug && console.log(`[VueJsBridge] work in mock mode...`)
      const bridge = new MockBridge(mockHandler)
      return callback(bridge)
    }
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
  registerHandler (name, fn) {
    this.init(function (bridge) {
      bridge.registerHandler(name, fn)
    })
  }
  callHandler (payload) {
    const { debug, nativeHandlerName } = this.options
    let _resolve
    let _reject
    const readyPromise = new Promise((resolve, reject) => {
      _resolve = resolve
      _reject = reject
    })
    debug && console.info(`[VueJsBridge] Start calling NativeHandler with payload:`, payload)
    this.init(function (bridge) {
      try {
        bridge.callHandler(nativeHandlerName, payload, (response) => {
          debug && console.info(`[VueJsBridge] Success response:`, response)
          _resolve(response)
        })
      } catch (e) {
        debug && console.info(`[VueJsBridge] Failed error:`, e)
        _reject(e)
      }
    })
    return readyPromise
  }
}
