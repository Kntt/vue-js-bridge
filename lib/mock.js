/**
 * VueJsBridgePlugin
 * @author Kntt 20190216
 */

import { type } from './utils'

export default class MockBridge {
  constructor (mockHandler) {
    if (Object.prototype.toString.call(mockHandler) !== '[object Function]') {
      throw new Error(`mockHandler ${type(mockHandler)} is not a function`)
    }
    this.mockHandler = mockHandler
  }
  registerHandler (name, fn) {}
  callHandler (nativeHandler, payload, callback) {
    this.mockHandler(payload, callback)
  }
}
