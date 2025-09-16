<template>
  <view class="note-container">
    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-bar">
        <text class="iconfont icon-search">🔍</text>
        <input 
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索笔记标题或内容"
          @input="onSearchInput"
        />
        <text class="iconfont icon-clear" v-if="searchKeyword" @tap="clearSearch">❌</text>
      </view>
      <view class="filter-btn" @tap="showFilterPopup">
        <text class="iconfont icon-filter">🔽</text>
      </view>
    </view>
    
    <!-- 分类标签 -->
    <view class="category-tabs" v-if="noteTypes.length > 0">
      <scroll-view class="tabs-scroll" scroll-x>
        <view class="tabs-container">
          <view 
            class="category-tab"
            :class="{ active: selectedTypeId === null }"
            @tap="selectCategory(null)"
          >
            全部
          </view>
          <view 
            class="category-tab"
            :class="{ active: selectedTypeId === type.id }"
            v-for="type in noteTypes"
            :key="type.id"
            @tap="selectCategory(type.id)"
          >
            <text class="category-icon">{{ type.icon }}</text>
            <text class="category-name">{{ type.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 笔记列表 -->
    <view class="note-list">
      <!-- 列表模式切换 -->
      <view class="list-header" v-if="filteredNotes.length > 0">
        <text class="note-count">共 {{ filteredNotes.length }} 条笔记</text>
        <view class="view-toggle">
          <text 
            class="toggle-btn"
            :class="{ active: viewMode === 'list' }"
            @tap="switchViewMode('list')"
          >📋</text>
          <text 
            class="toggle-btn"
            :class="{ active: viewMode === 'grid' }"
            @tap="switchViewMode('grid')"
          >⊞</text>
        </view>
      </view>
      
      <!-- 列表视图 -->
      <view class="list-view" v-if="viewMode === 'list'">
        <view 
          class="note-item"
          v-for="note in filteredNotes"
          :key="note.id"
          @tap="goToDetail(note)"
        >
          <view class="note-header">
            <view class="note-title">{{ note.title }}</view>
            <view class="note-actions">
              <text class="action-btn edit" @tap.stop="goToEdit(note)">✏️</text>
              <text class="action-btn delete" @tap.stop="showDeleteConfirm(note)">🗑️</text>
            </view>
          </view>
          
          <view class="note-content" v-if="note.content">
            {{ getPlainText(note.content) }}
          </view>
          
          <view class="note-meta">
            <view class="meta-left">
              <text class="note-type" v-if="note.noteType">
                {{ note.noteType.icon }} {{ note.noteType.name }}
              </text>
              <text class="note-date">{{ formatDate(note.updatedAt) }}</text>
            </view>
            <view class="meta-right">
              <text class="word-count">{{ getWordCount(note.content) }}字</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 网格视图 -->
      <view class="grid-view" v-if="viewMode === 'grid'">
        <view 
          class="note-card"
          v-for="note in filteredNotes"
          :key="note.id"
          @tap="goToDetail(note)"
        >
          <view class="card-header">
            <view class="note-type-icon" v-if="note.noteType">
              {{ note.noteType.icon }}
            </view>
            <view class="card-actions">
              <text class="action-btn" @tap.stop="showDeleteConfirm(note)">🗑️</text>
            </view>
          </view>
          
          <view class="card-title">{{ note.title }}</view>
          
          <view class="card-content" v-if="note.content">
            {{ getPlainText(note.content) }}
          </view>
          
          <view class="card-footer">
            <text class="card-date">{{ formatDate(note.updatedAt) }}</text>
            <text class="card-words">{{ getWordCount(note.content) }}字</text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredNotes.length === 0 && !loading">
        <image src="/static/empty-note.png" class="empty-image" mode="aspectFit"></image>
        <text class="empty-text">{{ getEmptyText() }}</text>
        <button class="empty-btn" @tap="goToAdd" v-if="!searchKeyword">
          创建第一篇笔记
        </button>
      </view>
      
      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <text class="loading-text">加载中...</text>
      </view>
    </view>
    
    <!-- 悬浮添加按钮 -->
    <view class="fab-button" @tap="goToAdd">
      <text class="iconfont icon-plus">➕</text>
    </view>
    
    <!-- 筛选弹窗 -->
    <uni-popup ref="filterPopup" type="bottom">
      <view class="filter-content">
        <view class="popup-header">
          <text class="popup-title">筛选选项</text>
          <text class="popup-close" @tap="closeFilterPopup">×</text>
        </view>
        
        <view class="filter-options">
          <view class="filter-group">
            <text class="group-title">排序方式</text>
            <view class="option-list">
              <view 
                class="option-item"
                :class="{ active: sortBy === option.value }"
                v-for="option in sortOptions"
                :key="option.value"
                @tap="setSortBy(option.value)"
              >
                <text class="option-text">{{ option.name }}</text>
                <text class="option-check" v-if="sortBy === option.value">✓</text>
              </view>
            </view>
          </view>
          
          <view class="filter-group">
            <text class="group-title">时间范围</text>
            <view class="option-list">
              <view 
                class="option-item"
                :class="{ active: timeRange === option.value }"
                v-for="option in timeRangeOptions"
                :key="option.value"
                @tap="setTimeRange(option.value)"
              >
                <text class="option-text">{{ option.name }}</text>
                <text class="option-check" v-if="timeRange === option.value">✓</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="popup-actions">
          <button class="popup-btn reset" @tap="resetFilter">重置</button>
          <button class="popup-btn confirm" @tap="applyFilter">确定</button>
        </view>
      </view>
    </uni-popup>
    
    <!-- 删除确认弹窗 -->
    <uni-popup ref="deletePopup" type="dialog">
      <uni-popup-dialog 
        type="warn"
        title="确认删除"
        content="确定要删除这篇笔记吗？删除后无法恢复。"
        @confirm="confirmDelete"
        @close="cancelDelete"
      ></uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script>
import { noteAPI } from '@/api/index'
import dayjs from 'dayjs'

export default {
  name: 'NoteIndex',
  data() {
    return {
      loading: false,
      notes: [],
      noteTypes: [],
      searchKeyword: '',
      selectedTypeId: null,
      viewMode: 'list', // list | grid
      sortBy: 'updatedAt',
      timeRange: 'all',
      deleteTarget: null,
      
      // 筛选选项
      sortOptions: [
        { value: 'updatedAt', name: '最近更新' },
        { value: 'createdAt', name: '创建时间' },
        { value: 'title', name: '标题排序' }
      ],
      
      timeRangeOptions: [
        { value: 'all', name: '全部时间' },
        { value: 'today', name: '今天' },
        { value: 'week', name: '本周' },
        { value: 'month', name: '本月' }
      ]
    }
  },
  
  computed: {
    // 过滤后的笔记列表
    filteredNotes() {
      let filtered = [...this.notes]
      
      // 分类筛选
      if (this.selectedTypeId) {
        filtered = filtered.filter(note => note.typeId === this.selectedTypeId)
      }
      
      // 搜索筛选
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        filtered = filtered.filter(note => 
          note.title.toLowerCase().includes(keyword) ||
          (note.content && this.getPlainText(note.content).toLowerCase().includes(keyword))
        )
      }
      
      // 时间范围筛选
      if (this.timeRange !== 'all') {
        const now = dayjs()
        filtered = filtered.filter(note => {
          const noteTime = dayjs(note.updatedAt)
          switch (this.timeRange) {
            case 'today':
              return noteTime.isSame(now, 'day')
            case 'week':
              return noteTime.isAfter(now.subtract(7, 'day'))
            case 'month':
              return noteTime.isSame(now, 'month')
            default:
              return true
          }
        })
      }
      
      // 排序
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'title':
            return a.title.localeCompare(b.title)
          case 'createdAt':
            return new Date(b.createdAt) - new Date(a.createdAt)
          case 'updatedAt':
          default:
            return new Date(b.updatedAt) - new Date(a.updatedAt)
        }
      })
      
      return filtered
    }
  },
  
  onShow() {
    this.loadNotes()
    this.loadNoteTypes()
  },
  
  onPullDownRefresh() {
    this.refreshData()
  },
  
  methods: {
    // 加载笔记列表
    async loadNotes() {
      try {
        this.loading = true
        const response = await noteAPI.getList()
        this.notes = response.data?.notes || []
      } catch (error) {
        console.error('加载笔记失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 加载笔记分类
    async loadNoteTypes() {
      try {
        const response = await noteAPI.getTypes()
        this.noteTypes = response.data || []
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    },
    
    // 刷新数据
    async refreshData() {
      await Promise.all([
        this.loadNotes(),
        this.loadNoteTypes()
      ])
      uni.stopPullDownRefresh()
    },
    
    // 搜索输入
    onSearchInput() {
      // 可以添加防抖逻辑
    },
    
    // 清除搜索
    clearSearch() {
      this.searchKeyword = ''
    },
    
    // 选择分类
    selectCategory(typeId) {
      this.selectedTypeId = typeId
    },
    
    // 切换视图模式
    switchViewMode(mode) {
      this.viewMode = mode
      // 保存用户偏好
      uni.setStorageSync('noteViewMode', mode)
    },
    
    // 显示筛选弹窗
    showFilterPopup() {
      this.$refs.filterPopup.open()
    },
    
    // 关闭筛选弹窗
    closeFilterPopup() {
      this.$refs.filterPopup.close()
    },
    
    // 设置排序方式
    setSortBy(value) {
      this.sortBy = value
    },
    
    // 设置时间范围
    setTimeRange(value) {
      this.timeRange = value
    },
    
    // 重置筛选
    resetFilter() {
      this.sortBy = 'updatedAt'
      this.timeRange = 'all'
    },
    
    // 应用筛选
    applyFilter() {
      this.closeFilterPopup()
    },
    
    // 显示删除确认
    showDeleteConfirm(note) {
      this.deleteTarget = note
      this.$refs.deletePopup.open()
    },
    
    // 确认删除
    async confirmDelete() {
      if (!this.deleteTarget) return
      
      try {
        await noteAPI.delete(this.deleteTarget.id)
        
        // 从列表中移除
        const index = this.notes.findIndex(n => n.id === this.deleteTarget.id)
        if (index !== -1) {
          this.notes.splice(index, 1)
        }
        
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
    goToDetail(note) {
      uni.navigateTo({
        url: `/pages/note/detail?id=${note.id}`
      })
    },
    
    // 跳转到编辑页
    goToEdit(note) {
      uni.navigateTo({
        url: `/pages/note/add?id=${note.id}`
      })
    },
    
    // 跳转到添加页
    goToAdd() {
      uni.navigateTo({
        url: '/pages/note/add'
      })
    },
    
    // 获取纯文本内容
    getPlainText(content) {
      if (!content) return ''
      // 简单的HTML标签去除
      return content.replace(/<[^>]*>/g, '').substring(0, 100)
    },
    
    // 获取字数统计
    getWordCount(content) {
      if (!content) return 0
      return this.getPlainText(content).length
    },
    
    // 获取空状态文本
    getEmptyText() {
      if (this.searchKeyword) {
        return `未找到包含"${this.searchKeyword}"的笔记`
      }
      if (this.selectedTypeId) {
        const type = this.noteTypes.find(t => t.id === this.selectedTypeId)
        return `暂无${type?.name || '该分类'}笔记`
      }
      return '暂无笔记'
    },
    
    // 格式化日期
    formatDate(date) {
      const now = dayjs()
      const target = dayjs(date)
      
      if (target.isSame(now, 'day')) {
        return target.format('HH:mm')
      } else if (target.isAfter(now.subtract(7, 'day'))) {
        return target.format('MM-DD')
      } else {
        return target.format('YYYY-MM-DD')
      }
    }
  },
  
  onLoad() {
    // 读取用户偏好的视图模式
    const savedViewMode = uni.getStorageSync('noteViewMode')
    if (savedViewMode) {
      this.viewMode = savedViewMode
    }
  }
}
</script>

<style lang="scss" scoped>
.note-container {
  background: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.search-section {
  display: flex;
  align-items: center;
  padding: 32rpx;
  gap: 16rpx;
  
  .search-bar {
    flex: 1;
    display: flex;
    align-items: center;
    background: #ffffff;
    border-radius: 48rpx;
    padding: 0 32rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    
    .icon-search {
      font-size: 32rpx;
      color: #999999;
      margin-right: 16rpx;
    }
    
    .search-input {
      flex: 1;
      height: 80rpx;
      font-size: 28rpx;
      color: #333333;
    }
    
    .icon-clear {
      font-size: 24rpx;
      color: #999999;
      padding: 8rpx;
    }
  }
  
  .filter-btn {
    width: 80rpx;
    height: 80rpx;
    background: #ffffff;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    
    .icon-filter {
      font-size: 28rpx;
      color: #666666;
    }
  }
}

.category-tabs {
  margin-bottom: 24rpx;
  
  .tabs-scroll {
    white-space: nowrap;
    
    .tabs-container {
      display: inline-flex;
      padding: 0 32rpx;
      gap: 16rpx;
      
      .category-tab {
        display: inline-flex;
        align-items: center;
        padding: 16rpx 24rpx;
        background: #ffffff;
        border-radius: 24rpx;
        font-size: 26rpx;
        color: #666666;
        white-space: nowrap;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        
        &.active {
          background: #007AFF;
          color: #ffffff;
        }
        
        .category-icon {
          margin-right: 8rpx;
        }
      }
    }
  }
}

.note-list {
  padding: 0 32rpx;
  
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .note-count {
      font-size: 24rpx;
      color: #999999;
    }
    
    .view-toggle {
      display: flex;
      background: #ffffff;
      border-radius: 8rpx;
      padding: 4rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
      
      .toggle-btn {
        width: 48rpx;
        height: 48rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6rpx;
        font-size: 24rpx;
        color: #666666;
        transition: all 0.3s ease;
        
        &.active {
          background: #007AFF;
          color: #ffffff;
        }
      }
    }
  }
}

.list-view {
  .note-item {
    background: #ffffff;
    border-radius: 16rpx;
    padding: 32rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:active {
      transform: translateY(2rpx);
    }
    
    .note-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16rpx;
      
      .note-title {
        flex: 1;
        font-size: 32rpx;
        font-weight: bold;
        color: #333333;
        line-height: 1.4;
        margin-right: 16rpx;
      }
      
      .note-actions {
        display: flex;
        gap: 16rpx;
        
        .action-btn {
          font-size: 28rpx;
          padding: 8rpx;
        }
      }
    }
    
    .note-content {
      font-size: 28rpx;
      color: #666666;
      line-height: 1.6;
      margin-bottom: 16rpx;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .note-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .meta-left {
        display: flex;
        align-items: center;
        gap: 16rpx;
        
        .note-type {
          font-size: 22rpx;
          color: #007AFF;
          background: rgba(0, 122, 255, 0.1);
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
        }
        
        .note-date {
          font-size: 22rpx;
          color: #999999;
        }
      }
      
      .meta-right {
        .word-count {
          font-size: 22rpx;
          color: #999999;
        }
      }
    }
  }
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  
  .note-card {
    background: #ffffff;
    border-radius: 16rpx;
    padding: 24rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:active {
      transform: translateY(2rpx);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;
      
      .note-type-icon {
        font-size: 32rpx;
      }
      
      .card-actions {
        .action-btn {
          font-size: 24rpx;
          padding: 8rpx;
        }
      }
    }
    
    .card-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 12rpx;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .card-content {
      font-size: 24rpx;
      color: #666666;
      line-height: 1.5;
      margin-bottom: 16rpx;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .card-date, .card-words {
        font-size: 20rpx;
        color: #999999;
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
  
  .icon-plus {
    font-size: 48rpx;
    color: #ffffff;
  }
}

.filter-content {
  background: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
  
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
  
  .filter-options {
    padding: 24rpx 32rpx;
    max-height: 50vh;
    overflow-y: auto;
    
    .filter-group {
      margin-bottom: 32rpx;
      
      .group-title {
        font-size: 28rpx;
        font-weight: bold;
        color: #333333;
        margin-bottom: 16rpx;
      }
      
      .option-list {
        .option-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24rpx 0;
          border-bottom: 1rpx solid #f0f0f0;
          
          &:last-child {
            border-bottom: none;
          }
          
          &.active {
            .option-text {
              color: #007AFF;
              font-weight: bold;
            }
          }
          
          .option-text {
            font-size: 28rpx;
            color: #333333;
          }
          
          .option-check {
            font-size: 28rpx;
            color: #007AFF;
          }
        }
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
      
      &.reset {
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
</style>
