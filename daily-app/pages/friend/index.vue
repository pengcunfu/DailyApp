<template>
  <view class="friend-container">
    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-bar">
        <text class="iconfont icon-search">🔍</text>
        <input 
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索朋友姓名或备注"
          @input="onSearchInput"
        />
        <text class="iconfont icon-clear" v-if="searchKeyword" @tap="clearSearch">❌</text>
      </view>
    </view>
    
    <!-- 统计卡片 -->
    <view class="stats-section">
      <view class="stat-card">
        <view class="stat-icon">👥</view>
        <view class="stat-info">
          <view class="stat-value">{{ friendStats.totalCount || 0 }}</view>
          <view class="stat-label">总朋友数</view>
        </view>
      </view>
      <view class="stat-card">
        <view class="stat-icon">🎂</view>
        <view class="stat-info">
          <view class="stat-value">{{ friendStats.birthdayCount || 0 }}</view>
          <view class="stat-label">本月生日</view>
        </view>
      </view>
      <view class="stat-card">
        <view class="stat-icon">📞</view>
        <view class="stat-info">
          <view class="stat-value">{{ friendStats.contactCount || 0 }}</view>
          <view class="stat-label">近期联系</view>
        </view>
      </view>
    </view>
    
    <!-- 快捷操作 -->
    <view class="quick-actions">
      <view class="action-item" @tap="goToBirthdays">
        <view class="action-icon birthday">🎂</view>
        <text class="action-text">生日提醒</text>
      </view>
      <view class="action-item" @tap="showGroupSelector">
        <view class="action-icon group">👥</view>
        <text class="action-text">分组管理</text>
      </view>
      <view class="action-item" @tap="goToAdd">
        <view class="action-icon add">➕</view>
        <text class="action-text">添加朋友</text>
      </view>
    </view>
    
    <!-- 朋友列表 -->
    <view class="friend-list">
      <!-- 分组标题 -->
      <view class="section-header" v-if="filteredFriends.length > 0">
        <text class="friend-count">共 {{ filteredFriends.length }} 位朋友</text>
        <view class="sort-options">
          <text 
            class="sort-btn"
            :class="{ active: sortBy === 'name' }"
            @tap="setSortBy('name')"
          >姓名</text>
          <text 
            class="sort-btn"
            :class="{ active: sortBy === 'birthday' }"
            @tap="setSortBy('birthday')"
          >生日</text>
          <text 
            class="sort-btn"
            :class="{ active: sortBy === 'recent' }"
            @tap="setSortBy('recent')"
          >最近</text>
        </view>
      </view>
      
      <!-- 朋友卡片 -->
      <view 
        class="friend-item"
        v-for="friend in sortedFriends"
        :key="friend.id"
        @tap="goToDetail(friend)"
      >
        <view class="friend-avatar">
          <image 
            :src="friend.avatar || '/static/default-avatar.png'" 
            mode="aspectFill"
            class="avatar-img"
          ></image>
          <view class="online-status" v-if="friend.isOnline"></view>
        </view>
        
        <view class="friend-info">
          <view class="friend-header">
            <view class="friend-name">{{ friend.name }}</view>
            <view class="friend-tags" v-if="friend.tags && friend.tags.length > 0">
              <text 
                class="friend-tag"
                v-for="tag in friend.tags.slice(0, 2)"
                :key="tag"
              >{{ tag }}</text>
            </view>
          </view>
          
          <view class="friend-details">
            <text class="friend-remark" v-if="friend.remark">{{ friend.remark }}</text>
            <text class="friend-phone" v-if="friend.phone">📱 {{ friend.phone }}</text>
          </view>
          
          <view class="friend-meta">
            <text class="birthday-info" v-if="friend.birthday">
              🎂 {{ formatBirthday(friend.birthday) }}
              <text class="days-until" v-if="getDaysUntilBirthday(friend.birthday) >= 0">
                ({{ getDaysUntilBirthday(friend.birthday) }}天后)
              </text>
            </text>
            <text class="last-contact" v-if="friend.lastContactAt">
              最近联系：{{ formatDate(friend.lastContactAt) }}
            </text>
          </view>
        </view>
        
        <view class="friend-actions">
          <view class="action-btn call" @tap.stop="callFriend(friend)" v-if="friend.phone">
            📞
          </view>
          <view class="action-btn message" @tap.stop="messageFriend(friend)" v-if="friend.phone">
            💬
          </view>
          <view class="action-btn more" @tap.stop="showActionSheet(friend)">
            ⋮
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredFriends.length === 0 && !loading">
        <image src="/static/empty-friend.png" class="empty-image" mode="aspectFit"></image>
        <text class="empty-text">{{ getEmptyText() }}</text>
        <button class="empty-btn" @tap="goToAdd" v-if="!searchKeyword">
          添加第一位朋友
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
    
    <!-- 分组选择弹窗 -->
    <uni-popup ref="groupPopup" type="bottom">
      <view class="group-selector">
        <view class="popup-header">
          <text class="popup-title">朋友分组</text>
          <text class="popup-close" @tap="closeGroupSelector">×</text>
        </view>
        <view class="group-list">
          <view 
            class="group-item"
            :class="{ active: selectedGroup === group.key }"
            v-for="group in friendGroups"
            :key="group.key"
            @tap="selectGroup(group.key)"
          >
            <view class="group-icon">{{ group.icon }}</view>
            <view class="group-info">
              <view class="group-name">{{ group.name }}</view>
              <view class="group-count">{{ getGroupCount(group.key) }}人</view>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { friendAPI } from '@/api/index'
