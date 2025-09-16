import { defineStore } from 'pinia'
import { authAPI } from '@/api/index'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: uni.getStorageSync('token') || '',
    userInfo: uni.getStorageSync('userInfo') || null,
    isLoggedIn: false
  }),
  
  getters: {
    // 是否已登录
    isAuthenticated: (state) => !!state.token && !!state.userInfo,
    // 用户头像
    avatar: (state) => state.userInfo?.profile?.avatar || '',
    // 用户名
    username: (state) => state.userInfo?.username || '',
    // 用户邮箱
    email: (state) => state.userInfo?.email || ''
  },
  
  actions: {
    // 登录
    async login(credentials) {
      try {
        const response = await authAPI.login(credentials)
        const { user, token } = response.data
        
        this.token = token
        this.userInfo = user
        this.isLoggedIn = true
        
        // 存储到本地
        uni.setStorageSync('token', token)
        uni.setStorageSync('userInfo', user)
        
        return response
      } catch (error) {
        throw error
      }
    },
    
    // 注册
    async register(userInfo) {
      try {
        const response = await authAPI.register(userInfo)
        const { user, token } = response.data
        
        this.token = token
        this.userInfo = user
        this.isLoggedIn = true
        
        // 存储到本地
        uni.setStorageSync('token', token)
        uni.setStorageSync('userInfo', user)
        
        return response
      } catch (error) {
        throw error
      }
    },
    
    // 获取用户信息
    async getUserInfo() {
      try {
        const response = await authAPI.getProfile()
        this.userInfo = response.data.user
        
        // 更新本地存储
        uni.setStorageSync('userInfo', this.userInfo)
        
        return response
      } catch (error) {
        throw error
      }
    },
    
    // 更新用户信息
    async updateProfile(profileData) {
      try {
        const response = await authAPI.updateProfile(profileData)
        this.userInfo = response.data.user
        
        // 更新本地存储
        uni.setStorageSync('userInfo', this.userInfo)
        
        return response
      } catch (error) {
        throw error
      }
    },
    
    // 修改密码
    async changePassword(passwordData) {
      try {
        const response = await authAPI.changePassword(passwordData)
        return response
      } catch (error) {
        throw error
      }
    },
    
    // 退出登录
    async logout() {
      try {
        await authAPI.logout()
      } catch (error) {
        console.error('退出登录失败:', error)
      } finally {
        // 清除状态
        this.token = ''
        this.userInfo = null
        this.isLoggedIn = false
        
        // 清除本地存储
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        
        // 跳转到登录页
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }
    },
    
    // 检查登录状态
    checkAuthStatus() {
      const token = uni.getStorageSync('token')
      const userInfo = uni.getStorageSync('userInfo')
      
      if (token && userInfo) {
        this.token = token
        this.userInfo = userInfo
        this.isLoggedIn = true
        return true
      } else {
        this.clearAuth()
        return false
      }
    },
    
    // 清除认证信息
    clearAuth() {
      this.token = ''
      this.userInfo = null
      this.isLoggedIn = false
      
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
    }
  }
})
