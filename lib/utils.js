/**
 * 获取数据类型
 * @param {*} o
 * @returns {string}
 */
export const type = function (o) {
  const types = {
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regexp',
    '[object Object]': 'object',
    '[object Error]': 'error'
  }

  if (o == null) {
    return String(o)
  }
  return typeof o === 'object' ? types[ Object.prototype.toString.call(o) ] || 'object' : typeof o
}
/**
 * 中划线转驼峰
 * @param { string } variable
 * @returns { string }
 */
export const toCamelCaseVar = (variable) => {
  return variable.replace(/\-(\w)/g, (_, letter) => letter.toUpperCase())
}

/**
 * 获取设备信息
 */
export const getDeviceInfo = () => {
  var device = {}
  var ua = navigator.userAgent

  var windows = ua.match(/(Windows Phone);?[\s\/]+([\d.]+)?/)
  var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/)
  var ipad = ua.match(/(iPad).*OS\s([\d_]+)/)
  var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/)
  var iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/)

  device.ios = device.android = device.windows = device.iphone = device.ipod = device.ipad = device.androidChrome = false

  // Windows
  if (windows) {
    device.os = 'windows'
    device.osVersion = windows[2]
    device.windows = true
  }
  // Android
  if (android && !windows) {
    device.os = 'android'
    device.osVersion = android[2]
    device.android = true
    device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0
  }
  if (ipad || iphone || ipod) {
    device.os = 'ios'
    device.ios = true
  }
  // iOS
  if (iphone && !ipod) {
    device.osVersion = iphone[2].replace(/_/g, '.')
    device.iphone = true
  }
  if (ipad) {
    device.osVersion = ipad[2].replace(/_/g, '.')
    device.ipad = true
  }
  if (ipod) {
    device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null
    device.iphone = true
  }
  // iOS 8+ changed UA
  if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
    if (device.osVersion.split('.')[0] === '10') {
      device.osVersion = ua
        .toLowerCase()
        .split('version/')[1]
        .split(' ')[0]
    }
  }
  device.iphonex = device.ios && screen.height === 812 && screen.width === 375
  // Webview
  device.webView =
    (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i)

  return device
}