import dayjs from 'dayjs'

export default {
  name: 'FriendIndex',
  data() {
    return {
      loading: false,
      friends: [],
      searchKeyword: '',
      sortBy: 'name',
      selectedGroup: 'all',
      
      // 统计数据
      friendStats: {
        totalCount: 0,
        birthdayCount: 0,
        contactCount: 0
      },
      
      // 朋友分组
      friendGroups: [
        { key: 'all', name: '全部朋友', icon: '👥' },
        { key: 'family', name: '家人', icon: '👨‍👩‍👧‍👦' },
        { key: 'colleague', name: '同事', icon: '💼' },
        { key: 'classmate', name: '同学', icon: '🎓' },
        { key: 'friend', name: '朋友', icon: '👫' },
        { key: 'other', name: '其他', icon: '👤' }
      ]
    }
  },
  
  computed: {
    // 过滤后的朋友列表
    filteredFriends() {
      let filtered = [...this.friends]
      
      // 分组筛选
      if (this.selectedGroup !== 'all') {
        filtered = filtered.filter(friend => 
          friend.group === this.selectedGroup || 
          (friend.tags && friend.tags.includes(this.selectedGroup))
        )
      }
      
      // 搜索筛选
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        filtered = filtered.filter(friend => 
          friend.name.toLowerCase().includes(keyword) ||
          (friend.remark && friend.remark.toLowerCase().includes(keyword)) ||
          (friend.phone && friend.phone.includes(keyword))
        )
      }
      
      return filtered
    },
    
    // 排序后的朋友列表
    sortedFriends() {
      const sorted = [...this.filteredFriends]
      
      switch (this.sortBy) {
        case 'name':
          return sorted.sort((a, b) => a.name.localeCompare(b.name))
        case 'birthday':
          return sorted.sort((a, b) => {
            if (!a.birthday && !b.birthday) return 0
            if (!a.birthday) return 1
            if (!b.birthday) return -1
            const daysA = this.getDaysUntilBirthday(a.birthday)
            const daysB = this.getDaysUntilBirthday(b.birthday)
            return daysA - daysB
          })
        case 'recent':
          return sorted.sort((a, b) => {
            if (!a.lastContactAt && !b.lastContactAt) return 0
            if (!a.lastContactAt) return 1
            if (!b.lastContactAt) return -1
            return new Date(b.lastContactAt) - new Date(a.lastContactAt)
          })
        default:
          return sorted
      }
    }
  },
  
  onShow() {
    this.loadFriends()
    this.loadFriendStats()
  },
  
  onPullDownRefresh() {
    this.refreshData()
  },
  
  methods: {
    // 加载朋友列表
    async loadFriends() {
      try {
        this.loading = true
        const response = await friendAPI.getList()
        this.friends = response.data?.friends || []
      } catch (error) {
        console.error('加载朋友列表失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 加载朋友统计
    async loadFriendStats() {
      try {
        const response = await friendAPI.getStats()
        this.friendStats = response.data || {}
      } catch (error) {
        console.error('加载统计失败:', error)
      }
    },
    
    // 刷新数据
    async refreshData() {
      await Promise.all([
        this.loadFriends(),
        this.loadFriendStats()
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
    
    // 设置排序方式
    setSortBy(sortBy) {
      this.sortBy = sortBy
    },
    
    // 显示分组选择器
    showGroupSelector() {
      this.$refs.groupPopup.open()
    },
    
    // 关闭分组选择器
    closeGroupSelector() {
      this.$refs.groupPopup.close()
    },
    
    // 选择分组
    selectGroup(groupKey) {
      this.selectedGroup = groupKey
      this.closeGroupSelector()
    },
    
    // 获取分组人数
    getGroupCount(groupKey) {
      if (groupKey === 'all') {
        return this.friends.length
      }
      return this.friends.filter(friend => 
        friend.group === groupKey || 
        (friend.tags && friend.tags.includes(groupKey))
      ).length
    },
    
    // 拨打电话
    callFriend(friend) {
      if (!friend.phone) {
        uni.showToast({
          title: '该朋友未设置电话',
          icon: 'none'
        })
        return
      }
      
      uni.makePhoneCall({
        phoneNumber: friend.phone,
        success: () => {
          // 记录联系时间
          this.updateLastContact(friend.id)
        }
      })
    },
    
    // 发送消息
    messageFriend(friend) {
      if (!friend.phone) {
        uni.showToast({
          title: '该朋友未设置电话',
          icon: 'none'
        })
        return
      }
      
      // 这里可以集成短信功能或跳转到聊天应用
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    // 显示操作菜单
    showActionSheet(friend) {
      uni.showActionSheet({
        itemList: ['编辑资料', '查看详情', '删除朋友'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.goToEdit(friend)
              break
            case 1:
              this.goToDetail(friend)
              break
            case 2:
              this.showDeleteConfirm(friend)
              break
          }
        }
      })
    },
    
    // 更新最后联系时间
    async updateLastContact(friendId) {
      try {
        await friendAPI.update(friendId, {
          lastContactAt: new Date().toISOString()
        })
        
        // 更新本地数据
        const index = this.friends.findIndex(f => f.id === friendId)
        if (index !== -1) {
          this.friends[index].lastContactAt = new Date().toISOString()
        }
      } catch (error) {
        console.error('更新联系时间失败:', error)
      }
    },
    
    // 显示删除确认
    showDeleteConfirm(friend) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除朋友"${friend.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await friendAPI.delete(friend.id)
              
              // 从列表中移除
              const index = this.friends.findIndex(f => f.id === friend.id)
              if (index !== -1) {
                this.friends.splice(index, 1)
              }
              
              // 更新统计
              this.loadFriendStats()
              
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
            }
          }
        }
      })
    },
    
    // 跳转到生日页面
    goToBirthdays() {
      uni.navigateTo({
        url: '/pages/friend/birthday'
      })
    },
    
    // 跳转到详情页
    goToDetail(friend) {
      uni.navigateTo({
        url: `/pages/friend/detail?id=${friend.id}`
      })
    },
    
    // 跳转到编辑页
    goToEdit(friend) {
      uni.navigateTo({
        url: `/pages/friend/add?id=${friend.id}`
      })
    },
    
    // 跳转到添加页
    goToAdd() {
      uni.navigateTo({
        url: '/pages/friend/add'
      })
    },
    
    // 获取距离生日的天数
    getDaysUntilBirthday(birthday) {
      if (!birthday) return -1
      
      const today = dayjs()
      const birthDate = dayjs(birthday)
      let nextBirthday = birthDate.year(today.year())
      
      // 如果今年的生日已过，计算明年的生日
      if (nextBirthday.isBefore(today, 'day')) {
        nextBirthday = nextBirthday.year(today.year() + 1)
      }
      
      return nextBirthday.diff(today, 'day')
    },
    
    // 格式化生日显示
    formatBirthday(birthday) {
      if (!birthday) return ''
      return dayjs(birthday).format('MM-DD')
    },
    
    // 格式化日期
    formatDate(date) {
      if (!date) return ''
      
      const now = dayjs()
      const target = dayjs(date)
      
      if (target.isSame(now, 'day')) {
        return '今天'
      } else if (target.isSame(now.subtract(1, 'day'), 'day')) {
        return '昨天'
      } else if (target.isAfter(now.subtract(7, 'day'))) {
        return target.format('MM-DD')
      } else {
        return target.format('YYYY-MM-DD')
      }
    },
    
    // 获取空状态文本
    getEmptyText() {
      if (this.searchKeyword) {
        return `未找到包含"${this.searchKeyword}"的朋友`
      }
      if (this.selectedGroup !== 'all') {
        const group = this.friendGroups.find(g => g.key === this.selectedGroup)
        return `暂无${group?.name || '该分组'}朋友`
      }
      return '暂无朋友'
    }
  }
}
</script>

