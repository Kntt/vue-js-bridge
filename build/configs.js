const fs = require('fs')
const path = require('path')
const babel = require('rollup-plugin-babel')
const beautify = require('js-beautify').js_beautify
const replace = require('rollup-plugin-replace')
const pkg = require('../package.json')
const version = process.env.VERSION || pkg.version
const banner =
`/**
 * vue-webview-js-bridge v${version}
 * (c) ${new Date().getFullYear()} Kntt
 * @license MIT
 */`

const resolve = _path => path.resolve(__dirname, '../', _path)

const configs = {
  umdDev: {
    input: resolve('lib/index.js'),
    file: resolve('dist/vue-webview-js-bridge.js'),
    format: 'umd',
    env: 'development'
  },
  umdProd: {
    input: resolve('lib/index.js'),
    file: resolve('dist/vue-webview-js-bridge.min.js'),
    format: 'umd',
    env: 'production'
  },
  esm: {
    input: resolve('lib/index.js'),
    file: resolve('dist/vue-webview-js-bridge.esm.js'),
    format: 'es'
  }
}

function genConfig (opts) {
  const config = {
    input: {
      input: opts.input,
      plugins: [
        replace({
          __VERSION__: version
        }),
        babel({
          exclude: 'node_modules/**',
          plugins: ['external-helpers']
        })
      ]
    },
    output: {
      banner,
      file: opts.file,
      format: opts.format,
      name: 'VueWebviewJsBridge'
    }
  }

  if (opts.env) {
    config.input.plugins.unshift(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }))
  }

  return config
}

function writeVersion (version) {
  return new Promise(function (resolve, reject) {
    pkg.version = version
    fs.writeFile(path.join(__dirname, '..', 'package.json'), beautify(JSON.stringify(pkg), { indent_size: 2 }), (err) => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })
}

function mapValues (obj, fn, version) {
  writeVersion(version)
  const res = {}
  Object.keys(obj).forEach(key => {
    res[key] = fn(obj[key], key)
  })
  return res
}

module.exports = mapValues(configs, genConfig, version)
