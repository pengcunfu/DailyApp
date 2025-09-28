<template>
  <view class="login-container">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 登录头部 -->
    <view class="login-header">
      <view class="logo">
        <image src="/static/logo.png" mode="aspectFit" class="logo-img"></image>
      </view>
      <view class="title">日常助手</view>
      <view class="subtitle">记录生活，管理日常</view>
    </view>
    
    <!-- 登录表单 -->
    <view class="login-form">
      <view class="form-item">
        <view class="input-wrapper">
          <text class="iconfont icon-user"></text>
          <input 
            v-model="loginForm.username" 
            placeholder="请输入用户名或邮箱"
            class="input"
            type="text"
          />
        </view>
      </view>
      
      <view class="form-item">
        <view class="input-wrapper">
          <text class="iconfont icon-lock"></text>
          <input 
            v-model="loginForm.password" 
            placeholder="请输入密码"
            class="input"
            :password="!showPassword"
            type="text"
          />
          <text 
            class="iconfont" 
            :class="showPassword ? 'icon-eye' : 'icon-eye-close'"
            @tap="togglePassword"
          ></text>
        </view>
      </view>
      
      <!-- 记住密码 -->
      <view class="remember-row">
        <label class="checkbox-wrapper">
          <checkbox 
            :checked="rememberPassword" 
            @change="onRememberChange"
            color="#007AFF"
          />
          <text class="checkbox-text">记住密码</text>
        </label>
      </view>
      
      <!-- 登录按钮 -->
      <button 
        class="login-btn" 
        :disabled="!canLogin"
        :class="{ 'disabled': !canLogin }"
        @tap="handleLogin"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>
      
      <!-- 注册链接 -->
      <view class="register-row">
        <text class="register-text">还没有账号？</text>
        <text class="register-link" @tap="goToRegister">立即注册</text>
      </view>
    </view>
    
    <!-- 底部装饰 -->
    <view class="login-footer">
      <view class="footer-text">让生活更有序，让日常更精彩</view>
    </view>
  </view>
</template>

<script>
import { useUserStore } from '@/stores/user'

export default {
  name: 'Login',
  data() {
    return {
      statusBarHeight: 0,
      loading: false,
      showPassword: false,
      rememberPassword: false,
      loginForm: {
        username: 'admin',
        password: '123456'
      }
    }
  },
  
  computed: {
    canLogin() {
      return this.loginForm.username.trim() && 
             this.loginForm.password.trim() && 
             !this.loading
    }
  },
  
  onLoad() {
    // 获取系统状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 0
    
    // 检查是否记住密码
    const savedCredentials = uni.getStorageSync('savedCredentials')
    if (savedCredentials) {
      this.loginForm = savedCredentials
      this.rememberPassword = true
    }
  },
  
  methods: {
    // 切换密码显示状态
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    
    // 记住密码状态改变
    onRememberChange(e) {
      this.rememberPassword = e.detail.value.length > 0
    },
    
    // 处理登录
    async handleLogin() {
      if (!this.canLogin) return
      
      try {
        this.loading = true
        
        const userStore = useUserStore()
        await userStore.login(this.loginForm)
        
        // 记住密码
        if (this.rememberPassword) {
          uni.setStorageSync('savedCredentials', this.loginForm)
        } else {
          uni.removeStorageSync('savedCredentials')
        }
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 跳转到首页
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
        
      } catch (error) {
        console.error('登录失败:', error)
        uni.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 跳转到注册页
    goToRegister() {
      // 暂时用提示代替，后续可以添加注册页面
      uni.showToast({
        title: '请联系管理员开通账号',
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.status-bar {
  width: 100%;
  background: transparent;
}

.login-header {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
  
  .logo {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 30rpx;
    
    .logo-img {
      width: 100%;
      height: 100%;
      border-radius: 24rpx;
    }
  }
  
  .title {
    font-size: 48rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 16rpx;
  }
  
  .subtitle {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.login-form {
  background: #ffffff;
  margin: 0 40rpx;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  
  .form-item {
    margin-bottom: 40rpx;
    
    .input-wrapper {
      display: flex;
      align-items: center;
      background: #f8f9fa;
      border-radius: 12rpx;
      padding: 0 24rpx;
      height: 96rpx;
      border: 2rpx solid transparent;
      transition: all 0.3s ease;
      
      &:focus-within {
        border-color: #007AFF;
        background: #ffffff;
        box-shadow: 0 0 0 4rpx rgba(0, 122, 255, 0.1);
      }
      
      .iconfont {
        font-size: 32rpx;
        color: #999999;
        margin-right: 16rpx;
        
        &:last-child {
          margin-right: 0;
          margin-left: 16rpx;
        }
      }
      
      .input {
        flex: 1;
        height: 100%;
        font-size: 32rpx;
        color: #333333;
      }
    }
  }
  
  .remember-row {
    margin-bottom: 40rpx;
    
    .checkbox-wrapper {
      display: flex;
      align-items: center;
      
      .checkbox-text {
        font-size: 28rpx;
        color: #666666;
        margin-left: 16rpx;
      }
    }
  }
  
  .login-btn {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #007AFF, #5856D6);
    color: #ffffff;
    border-radius: 48rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    
    &:not(.disabled):active {
      transform: translateY(2rpx);
      box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.3);
    }
    
    &.disabled {
      opacity: 0.6;
      background: #cccccc;
    }
  }
  
  .register-row {
    text-align: center;
    margin-top: 40rpx;
    
    .register-text {
      font-size: 28rpx;
      color: #999999;
    }
    
    .register-link {
      font-size: 28rpx;
      color: #007AFF;
      margin-left: 8rpx;
    }
  }
}

.login-footer {
  padding: 40rpx;
  text-align: center;
  
  .footer-text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.6);
  }
}

/* 图标字体样式 */
.iconfont {
  font-family: 'iconfont';
}

.icon-user::before { content: '👤'; }
.icon-lock::before { content: '🔒'; }
.icon-eye::before { content: '👁'; }
.icon-eye-close::before { content: '🙈'; }
</style>
