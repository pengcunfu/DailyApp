<template>
  <view class="todo-container">
    <!-- 顶部统计 -->
    <view class="stats-header">
      <view class="stat-item">
        <view class="stat-number">{{ todoStats.totalCount || 0 }}</view>
        <view class="stat-label">总数</view>
      </view>
      <view class="stat-item">
        <view class="stat-number pending">{{ todoStats.pendingCount || 0 }}</view>
        <view class="stat-label">待完成</view>
      </view>
      <view class="stat-item">
        <view class="stat-number completed">{{ todoStats.completedCount || 0 }}</view>
        <view class="stat-label">已完成</view>
      </view>
      <view class="stat-item">
        <view class="stat-number urgent">{{ todoStats.urgentCount || 0 }}</view>
        <view class="stat-label">紧急</view>
      </view>
    </view>
    
    <!-- 筛选标签 -->
    <view class="filter-tabs">
      <view 
        class="filter-tab"
        :class="{ active: activeFilter === filter.key }"
        v-for="filter in filterOptions"
        :key="filter.key"
        @tap="switchFilter(filter.key)"
      >
        {{ filter.name }}
      </view>
    </view>
    
    <!-- 待办列表 -->
    <view class="todo-list">
      <view 
        class="todo-item"
        :class="{ completed: todo.status === 1 }"
        v-for="todo in filteredTodos"
        :key="todo.id"
        @tap="goToDetail(todo)"
      >
        <!-- 优先级指示器 -->
        <view class="priority-indicator" :class="'priority-' + todo.priority"></view>
        
        <!-- 完成状态 -->
        <view class="todo-checkbox" @tap.stop="toggleComplete(todo)">
          <text class="iconfont" :class="todo.status === 1 ? 'icon-checked' : 'icon-unchecked'"></text>
        </view>
        
        <!-- 内容区域 -->
        <view class="todo-content">
          <view class="todo-title" :class="{ completed: todo.status === 1 }">
            {{ todo.title }}
          </view>
          <view class="todo-desc" v-if="todo.content">
            {{ todo.content }}
          </view>
          <view class="todo-meta">
            <text class="todo-time" v-if="todo.endTime">
              截止：{{ formatDateTime(todo.endTime) }}
            </text>
            <text class="todo-tag" :class="'priority-' + todo.priority">
              {{ getPriorityText(todo.priority) }}
            </text>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="todo-actions">
          <view class="action-btn edit" @tap.stop="goToEdit(todo)">
            <text class="iconfont icon-edit"></text>
          </view>
          <view class="action-btn delete" @tap.stop="showDeleteConfirm(todo)">
            <text class="iconfont icon-delete"></text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredTodos.length === 0 && !loading">
        <image src="/static/empty-todo.png" class="empty-image" mode="aspectFit"></image>
        <text class="empty-text">{{ getEmptyText() }}</text>
        <button class="empty-btn" @tap="goToAdd" v-if="activeFilter === 'all'">
          添加第一个待办
        </button>
      </view>
      
      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <text class="loading-text">加载中...</text>
      </view>
    </view>
    
    <!-- 悬浮添加按钮 -->
    <view class="fab-button" @tap="goToAdd">
      <text class="iconfont icon-plus"></text>
    </view>
    
    <!-- 删除确认弹窗 -->
    <uni-popup ref="deletePopup" type="dialog">
      <uni-popup-dialog 
        type="warn"
        title="确认删除"
        content="确定要删除这个待办事项吗？"
        @confirm="confirmDelete"
        @close="cancelDelete"
      ></uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script>
import { todoAPI } from '@/api/index'
import dayjs from 'dayjs'

