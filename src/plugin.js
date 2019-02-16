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
    const { mock, mockHandler } = this.options
    if (mock && mockHandler) {
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
    const { nativeHandlerName } = this.options
    let _resolve
    let _reject
    const readyPromise = new Promise((resolve, reject) => {
      _resolve = resolve
      _reject = reject
    })
    this.init(function (bridge) {
      try {
        bridge.callHandler(nativeHandlerName, payload, (param) => {
          _resolve(param)
        })
      } catch (e) {
        _reject(e)
      }
    })
    return readyPromise
  }
}
