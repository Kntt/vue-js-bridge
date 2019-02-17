import VueJsBridgePlugin from './plugin'
import defaultOptions from './default'

export default {
  install (Vue, options) {
    const initConfig = Object.assign({}, defaultOptions, options)
    const bridge = new VueJsBridgePlugin(initConfig)
    Object.defineProperty(Vue.prototype, '$bridge', { value: bridge })
  },
  version: '__VERSION__'
}
