<template>
  <view class="home-container">
    <!-- 顶部用户信息 -->
    <view class="header-section">
      <view class="user-info">
        <view class="avatar-wrapper">
          <image 
            :src="userInfo.avatar || '/static/default-avatar.png'" 
            class="avatar"
            mode="aspectFill"
          ></image>
        </view>
        <view class="user-details">
          <view class="greeting">{{ greeting }}</view>
          <view class="username">{{ userInfo.username || '用户' }}</view>
        </view>
      </view>
      <view class="header-actions">
        <view class="notification-btn" @tap="goToNotifications">
          <text class="iconfont icon-bell"></text>
          <view class="badge" v-if="unreadCount > 0">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
        </view>
      </view>
    </view>
    
    <!-- 快捷操作卡片 -->
    <view class="quick-actions">
      <view class="section-title">快捷操作</view>
      <view class="action-grid">
        <view 
          class="action-item" 
          v-for="action in quickActions" 
          :key="action.id"
          @tap="handleQuickAction(action)"
        >
          <view class="action-icon" :style="{ backgroundColor: action.color }">
            <text class="iconfont" :class="action.icon"></text>
          </view>
          <text class="action-text">{{ action.name }}</text>
        </view>
      </view>
    </view>
    
    <!-- 统计数据 -->
    <view class="stats-section">
      <view class="section-title">今日数据</view>
      <view class="stats-grid">
        <view class="stat-item" v-for="stat in todayStats" :key="stat.key">
          <view class="stat-number">{{ stat.value }}</view>
          <view class="stat-label">{{ stat.label }}</view>
        </view>
      </view>
    </view>
    
    <!-- 最近活动 -->
    <view class="recent-section">
      <view class="section-header">
        <view class="section-title">最近活动</view>
        <text class="more-btn" @tap="goToActivityList">查看更多</text>
      </view>
      <view class="activity-list">
        <view 
          class="activity-item" 
          v-for="activity in recentActivities" 
          :key="activity.id"
        >
          <view class="activity-icon" :style="{ backgroundColor: activity.color }">
            <text class="iconfont" :class="activity.icon"></text>
          </view>
          <view class="activity-content">
            <view class="activity-title">{{ activity.title }}</view>
            <view class="activity-time">{{ formatTime(activity.time) }}</view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 待办提醒 -->
    <view class="todo-section" v-if="urgentTodos.length > 0">
      <view class="section-header">
        <view class="section-title">紧急待办</view>
        <text class="more-btn" @tap="goToTodos">查看全部</text>
      </view>
      <view class="todo-list">
        <view 
          class="todo-item" 
          v-for="todo in urgentTodos" 
          :key="todo.id"
          @tap="goToTodoDetail(todo)"
        >
          <view class="todo-priority" :class="'priority-' + todo.priority"></view>
          <view class="todo-content">
            <view class="todo-title">{{ todo.title }}</view>
            <view class="todo-time" v-if="todo.endTime">
              截止：{{ formatDateTime(todo.endTime) }}
            </view>
          </view>
        </view>
      </view>
		</view>
	</view>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { todoAPI, billAPI, noteAPI } from '@/api/index'
