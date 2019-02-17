import '@babel/polyfill'
import Vue from 'vue'
import App from './App.vue'
import VueJsBridge from 'vue-js-bridge'

Vue.use(VueJsBridge, {
  debug: true,
  nativeHandlerName: 'testObjcCallback',
  mock: false,
  mockHandler (payload, next) {
    next(Object.assign({ form: 'native' }, payload))
  }
})
Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
