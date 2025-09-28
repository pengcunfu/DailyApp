import Cookies from 'js-cookie'

const cookies = {}
const TOKEN_KEY = 'daily_app_token'

/**
 * @description 存储 cookie 值
 * @param {String} name cookie name
 * @param {String} value cookie value
 * @param {Object} setting cookie setting
 */
cookies.set = function (name = 'default', value = '', cookieSetting = {}) {
  const currentCookieSetting = {
    expires: 1
  }
  Object.assign(currentCookieSetting, cookieSetting)
  Cookies.set(`${name}`, value, currentCookieSetting)
}

/**
 * @description 拿到 cookie 值
 * @param {String} name cookie name
 */
cookies.get = function (name = 'default') {
  return Cookies.get(`${name}`)
}

/**
 * @description 拿到 cookie 全部的值
 */
cookies.getAll = function () {
  return Cookies.get()
}

/**
 * @description 删除 cookie
 * @param {String} name cookie name
 */
cookies.remove = function (name = 'default') {
  return Cookies.remove(name)
}

// Token management functions
export const getToken = () => {
  return Cookies.get(TOKEN_KEY)
}

export const setToken = (token) => {
  return Cookies.set(TOKEN_KEY, token, { expires: 7 }) // 7 days
}

export const removeToken = () => {
  return Cookies.remove(TOKEN_KEY)
}

export default cookies