import dayjs from 'dayjs'

	export default {
  name: 'Home',
		data() {
			return {
      userInfo: {},
      unreadCount: 0,
      todayStats: [
        { key: 'expense', label: '今日支出', value: '0' },
        { key: 'todos', label: '待办事项', value: '0' },
        { key: 'notes', label: '笔记数量', value: '0' },
        { key: 'foods', label: '美食记录', value: '0' },
        { key: 'friends', label: '朋友数量', value: '0' },
        { key: 'appearance', label: '形象记录', value: '0' }
      ],
      quickActions: [
        { id: 1, name: '记账', icon: 'icon-money', color: '#FF6B6B', path: '/pages/bill/add' },
        { id: 2, name: '待办', icon: 'icon-todo', color: '#4ECDC4', path: '/pages/todo/add' },
        { id: 3, name: '笔记', icon: 'icon-note', color: '#45B7D1', path: '/pages/note/add' },
        { id: 4, name: '美食', icon: 'icon-food', color: '#96CEB4', path: '/pages/food/add' },
        { id: 5, name: '朋友', icon: 'icon-friend', color: '#FFA726', path: '/pages/friend/add' },
        { id: 6, name: '形象', icon: 'icon-appearance', color: '#AB47BC', path: '/pages/appearance/index' },
        { id: 7, name: '日记', icon: 'icon-diary', color: '#26A69A', path: '/pages/diary/add' },
        { id: 8, name: '统计', icon: 'icon-stats', color: '#EF5350', path: '/pages/bill/statistics' }
      ],
      recentActivities: [],
      urgentTodos: []
    }
  },
  
  computed: {
    greeting() {
      const hour = new Date().getHours()
      if (hour < 6) return '深夜好'
      if (hour < 9) return '早上好'
      if (hour < 12) return '上午好'
      if (hour < 14) return '中午好'
      if (hour < 17) return '下午好'
      if (hour < 19) return '傍晚好'
      return '晚上好'
    }
  },
  
  onShow() {
    this.checkAuthStatus()
    this.loadUserInfo()
    this.loadTodayStats()
    this.loadRecentActivities()
    this.loadUrgentTodos()
  },
  
  onPullDownRefresh() {
    this.refreshData()
  },
  
		methods: {
    // 检查登录状态
    checkAuthStatus() {
      const userStore = useUserStore()
      if (!userStore.checkAuthStatus()) {
        uni.reLaunch({
          url: '/pages/login/login'
        })
        return false
      }
      return true
    },
    
    // 加载用户信息
    loadUserInfo() {
      const userStore = useUserStore()
      this.userInfo = userStore.userInfo || {}
    },
    
    // 加载今日统计数据
    async loadTodayStats() {
      try {
        const today = dayjs().format('YYYY-MM-DD')
        
        // 获取今日账单统计
        const billStats = await billAPI.getStats({ 
          startDate: today, 
          endDate: today 
        })
        
        // 获取待办统计
        const todoStats = await todoAPI.getStats()
        
        // 获取笔记统计  
        const noteStats = await noteAPI.getStats()
        
        this.todayStats = [
          { 
            key: 'expense', 
            label: '今日支出', 
            value: `¥${billStats.data?.totalAmount || 0}` 
          },
          { 
            key: 'todos', 
            label: '待办事项', 
            value: todoStats.data?.pendingCount || 0 
          },
          { 
            key: 'notes', 
            label: '笔记数量', 
            value: noteStats.data?.totalCount || 0 
          },
          { 
            key: 'foods', 
            label: '美食记录', 
            value: '0' 
          }
        ]
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    },
    
    // 加载最近活动
    async loadRecentActivities() {
      try {
        // 这里可以调用获取最近活动的API
        // 暂时使用模拟数据
        this.recentActivities = [
          {
            id: 1,
            title: '添加了一笔餐饮支出',
            time: new Date(Date.now() - 1000 * 60 * 30),
            icon: 'icon-money',
            color: '#FF6B6B'
          },
          {
            id: 2,
            title: '完成了待办事项：购买日用品',
            time: new Date(Date.now() - 1000 * 60 * 60 * 2),
            icon: 'icon-todo',
            color: '#4ECDC4'
          },
          {
            id: 3,
            title: '创建了新笔记：学习计划',
            time: new Date(Date.now() - 1000 * 60 * 60 * 5),
            icon: 'icon-note',
            color: '#45B7D1'
          }
        ]
      } catch (error) {
        console.error('加载最近活动失败:', error)
      }
    },
    
    // 加载紧急待办
    async loadUrgentTodos() {
      try {
        const response = await todoAPI.getList({ 
          priority: 2, // 紧急
          status: 0,   // 未完成
          limit: 3 
        })
        this.urgentTodos = response.data?.todos || []
      } catch (error) {
        console.error('加载紧急待办失败:', error)
      }
    },
    
    // 刷新数据
    async refreshData() {
      await Promise.all([
        this.loadTodayStats(),
        this.loadRecentActivities(),
        this.loadUrgentTodos()
      ])
      uni.stopPullDownRefresh()
    },
    
    // 处理快捷操作
    handleQuickAction(action) {
      uni.navigateTo({
        url: action.path
      })
    },
    
    // 跳转到通知页面
    goToNotifications() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    // 跳转到活动列表
    goToActivityList() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    // 跳转到待办列表
    goToTodos() {
      uni.switchTab({
        url: '/pages/todo/index'
      })
    },
    
    // 跳转到待办详情
    goToTodoDetail(todo) {
      uni.navigateTo({
        url: `/pages/todo/detail?id=${todo.id}`
      })
    },
    
    // 格式化时间
    formatTime(time) {
      return dayjs(time).fromNow()
    },
    
    // 格式化日期时间
    formatDateTime(time) {
      return dayjs(time).format('MM-DD HH:mm')
    }
		}
	}
</script>

<style lang="scss" scoped>
.home-container {
  padding: 0 32rpx;
  background: #f8f9fa;
  min-height: 100vh;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 0;
  
  .user-info {
    display: flex;
    align-items: center;
    
    .avatar-wrapper {
      width: 96rpx;
      height: 96rpx;
      margin-right: 24rpx;
      
      .avatar {
        width: 100%;
        height: 100%;
        border-radius: 48rpx;
        border: 4rpx solid #ffffff;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
      }
    }
    
    .user-details {
      .greeting {
        font-size: 28rpx;
        color: #666666;
        margin-bottom: 8rpx;
      }
      
      .username {
        font-size: 36rpx;
        font-weight: bold;
        color: #333333;
      }
    }
  }
  
  .header-actions {
    .notification-btn {
      position: relative;
      width: 80rpx;
      height: 80rpx;
      background: #ffffff;
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
      
      .iconfont {
        font-size: 36rpx;
        color: #666666;
      }
      
      .badge {
        position: absolute;
        top: -8rpx;
        right: -8rpx;
        background: #FF3B30;
        color: #ffffff;
        font-size: 20rpx;
        min-width: 32rpx;
        height: 32rpx;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 8rpx;
      }
    }
  }
}

.quick-actions, .stats-section, .recent-section, .todo-section {
  margin-bottom: 40rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 24rpx;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .more-btn {
      font-size: 26rpx;
      color: #007AFF;
    }
  }
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
  
  .action-item {
		display: flex;
		flex-direction: column;
    align-items: center;
    padding: 32rpx 16rpx;
    background: #ffffff;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:active {
      transform: translateY(2rpx);
    }
    
    .action-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 40rpx;
      display: flex;
		align-items: center;
		justify-content: center;
      margin-bottom: 16rpx;
      
      .iconfont {
        font-size: 36rpx;
        color: #ffffff;
      }
    }
    
    .action-text {
      font-size: 24rpx;
      color: #666666;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  
  .stat-item {
    background: #ffffff;
    padding: 32rpx;
    border-radius: 16rpx;
    text-align: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    
    .stat-number {
      font-size: 48rpx;
      font-weight: bold;
      color: #007AFF;
      margin-bottom: 8rpx;
    }
    
    .stat-label {
      font-size: 26rpx;
      color: #666666;
    }
  }
}

