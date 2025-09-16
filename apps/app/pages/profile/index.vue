<template>
  <view class="profile-container">
    <!-- 用户信息头部 -->
    <view class="profile-header">
      <view class="header-bg"></view>
      <view class="user-info">
        <view class="avatar-wrapper" @tap="changeAvatar">
          <image 
            :src="userInfo.profile?.avatar || '/static/default-avatar.png'" 
            class="avatar"
            mode="aspectFill"
          ></image>
          <view class="avatar-edit">
            <text class="iconfont icon-camera"></text>
          </view>
        </view>
        <view class="user-details">
          <view class="username">{{ userInfo.username || '用户' }}</view>
          <view class="email">{{ userInfo.email || '' }}</view>
        </view>
      </view>
    </view>
    
    <!-- 统计数据 -->
    <view class="stats-section">
      <view class="stat-item" @tap="goToPage('/pages/bill/index')">
        <view class="stat-number">{{ userStats.billCount || 0 }}</view>
        <view class="stat-label">账单记录</view>
      </view>
      <view class="stat-item" @tap="goToPage('/pages/todo/index')">
        <view class="stat-number">{{ userStats.todoCount || 0 }}</view>
        <view class="stat-label">待办事项</view>
      </view>
      <view class="stat-item" @tap="goToPage('/pages/note/index')">
        <view class="stat-number">{{ userStats.noteCount || 0 }}</view>
        <view class="stat-label">笔记数量</view>
      </view>
      <view class="stat-item" @tap="goToPage('/pages/friend/index')">
        <view class="stat-number">{{ userStats.friendCount || 0 }}</view>
        <view class="stat-label">朋友数量</view>
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="group-title">数据管理</view>
        <view class="menu-item" @tap="goToPage('/pages/bill/statistics')">
          <view class="menu-icon" style="background: #FF6B6B;">
            <text class="iconfont icon-chart">📊</text>
          </view>
          <view class="menu-content">
            <view class="menu-title">消费统计</view>
            <view class="menu-desc">查看消费趋势和分析</view>
          </view>
          <view class="menu-arrow">
            <text class="iconfont icon-arrow">></text>
          </view>
        </view>
        
        <view class="menu-item" @tap="goToPage('/pages/bill/category')">
          <view class="menu-icon" style="background: #4ECDC4;">
            <text class="iconfont icon-category">📋</text>
          </view>
          <view class="menu-content">
            <view class="menu-title">分类管理</view>
            <view class="menu-desc">管理账单和笔记分类</view>
          </view>
          <view class="menu-arrow">
            <text class="iconfont icon-arrow">></text>
          </view>
        </view>
        
        <view class="menu-item" @tap="goToPage('/pages/friend/birthday')">
          <view class="menu-icon" style="background: #45B7D1;">
            <text class="iconfont icon-birthday">🎂</text>
          </view>
          <view class="menu-content">
            <view class="menu-title">生日提醒</view>
            <view class="menu-desc">朋友生日提醒设置</view>
          </view>
          <view class="menu-arrow">
            <text class="iconfont icon-arrow">></text>
          </view>
        </view>
      </view>
      
      <view class="menu-group">
        <view class="group-title">个人设置</view>
        <view class="menu-item" @tap="showEditProfile">
          <view class="menu-icon" style="background: #96CEB4;">
            <text class="iconfont icon-user">👤</text>
          </view>
          <view class="menu-content">
            <view class="menu-title">个人资料</view>
            <view class="menu-desc">编辑个人信息</view>
          </view>
          <view class="menu-arrow">
            <text class="iconfont icon-arrow">></text>
          </view>
        </view>
        
        <view class="menu-item" @tap="showChangePassword">
          <view class="menu-icon" style="background: #FFEAA7;">
            <text class="iconfont icon-lock">🔒</text>
          </view>
          <view class="menu-content">
            <view class="menu-title">修改密码</view>
            <view class="menu-desc">更改登录密码</view>
          </view>
          <view class="menu-arrow">
            <text class="iconfont icon-arrow">></text>
          </view>
        </view>
        
        <view class="menu-item" @tap="showSettings">
          <view class="menu-icon" style="background: #DDA0DD;">
            <text class="iconfont icon-setting">⚙️</text>
          </view>
          <view class="menu-content">
            <view class="menu-title">应用设置</view>
            <view class="menu-desc">通知、主题等设置</view>
          </view>
          <view class="menu-arrow">
            <text class="iconfont icon-arrow">></text>
          </view>
        </view>
      </view>
      
      <view class="menu-group">
        <view class="group-title">其他</view>
        <view class="menu-item" @tap="showAbout">
          <view class="menu-icon" style="background: #98D8C8;">
            <text class="iconfont icon-info">ℹ️</text>
          </view>
          <view class="menu-content">
            <view class="menu-title">关于应用</view>
            <view class="menu-desc">版本信息和帮助</view>
          </view>
          <view class="menu-arrow">
            <text class="iconfont icon-arrow">></text>
          </view>
        </view>
        
        <view class="menu-item logout" @tap="showLogoutConfirm">
          <view class="menu-icon" style="background: #FF6B6B;">
            <text class="iconfont icon-logout">🚪</text>
          </view>
          <view class="menu-content">
            <view class="menu-title">退出登录</view>
            <view class="menu-desc">安全退出当前账号</view>
          </view>
          <view class="menu-arrow">
            <text class="iconfont icon-arrow">></text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 编辑资料弹窗 -->
    <uni-popup ref="profilePopup" type="center">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">编辑资料</text>
          <text class="popup-close" @tap="closeEditProfile">×</text>
        </view>
        <view class="form-content">
          <view class="form-item">
            <text class="form-label">昵称</text>
            <input 
              class="form-input"
              v-model="profileForm.username"
              placeholder="请输入昵称"
              maxlength="20"
            />
          </view>
          <view class="form-item">
            <text class="form-label">邮箱</text>
            <input 
              class="form-input"
              v-model="profileForm.email"
              placeholder="请输入邮箱"
              type="email"
            />
          </view>
          <view class="form-item">
            <text class="form-label">手机</text>
            <input 
              class="form-input"
              v-model="profileForm.phone"
              placeholder="请输入手机号"
              type="number"
            />
          </view>
          <view class="form-item">
            <text class="form-label">地址</text>
            <input 
              class="form-input"
              v-model="profileForm.address"
              placeholder="请输入地址"
            />
          </view>
          <view class="form-item">
            <text class="form-label">简介</text>
            <textarea 
              class="form-textarea"
              v-model="profileForm.bio"
              placeholder="请输入个人简介"
              maxlength="200"
            ></textarea>
          </view>
        </view>
        <view class="popup-actions">
          <button class="popup-btn cancel" @tap="closeEditProfile">取消</button>
          <button class="popup-btn confirm" @tap="saveProfile">保存</button>
        </view>
      </view>
    </uni-popup>
    
    <!-- 修改密码弹窗 -->
    <uni-popup ref="passwordPopup" type="center">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">修改密码</text>
          <text class="popup-close" @tap="closeChangePassword">×</text>
        </view>
        <view class="form-content">
          <view class="form-item">
            <text class="form-label">当前密码</text>
            <input 
              class="form-input"
              v-model="passwordForm.currentPassword"
              placeholder="请输入当前密码"
              type="password"
            />
          </view>
          <view class="form-item">
            <text class="form-label">新密码</text>
            <input 
              class="form-input"
              v-model="passwordForm.newPassword"
              placeholder="请输入新密码"
              type="password"
            />
          </view>
          <view class="form-item">
            <text class="form-label">确认密码</text>
            <input 
              class="form-input"
              v-model="passwordForm.confirmPassword"
              placeholder="请再次输入新密码"
              type="password"
            />
          </view>
        </view>
        <view class="popup-actions">
          <button class="popup-btn cancel" @tap="closeChangePassword">取消</button>
          <button class="popup-btn confirm" @tap="savePassword">确认修改</button>
        </view>
      </view>
    </uni-popup>
    
    <!-- 退出登录确认 -->
    <uni-popup ref="logoutPopup" type="dialog">
      <uni-popup-dialog 
        type="warn"
        title="确认退出"
        content="确定要退出登录吗？"
        @confirm="confirmLogout"
        @close="cancelLogout"
      ></uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script>