export default {
  name: 'TodoIndex',
  data() {
    return {
      loading: false,
      todos: [],
      todoStats: {},
      activeFilter: 'all',
      filterOptions: [
        { key: 'all', name: '全部' },
        { key: 'pending', name: '待完成' },
        { key: 'completed', name: '已完成' },
        { key: 'urgent', name: '紧急' }
      ],
      deleteTarget: null
    }
  },
  
  computed: {
    // 过滤后的待办列表
    filteredTodos() {
      let filtered = [...this.todos]
      
      switch (this.activeFilter) {
        case 'pending':
          filtered = filtered.filter(todo => todo.status === 0)
          break
        case 'completed':
          filtered = filtered.filter(todo => todo.status === 1)
          break
        case 'urgent':
          filtered = filtered.filter(todo => todo.priority === 2 && todo.status === 0)
          break
      }
      
      // 按优先级和创建时间排序
      return filtered.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority // 优先级高的在前
        }
        return new Date(b.createdAt) - new Date(a.createdAt) // 新创建的在前
      })
    }
  },
  
  onShow() {
    this.loadTodos()
    this.loadStats()
  },
  
  onPullDownRefresh() {
    this.refreshData()
  },
  
  methods: {
    // 加载待办列表
    async loadTodos() {
      try {
        this.loading = true
        const response = await todoAPI.getList()
        this.todos = response.data?.todos || []
      } catch (error) {
        console.error('加载待办失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 加载统计数据
    async loadStats() {
      try {
        const response = await todoAPI.getStats()
        this.todoStats = response.data || {}
      } catch (error) {
        console.error('加载统计失败:', error)
      }
    },
    
    // 刷新数据
    async refreshData() {
      await Promise.all([
        this.loadTodos(),
        this.loadStats()
      ])
      uni.stopPullDownRefresh()
    },
    
    // 切换筛选条件
    switchFilter(key) {
      this.activeFilter = key
    },
    
    // 切换完成状态
    async toggleComplete(todo) {
      try {
        const newStatus = todo.status === 0 ? 1 : 0
        await todoAPI.update(todo.id, { status: newStatus })
        
        // 更新本地数据
        const index = this.todos.findIndex(t => t.id === todo.id)
        if (index !== -1) {
          this.todos[index].status = newStatus
        }
        
        // 更新统计
        this.loadStats()
        
        uni.showToast({
          title: newStatus === 1 ? '已完成' : '已取消完成',
          icon: 'success'
        })
        
      } catch (error) {
        console.error('更新状态失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },
    
    // 显示删除确认
    showDeleteConfirm(todo) {
      this.deleteTarget = todo
      this.$refs.deletePopup.open()
    },
    
    // 确认删除
    async confirmDelete() {
      if (!this.deleteTarget) return
      
      try {
        await todoAPI.delete(this.deleteTarget.id)
        
        // 从列表中移除
        const index = this.todos.findIndex(t => t.id === this.deleteTarget.id)
        if (index !== -1) {
          this.todos.splice(index, 1)
        }
        
        // 更新统计
        this.loadStats()
        
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
        
      } catch (error) {
        console.error('删除失败:', error)
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        })
      } finally {
        this.deleteTarget = null
        this.$refs.deletePopup.close()
      }
    },
    
    // 取消删除
    cancelDelete() {
      this.deleteTarget = null
      this.$refs.deletePopup.close()
    },
    
    // 跳转到详情页
    goToDetail(todo) {
      uni.navigateTo({
        url: `/pages/todo/detail?id=${todo.id}`
      })
    },
    
    // 跳转到编辑页
    goToEdit(todo) {
      uni.navigateTo({
        url: `/pages/todo/add?id=${todo.id}`
      })
    },
    
    // 跳转到添加页
    goToAdd() {
      uni.navigateTo({
        url: '/pages/todo/add'
      })
    },
    
    // 获取优先级文本
    getPriorityText(priority) {
      const texts = { 0: '普通', 1: '重要', 2: '紧急' }
      return texts[priority] || '普通'
    },
    
    // 获取空状态文本
    getEmptyText() {
      const texts = {
        all: '暂无待办事项',
        pending: '暂无待完成事项',
        completed: '暂无已完成事项',
        urgent: '暂无紧急事项'
      }
      return texts[this.activeFilter] || '暂无数据'
    },
    
    // 格式化日期时间
    formatDateTime(time) {
      const now = dayjs()
      const target = dayjs(time)
      
      if (target.isBefore(now)) {
        return `已过期 ${target.format('MM-DD HH:mm')}`
      } else if (target.diff(now, 'day') <= 1) {
        return target.format('今天 HH:mm')
      } else if (target.diff(now, 'day') <= 7) {
        return target.format('MM-DD HH:mm')
      } else {
        return target.format('YYYY-MM-DD')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.todo-container {
  background: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.stats-header {
  display: flex;
  padding: 32rpx;
  gap: 16rpx;
  
  .stat-item {
    flex: 1;
    background: #ffffff;
    border-radius: 16rpx;
    padding: 24rpx;
    text-align: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    
    .stat-number {
      font-size: 36rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 8rpx;
      
      &.pending {
        color: #007AFF;
      }
      
      &.completed {
        color: #28a745;
      }
      
      &.urgent {
        color: #dc3545;
      }
    }
    
    .stat-label {
      font-size: 24rpx;
      color: #666666;
    }
  }
}

.filter-tabs {
  display: flex;
  background: #ffffff;
  margin: 0 32rpx 24rpx;
  border-radius: 16rpx;
  padding: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  .filter-tab {
    flex: 1;
    text-align: center;
    padding: 16rpx;
    font-size: 28rpx;
    color: #666666;
    border-radius: 12rpx;
    transition: all 0.3s ease;
    
    &.active {
      background: #007AFF;
      color: #ffffff;
    }
  }
}

.todo-list {
  margin: 0 32rpx;
  
  .todo-item {
    display: flex;
    align-items: flex-start;
    background: #ffffff;
    padding: 32rpx;
    margin-bottom: 16rpx;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    position: relative;
    transition: all 0.3s ease;
    
    &.completed {
      opacity: 0.6;
    }
    
    &:active {
      transform: translateY(2rpx);
    }
    
    .priority-indicator {
      width: 8rpx;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      border-radius: 16rpx 0 0 16rpx;
      
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
    
    .todo-checkbox {
      width: 48rpx;
      height: 48rpx;
      margin-right: 24rpx;
      margin-top: 8rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .iconfont {
        font-size: 32rpx;
        color: #007AFF;
      }
    }
    
    .todo-content {
      flex: 1;
      min-width: 0;
      
      .todo-title {
        font-size: 30rpx;
        color: #333333;
        margin-bottom: 8rpx;
        font-weight: 500;
        word-break: break-all;
        
        &.completed {
          text-decoration: line-through;
          color: #999999;
        }
      }
      
      .todo-desc {
        font-size: 26rpx;
        color: #666666;
        margin-bottom: 12rpx;
        word-break: break-all;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .todo-meta {
        display: flex;
        align-items: center;
        gap: 16rpx;
        
        .todo-time {
          font-size: 24rpx;
          color: #999999;
        }
        
        .todo-tag {
          font-size: 20rpx;
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
          color: #ffffff;
          
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
    }
    
    .todo-actions {
      display: flex;
      flex-direction: column;
      gap: 16rpx;
      margin-left: 16rpx;
      
      .action-btn {
        width: 64rpx;
        height: 64rpx;
        border-radius: 32rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .iconfont {
          font-size: 28rpx;
          color: #ffffff;
        }
        
        &.edit {
          background: #007AFF;
        }
        
        &.delete {
          background: #dc3545;
        }
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 120rpx 32rpx;
  
  .empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 32rpx;
  }
  
  .empty-text {
    display: block;
    font-size: 28rpx;
    color: #999999;
    margin-bottom: 40rpx;
  }
  
  .empty-btn {
    background: linear-gradient(135deg, #007AFF, #5856D6);
    color: #ffffff;
    border: none;
    border-radius: 48rpx;
    padding: 24rpx 48rpx;
    font-size: 28rpx;
  }
}

.loading-state {
  text-align: center;
  padding: 40rpx;
  
  .loading-text {
    font-size: 26rpx;
    color: #999999;
  }
}

.fab-button {
  position: fixed;
  right: 32rpx;
  bottom: 120rpx;
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #007AFF, #5856D6);
  border-radius: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.3);
  z-index: 100;
  
  .iconfont {
    font-size: 48rpx;
    color: #ffffff;
  }
}

/* 图标字体样式 */
.iconfont {
  font-family: 'iconfont';
}

.icon-checked::before { content: '✅'; }
.icon-unchecked::before { content: '⭕'; }
.icon-edit::before { content: '✏️'; }
.icon-delete::before { content: '🗑️'; }
.icon-plus::before { content: '➕'; }
</style>