.activity-list, .todo-list {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.activity-item, .todo-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .activity-icon {
    width: 72rpx;
    height: 72rpx;
    border-radius: 36rpx;
		display: flex;
    align-items: center;
		justify-content: center;
    margin-right: 24rpx;
    
    .iconfont {
      font-size: 32rpx;
      color: #ffffff;
    }
  }
  
  .activity-content, .todo-content {
    flex: 1;
    
    .activity-title, .todo-title {
      font-size: 30rpx;
      color: #333333;
      margin-bottom: 8rpx;
    }
    
    .activity-time, .todo-time {
      font-size: 24rpx;
      color: #999999;
    }
  }
}

.todo-item {
  .todo-priority {
    width: 8rpx;
    height: 72rpx;
    border-radius: 4rpx;
    margin-right: 24rpx;
    
    &.priority-0 {
      background: #28a745;
    }
    
    &.priority-1 {
      background: #ffc107;
    }
    
    &.priority-2 {
      background: #dc3545;
    }
  }
}

/* 图标字体样式 */
.iconfont {
  font-family: 'iconfont';
}

.icon-bell::before { content: '🔔'; }
.icon-money::before { content: '💰'; }
.icon-todo::before { content: '📝'; }
.icon-note::before { content: '📖'; }
.icon-food::before { content: '🍽️'; }
</style>
