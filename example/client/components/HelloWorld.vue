<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <button @click="callNative">callNativeHandler</button>
    <pre>
      {{code}}
    </pre>
  </div>
</template>

<script>
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
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
button {
  padding: 8px 12px;
  font-size: 14px;
}
</style>
