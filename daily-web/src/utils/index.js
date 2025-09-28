/**
 * 格式化日期
 * @param {string|Date} date 日期
 * @param {string} format 格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化金额
 * @param {number} amount 金额
 * @param {number} precision 精度，默认2位小数
 * @returns {string} 格式化后的金额
 */
export const formatAmount = (amount, precision = 2) => {
  if (typeof amount !== 'number') return '0.00'
  return amount.toFixed(precision)
}

/**
 * 计算两个日期之间的天数差
 * @param {string|Date} startDate 开始日期
 * @param {string|Date} endDate 结束日期
 * @returns {number} 天数差
 */
export const getDaysDiff = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
  
  const timeDiff = end.getTime() - start.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} wait 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} limit 时间限制（毫秒）
 * @returns {Function} 节流后的函数
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 深拷贝对象
 * @param {any} obj 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 生成随机ID
 * @param {number} length ID长度，默认8位
 * @returns {string} 随机ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 获取文件扩展名
 * @param {string} filename 文件名
 * @returns {string} 扩展名
 */
export const getFileExtension = (filename) => {
  if (!filename || typeof filename !== 'string') return ''
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex !== -1 ? filename.slice(lastDotIndex + 1) : ''
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 验证邮箱格式
 * @param {string} email 邮箱地址
 * @returns {boolean} 是否为有效邮箱
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证手机号格式（中国）
 * @param {string} phone 手机号
 * @returns {boolean} 是否为有效手机号
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 获取当前时间戳
 * @returns {number} 时间戳（毫秒）
 */
export const getTimestamp = () => {
  return Date.now()
}

/**
 * 将时间戳转换为相对时间描述
 * @param {number|string|Date} timestamp 时间戳或日期
 * @returns {string} 相对时间描述
 */
export const getRelativeTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now.getTime() - time.getTime()
  
  const minute = 60 * 1000
  const hour = minute * 60
  const day = hour * 24
  const week = day * 7
  const month = day * 30
  const year = day * 365
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前'
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前'
  } else if (diff < week) {
    return Math.floor(diff / day) + '天前'
  } else if (diff < month) {
    return Math.floor(diff / week) + '周前'
  } else if (diff < year) {
    return Math.floor(diff / month) + '个月前'
  } else {
    return Math.floor(diff / year) + '年前'
  }
}

/**
 * 获取当前日期时间字符串
 * @param {string|Date} date 日期，默认为当前时间
 * @param {string} format 格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化的日期时间字符串
 */
export const getDateTime = (date = new Date(), format = 'YYYY-MM-DD HH:mm:ss') => {
  return formatDate(date, format)
}