<style lang="scss" scoped>
.friend-container {
  background: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.search-section {
  padding: 32rpx;
  
  .search-bar {
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
}

.stats-section {
  display: flex;
  padding: 0 32rpx 32rpx;
  gap: 16rpx;
  
  .stat-card {
    flex: 1;
    background: #ffffff;
    border-radius: 16rpx;
    padding: 24rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    
    .stat-icon {
      font-size: 48rpx;
      margin-right: 16rpx;
    }
    
    .stat-info {
      flex: 1;
      
      .stat-value {
        font-size: 32rpx;
        font-weight: bold;
        color: #333333;
        margin-bottom: 4rpx;
      }
      
      .stat-label {
        font-size: 22rpx;
        color: #666666;
      }
    }
  }
}

.quick-actions {
  display: flex;
  padding: 0 32rpx 32rpx;
  gap: 24rpx;
  
  .action-item {
    flex: 1;
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
      font-size: 36rpx;
      color: #ffffff;
      
      &.birthday {
        background: #FF6B6B;
      }
      
      &.group {
        background: #4ECDC4;
      }
      
      &.add {
        background: #007AFF;
      }
    }
    
    .action-text {
      font-size: 24rpx;
      color: #666666;
    }
  }
}

.friend-list {
  padding: 0 32rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .friend-count {
      font-size: 24rpx;
      color: #999999;
    }
    
    .sort-options {
      display: flex;
      background: #ffffff;
      border-radius: 8rpx;
      padding: 4rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
      
      .sort-btn {
        padding: 12rpx 24rpx;
        font-size: 24rpx;
        color: #666666;
        border-radius: 6rpx;
        transition: all 0.3s ease;
        
        &.active {
          background: #007AFF;
          color: #ffffff;
        }
      }
    }
  }
  
  .friend-item {
    display: flex;
    align-items: flex-start;
    background: #ffffff;
    border-radius: 16rpx;
    padding: 32rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:active {
      transform: translateY(2rpx);
    }
    
    .friend-avatar {
      position: relative;
      margin-right: 24rpx;
      
      .avatar-img {
        width: 96rpx;
        height: 96rpx;
        border-radius: 48rpx;
        border: 2rpx solid #f0f0f0;
      }
      
      .online-status {
        position: absolute;
        right: 4rpx;
        bottom: 4rpx;
        width: 24rpx;
        height: 24rpx;
        background: #28a745;
        border-radius: 12rpx;
        border: 3rpx solid #ffffff;
      }
    }
    
    .friend-info {
      flex: 1;
      min-width: 0;
      
      .friend-header {
        display: flex;
        align-items: center;
        margin-bottom: 12rpx;
        
        .friend-name {
          font-size: 32rpx;
          font-weight: bold;
          color: #333333;
          margin-right: 16rpx;
        }
        
        .friend-tags {
          display: flex;
          gap: 8rpx;
          
          .friend-tag {
            font-size: 20rpx;
            color: #007AFF;
            background: rgba(0, 122, 255, 0.1);
            padding: 4rpx 12rpx;
            border-radius: 12rpx;
          }
        }
      }
      
      .friend-details {
        margin-bottom: 12rpx;
        
        .friend-remark {
          display: block;
          font-size: 26rpx;
          color: #666666;
          margin-bottom: 4rpx;
        }
        
        .friend-phone {
          font-size: 24rpx;
          color: #999999;
        }
      }
      
      .friend-meta {
        .birthday-info {
          display: block;
          font-size: 24rpx;
          color: #007AFF;
          margin-bottom: 4rpx;
          
          .days-until {
            color: #FF6B6B;
          }
        }
        
        .last-contact {
          font-size: 22rpx;
          color: #999999;
        }
      }
    }
    
    .friend-actions {
      display: flex;
      flex-direction: column;
      gap: 12rpx;
      margin-left: 16rpx;
      
      .action-btn {
        width: 56rpx;
        height: 56rpx;
        border-radius: 28rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        transition: all 0.3s ease;
        
        &.call {
          background: rgba(40, 167, 69, 0.1);
          color: #28a745;
        }
        
        &.message {
          background: rgba(0, 122, 255, 0.1);
          color: #007AFF;
        }
        
        &.more {
          background: rgba(108, 117, 125, 0.1);
          color: #6c757d;
        }
        
        &:active {
          transform: scale(0.9);
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
  
  .icon-plus {
    font-size: 48rpx;
    color: #ffffff;
  }
}

.group-selector {
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
  
  .group-list {
    padding: 24rpx;
    max-height: 50vh;
    overflow-y: auto;
    
    .group-item {
      display: flex;
      align-items: center;
      padding: 24rpx;
      border-radius: 16rpx;
      margin-bottom: 16rpx;
      transition: all 0.3s ease;
      
      &.active {
        background: rgba(0, 122, 255, 0.1);
        
        .group-name {
          color: #007AFF;
          font-weight: bold;
        }
      }
      
      &:active {
        background: #f8f9fa;
      }
      
      .group-icon {
        font-size: 48rpx;
        margin-right: 24rpx;
      }
      
      .group-info {
        flex: 1;
        
        .group-name {
          font-size: 30rpx;
          color: #333333;
          margin-bottom: 8rpx;
        }
        
        .group-count {
          font-size: 24rpx;
          color: #666666;
        }
      }
    }
  }
}

/* 图标字体样式 */
.iconfont {
  font-family: 'iconfont';
}
</style>
