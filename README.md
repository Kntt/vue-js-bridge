## vue-js-bridge
- 基于[WebViewJavascriptBridge](https://github.com/marcuswestin/WebViewJavascriptBridge)开发
- Promise封装，支持`then`或者`async/await`等方式

## 安装

yarn:

```bash
yarn add vue-js-bridge
```

npm:

```bash
npm i vue-js-bridge
```

## [Example](https://github.com/Kntt/vue-js-bridge/tree/dev/example/client)

```js
// main.js
import Vue from 'vue'
import VueJsBridge from 'vue-js-bridge'

Vue.use(VueJsBridge, {
  debug: true,
  nativeHandlerName: 'testObjcCallback',
  mock: true,
  mockHandler (payload, next) {
    // mock by payload
    // call next(data) to mock data
  }
  // ...
})

// component.vue
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
      code: ''
    }
  },
  mounted () {
    this.$bridge.registerHandler('testJavascriptHandler', (data, callback) => {
      this.code = data
      console.log('data from native:', data)
      const responseData = { 'Javascript Says':'Right back atcha!' }
			console.log('JS responding with', responseData)
      callback(responseData)
    })
  },
  methods: {
    async callNative () {
      try {
        let res = await this.$bridge.callHandler({
          type: 'optionType',
          data: {
            name: 'optionData'
          }
        })
        this.code = res
      } catch (error) {
        console.log('error', error)
      }
    }
  }
}
```

## 配置参数(Options)
### debug
- type: boolean
- default: `true`
- description: 输出调用信息

### nativeHandlerName
- type: string, 必填项
- default: 'nativeHandler'
- description: 和原生开发人员协商的nativeHandlerName

### mock
- type: boolean
- default: `true`
- description: 开发阶段是否开启mock服务，需要配合mockHandler使用，两者都设置的情况下mock生效

### mockHandler
- type: Function
- default: null
- description: 开发阶段mockHandler服务，需要配合mock使用，两者都设置的情况下mock生效. 是一个函数，第一个参数接收payload, 第二个参数接受bridge回调函数
```js
mockHandler (payload, next) {
  // mock by payload
  // switch(payload) {
  //  case 1:
  //    next(mockData)
  //    break
  //    ...
  // }
  // call next(data) to mock data
}
```

## 提供的方法(Methods)
### registerHandler
- description：注册一个bridge提供给原生开发者调用，第一个参数name(和原生开发者协商好的bridgeName)，第二个参数callback函数，
- callback: callback函数接收两个参数，第一个参数是native传来的数据data，第二个参数是原生传来的responseCallback，当需要时通知native我们的状态
```js
this.$bridge.registerHandler('testJavascriptHandler', (data, callback) => {
  this.code = data
  console.log('data from native:', data)
  const responseData = { 'Javascript Says':'Right back atcha!' }
  console.log('JS responding with', responseData)
  callback(responseData)
})
```

### callHandler
- description: 接受一个参数payload（和原生开发人员协商格式）例如：
```js
  this.$bridge.callHandler({
    type: 'optionType', // 标识调用native的功能
    data: { // 传到native的数据
      name: 'optionData'
    }
  })
```

## License

[MIT](http://opensource.org/licenses/MIT)