import { useUserStore } from '@/stores/user'

export default {
  name: 'Profile',
  data() {
    return {
      userInfo: {},
      userStats: {},
      profileForm: {
        username: '',
        email: '',
        phone: '',
        address: '',
        bio: ''
      },
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  
  onShow() {
    this.loadUserInfo()
    this.loadUserStats()
  },
  
  methods: {
    // 加载用户信息
    loadUserInfo() {
      const userStore = useUserStore()
      this.userInfo = userStore.userInfo || {}
      
      // 初始化表单数据
      this.profileForm = {
        username: this.userInfo.username || '',
        email: this.userInfo.email || '',
        phone: this.userInfo.profile?.phone || '',
        address: this.userInfo.profile?.address || '',
        bio: this.userInfo.profile?.bio || ''
      }
    },
    
    // 加载用户统计数据
    async loadUserStats() {
      // 这里可以调用API获取用户统计数据
      // 暂时使用模拟数据
      this.userStats = {
        billCount: 128,
        todoCount: 23,
        noteCount: 45,
        friendCount: 12
      }
    },
    
    // 更换头像
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          // 这里应该上传头像到服务器
          // 暂时只显示提示
          uni.showToast({
            title: '头像上传功能开发中',
            icon: 'none'
          })
        }
      })
    },
    
    // 显示编辑资料弹窗
    showEditProfile() {
      this.$refs.profilePopup.open()
    },
    
    // 关闭编辑资料弹窗
    closeEditProfile() {
      this.$refs.profilePopup.close()
    },
    
    // 保存个人资料
    async saveProfile() {
      try {
        const userStore = useUserStore()
        
        const updateData = {
          email: this.profileForm.email,
          profile: {
            phone: this.profileForm.phone,
            address: this.profileForm.address,
            bio: this.profileForm.bio
          }
        }
        
        await userStore.updateProfile(updateData)
        
        this.loadUserInfo()
        this.closeEditProfile()
        
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
      } catch (error) {
        console.error('保存失败:', error)
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'none'
        })
      }
    },
    
    // 显示修改密码弹窗
    showChangePassword() {
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      this.$refs.passwordPopup.open()
    },
    
    // 关闭修改密码弹窗
    closeChangePassword() {
      this.$refs.passwordPopup.close()
    },
    
    // 保存密码
    async savePassword() {
      if (!this.passwordForm.currentPassword) {
        uni.showToast({
          title: '请输入当前密码',
          icon: 'none'
        })
        return
      }
      
      if (!this.passwordForm.newPassword) {
        uni.showToast({
          title: '请输入新密码',
          icon: 'none'
        })
        return
      }
      
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        uni.showToast({
          title: '两次输入的密码不一致',
          icon: 'none'
        })
        return
      }
      
      if (this.passwordForm.newPassword.length < 6) {
        uni.showToast({
          title: '新密码至少6位',
          icon: 'none'
        })
        return
      }
      
      try {
        const userStore = useUserStore()
        
        await userStore.changePassword({
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword
        })
        
        this.closeChangePassword()
        
        uni.showToast({
          title: '密码修改成功',
          icon: 'success'
        })
        
      } catch (error) {
        console.error('修改密码失败:', error)
        uni.showToast({
          title: error.message || '修改失败',
          icon: 'none'
        })
      }
    },
    
    // 显示设置页面
    showSettings() {
      uni.showToast({
        title: '设置功能开发中',
        icon: 'none'
      })
    },
    
    // 显示关于页面
    showAbout() {
      uni.showModal({
        title: '关于日常助手',
        content: '版本：1.0.0\n\n一款简洁实用的日常管理应用，帮助您更好地管理生活中的各种事务。',
        showCancel: false
      })
    },
    
    // 显示退出登录确认
    showLogoutConfirm() {
      this.$refs.logoutPopup.open()
    },
    
    // 确认退出登录
    async confirmLogout() {
      try {
        const userStore = useUserStore()
        await userStore.logout()
        
        // 已经在store中处理了跳转
        this.$refs.logoutPopup.close()
        
      } catch (error) {
        console.error('退出登录失败:', error)
      }
    },
    
    // 取消退出登录
    cancelLogout() {
      this.$refs.logoutPopup.close()
    },
    
    // 跳转页面
    goToPage(url) {
      if (url.includes('/pages/bill/index') || 
          url.includes('/pages/todo/index') || 
          url.includes('/pages/note/index') ||
          url.includes('/pages/friend/index')) {
        uni.switchTab({ url })
      } else {
        uni.navigateTo({ url })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-container {
  background: #f8f9fa;
  min-height: 100vh;
}

.profile-header {
  position: relative;
  height: 400rpx;
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 320rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .user-info {
    position: absolute;
    top: 120rpx;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .avatar-wrapper {
      position: relative;
      margin-bottom: 24rpx;
      
      .avatar {
        width: 160rpx;
        height: 160rpx;
        border-radius: 80rpx;
        border: 6rpx solid #ffffff;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
      }
      
      .avatar-edit {
        position: absolute;
        right: 8rpx;
        bottom: 8rpx;
        width: 48rpx;
        height: 48rpx;
        background: #007AFF;
        border-radius: 24rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3rpx solid #ffffff;
        
        .iconfont {
          font-size: 24rpx;
          color: #ffffff;
        }
      }
    }
    
    .user-details {
      text-align: center;
      
      .username {
        font-size: 36rpx;
        font-weight: bold;
        color: #333333;
        margin-bottom: 8rpx;
      }
      
      .email {
        font-size: 26rpx;
        color: #666666;
      }
    }
  }
}

.stats-section {
  display: flex;
  padding: 32rpx;
  gap: 16rpx;
  
  .stat-item {
    flex: 1;
    background: #ffffff;
    border-radius: 16rpx;
    padding: 32rpx 16rpx;
    text-align: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:active {
      transform: translateY(2rpx);
    }
    
    .stat-number {
      font-size: 48rpx;
      font-weight: bold;
      color: #007AFF;
      margin-bottom: 8rpx;
    }
    
    .stat-label {
      font-size: 24rpx;
      color: #666666;
    }
  }
}

.menu-section {
  padding: 0 32rpx;
  
  .menu-group {
    margin-bottom: 32rpx;
    
    .group-title {
      font-size: 28rpx;
      color: #666666;
      margin-bottom: 16rpx;
      padding-left: 16rpx;
    }
    
    .menu-item {
      display: flex;
      align-items: center;
      background: #ffffff;
      padding: 32rpx;
      border-radius: 16rpx;
      margin-bottom: 16rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      
      &:active {
        transform: translateY(2rpx);
      }
      
      &.logout {
        .menu-title {
          color: #dc3545;
        }
      }
      
      .menu-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 40rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24rpx;
        
        .iconfont {
          font-size: 32rpx;
          color: #ffffff;
        }
      }
      
      .menu-content {
        flex: 1;
        
        .menu-title {
          font-size: 30rpx;
          color: #333333;
          margin-bottom: 8rpx;
          font-weight: 500;
        }
        
        .menu-desc {
          font-size: 24rpx;
          color: #999999;
        }
      }
      
      .menu-arrow {
        .iconfont {
          font-size: 24rpx;
          color: #cccccc;
        }
      }
    }
  }
}

.popup-content {
  background: #ffffff;
  border-radius: 24rpx;
  width: 640rpx;
  max-height: 80vh;
  overflow: hidden;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333333;
    }
    
    .popup-close {
      font-size: 48rpx;
      color: #999999;
      width: 48rpx;
      height: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .form-content {
    padding: 32rpx;
    max-height: 50vh;
    overflow-y: auto;
    
    .form-item {
      margin-bottom: 32rpx;
      
      .form-label {
        display: block;
        font-size: 28rpx;
        color: #333333;
        margin-bottom: 16rpx;
      }
      
      .form-input, .form-textarea {
        width: 100%;
        padding: 24rpx;
        background: #f8f9fa;
        border-radius: 12rpx;
        font-size: 28rpx;
        color: #333333;
        border: 1rpx solid transparent;
        box-sizing: border-box;
        
        &:focus {
          border-color: #007AFF;
          background: #ffffff;
        }
      }
      
      .form-textarea {
        height: 120rpx;
        resize: none;
      }
    }
  }
  
  .popup-actions {
    display: flex;
    padding: 24rpx 32rpx 32rpx;
    gap: 24rpx;
    
    .popup-btn {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      border: none;
      
      &.confirm {
        background: #007AFF;
        color: #ffffff;
      }
      
      &.cancel {
        background: #f8f9fa;
        color: #666666;
      }
    }
  }
}

/* 图标字体样式 */
.iconfont {
  font-family: 'iconfont';
}

.icon-camera::before { content: '📷'; }
.icon-chart::before { content: '📊'; }
.icon-category::before { content: '📋'; }
.icon-birthday::before { content: '🎂'; }
.icon-user::before { content: '👤'; }
.icon-lock::before { content: '🔒'; }
.icon-setting::before { content: '⚙️'; }
.icon-info::before { content: 'ℹ️'; }
.icon-logout::before { content: '🚪'; }
.icon-arrow::before { content: '>'; }
</style>
