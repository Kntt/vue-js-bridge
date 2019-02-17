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
