const path = require('path')
module.exports = {
  chainWebpack: config => {
    config.resolve.alias.set('vue-js-bridge', path.resolve(__dirname, '..', '..'))
  }
}
