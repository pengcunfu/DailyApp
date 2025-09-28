<template>
  <view class="bill-container">
    <!-- 顶部统计卡片 -->
    <view class="stats-header">
      <view class="stat-card income">
        <view class="stat-label">本月收入</view>
        <view class="stat-value">¥{{ monthStats.income || 0 }}</view>
      </view>
      <view class="stat-card expense">
        <view class="stat-label">本月支出</view>
        <view class="stat-value">¥{{ monthStats.expense || 0 }}</view>
      </view>
      <view class="stat-card balance">
        <view class="stat-label">本月结余</view>
        <view class="stat-value">¥{{ monthStats.balance || 0 }}</view>
      </view>
    </view>
    
    <!-- 筛选条件 -->
    <view class="filter-section">
      <view class="filter-tabs">
        <view 
          class="filter-tab"
          :class="{ active: activeTab === tab.key }"
          v-for="tab in filterTabs"
          :key="tab.key"
          @tap="switchTab(tab.key)"
        >
          {{ tab.name }}
        </view>
      </view>
      
      <view class="filter-actions">
        <view class="filter-btn" @tap="showDatePicker">
          <text class="iconfont icon-calendar"></text>
          <text>{{ dateRange }}</text>
        </view>
        <view class="filter-btn" @tap="showCategoryFilter">
          <text class="iconfont icon-filter"></text>
          <text>分类</text>
        </view>
      </view>
    </view>
    
    <!-- 账单列表 -->
    <view class="bill-list">
      <view class="list-header" v-if="bills.length > 0">
        <text class="total-count">共 {{ totalCount }} 条记录</text>
      </view>
      
      <view class="bill-item" v-for="bill in bills" :key="bill.id" @tap="goToDetail(bill)">
        <view class="bill-icon" :style="{ backgroundColor: bill.category?.color || '#007AFF' }">
          <text class="iconfont">{{ bill.category?.icon || '💰' }}</text>
        </view>
        
        <view class="bill-content">
          <view class="bill-title">{{ bill.orderName }}</view>
          <view class="bill-info">
            <text class="bill-category">{{ bill.category?.name || '其他' }}</text>
            <text class="bill-time">{{ formatDate(bill.spendingTime) }}</text>
          </view>
        </view>
        
        <view class="bill-amount" :class="{ income: bill.type === 1, expense: bill.type === 0 }">
          {{ bill.type === 1 ? '+' : '-' }}¥{{ bill.amount }}
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="bills.length === 0 && !loading">
        <image src="/static/empty-bill.png" class="empty-image" mode="aspectFit"></image>
        <text class="empty-text">暂无账单记录</text>
        <button class="empty-btn" @tap="goToAdd">添加第一笔账单</button>
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
    
    <!-- 日期选择器 -->
    <uni-datetime-picker 
      ref="datetimePicker"
      type="daterange"
      :value="selectedDateRange"
      @change="onDateRangeChange"
    />
    
    <!-- 分类筛选弹窗 -->
    <uni-popup ref="categoryPopup" type="bottom">
      <view class="category-filter">
        <view class="popup-header">
          <text class="popup-title">选择分类</text>
          <text class="popup-close" @tap="closeCategoryFilter">取消</text>
        </view>
        <view class="category-list">
          <view 
            class="category-item"
            :class="{ active: selectedCategoryId === category.id }"
            v-for="category in categories"
            :key="category.id"
            @tap="selectCategory(category)"
          >
            <view class="category-icon" :style="{ backgroundColor: category.color }">
              <text class="iconfont">{{ category.icon }}</text>
            </view>
            <text class="category-name">{{ category.name }}</text>
          </view>
        </view>
        <view class="popup-actions">
          <button class="popup-btn confirm" @tap="confirmCategoryFilter">确定</button>
          <button class="popup-btn cancel" @tap="resetCategoryFilter">重置</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { billAPI } from '@/api/index'
import dayjs from 'dayjs'

export default {
  name: 'BillIndex',
  data() {
    return {
      loading: false,
      bills: [],
      totalCount: 0,
      currentPage: 1,
      pageSize: 20,
      
      // 统计数据
      monthStats: {
        income: 0,
        expense: 0,
        balance: 0
      },
      
      // 筛选条件
      activeTab: 'all',
      filterTabs: [
        { key: 'all', name: '全部' },
        { key: 'expense', name: '支出' },
        { key: 'income', name: '收入' }
      ],
      
      selectedDateRange: [],
      selectedCategoryId: null,
      categories: []
    }
  },
  
  computed: {
    dateRange() {
      if (this.selectedDateRange.length === 2) {
        const start = dayjs(this.selectedDateRange[0]).format('MM-DD')
        const end = dayjs(this.selectedDateRange[1]).format('MM-DD')
        return `${start} 至 ${end}`
      }
      return '选择日期'
    }
  },
  
  onLoad() {
    this.initData()
  },
  
  onShow() {
    this.loadBills()
    this.loadMonthStats()
  },
  
  onReachBottom() {
    this.loadMore()
  },
  
  onPullDownRefresh() {
    this.refreshData()
  },
  
  methods: {
    // 初始化数据
    async initData() {
      await this.loadCategories()
      await this.loadBills()
      await this.loadMonthStats()
    },
    
    // 加载账单列表
    async loadBills(reset = false) {
      if (this.loading) return
      
      try {
        this.loading = true
        
        if (reset) {
          this.currentPage = 1
          this.bills = []
        }
        
        const params = {
          page: this.currentPage,
          limit: this.pageSize,
          type: this.activeTab === 'all' ? undefined : (this.activeTab === 'income' ? 1 : 0),
          categoryId: this.selectedCategoryId,
          startDate: this.selectedDateRange[0],
          endDate: this.selectedDateRange[1]
        }
        
        const response = await billAPI.getList(params)
        const { bills, total } = response.data
        
        if (reset) {
          this.bills = bills
        } else {
          this.bills = [...this.bills, ...bills]
        }
        
        this.totalCount = total
        this.currentPage++
        
      } catch (error) {
        console.error('加载账单失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 加载月度统计
    async loadMonthStats() {
      try {
        const startDate = dayjs().startOf('month').format('YYYY-MM-DD')
        const endDate = dayjs().endOf('month').format('YYYY-MM-DD')
        
        const response = await billAPI.getStats({
          startDate,
          endDate
        })
        
        this.monthStats = response.data
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    },
    
    // 加载分类列表
    async loadCategories() {
      try {
        const response = await billAPI.getCategories()
        this.categories = [
          { id: null, name: '全部', icon: '📋', color: '#999999' },
          ...response.data
        ]
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    },
    
    // 切换标签页
    switchTab(tab) {
      if (this.activeTab === tab) return
      
      this.activeTab = tab
      this.loadBills(true)
    },
    
    // 显示日期选择器
    showDatePicker() {
      this.$refs.datetimePicker.show()
    },
    
    // 日期范围改变
    onDateRangeChange(e) {
      this.selectedDateRange = e
      this.loadBills(true)
    },
    
    // 显示分类筛选
    showCategoryFilter() {
      this.$refs.categoryPopup.open()
    },
    
    // 关闭分类筛选
    closeCategoryFilter() {
      this.$refs.categoryPopup.close()
    },
    
    // 选择分类
    selectCategory(category) {
      this.selectedCategoryId = category.id
    },
    
    // 确认分类筛选
    confirmCategoryFilter() {
      this.closeCategoryFilter()
      this.loadBills(true)
    },
    
    // 重置分类筛选
    resetCategoryFilter() {
      this.selectedCategoryId = null
      this.confirmCategoryFilter()
    },
    
    // 加载更多
    loadMore() {
      if (this.bills.length < this.totalCount) {
        this.loadBills()
      }
    },
    
    // 刷新数据
    async refreshData() {
      await Promise.all([
        this.loadBills(true),
        this.loadMonthStats()
      ])
      uni.stopPullDownRefresh()
    },
    
    // 跳转到详情页
    goToDetail(bill) {
      uni.navigateTo({
        url: `/pages/bill/detail?id=${bill.id}`
      })
    },
    
    // 跳转到添加页面
    goToAdd() {
      uni.navigateTo({
        url: '/pages/bill/add'
      })
    },
    
    // 格式化日期
    formatDate(date) {
      return dayjs(date).format('MM-DD HH:mm')
    }
  }
}
</script>

<style lang="scss" scoped>
.bill-container {
  background: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.stats-header {
  display: flex;
  padding: 32rpx;
  gap: 16rpx;
  
  .stat-card {
    flex: 1;
    background: #ffffff;
    border-radius: 16rpx;
    padding: 24rpx;
    text-align: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    
    .stat-label {
      font-size: 24rpx;
      color: #666666;
      margin-bottom: 8rpx;
    }
    
    .stat-value {
      font-size: 32rpx;
      font-weight: bold;
    }
    
    &.income .stat-value {
      color: #28a745;
    }
    
    &.expense .stat-value {
      color: #dc3545;
    }
    
    &.balance .stat-value {
      color: #007AFF;
    }
  }
}

.filter-section {
  background: #ffffff;
  margin: 0 32rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  .filter-tabs {
    display: flex;
    margin-bottom: 24rpx;
    
    .filter-tab {
      flex: 1;
      text-align: center;
      padding: 16rpx;
      font-size: 28rpx;
      color: #666666;
      border-radius: 8rpx;
      transition: all 0.3s ease;
      
      &.active {
        background: #007AFF;
        color: #ffffff;
      }
    }
  }
  
  .filter-actions {
    display: flex;
    gap: 24rpx;
    
    .filter-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16rpx;
      background: #f8f9fa;
      border-radius: 8rpx;
      font-size: 26rpx;
      color: #666666;
      
      .iconfont {
        margin-right: 8rpx;
        font-size: 28rpx;
      }
    }
  }
}

.bill-list {
  margin: 0 32rpx;
  
  .list-header {
    padding: 16rpx 0;
    
    .total-count {
      font-size: 24rpx;
      color: #999999;
    }
  }
  
  .bill-item {
    display: flex;
    align-items: center;
    background: #ffffff;
    padding: 32rpx;
    margin-bottom: 16rpx;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:active {
      transform: translateY(2rpx);
    }
    
    .bill-icon {
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
    
    .bill-content {
      flex: 1;
      
      .bill-title {
        font-size: 30rpx;
        color: #333333;
        margin-bottom: 8rpx;
        font-weight: 500;
      }
      
      .bill-info {
        display: flex;
        align-items: center;
        gap: 16rpx;
        
        .bill-category, .bill-time {
          font-size: 24rpx;
          color: #999999;
        }
      }
    }
    
    .bill-amount {
      font-size: 32rpx;
      font-weight: bold;
      
      &.income {
        color: #28a745;
      }
      
      &.expense {
        color: #dc3545;
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

.category-filter {
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
      font-size: 28rpx;
      color: #007AFF;
    }
  }
  
  .category-list {
    max-height: 60vh;
    overflow-y: auto;
    padding: 24rpx;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24rpx;
    
    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24rpx;
      border-radius: 16rpx;
      transition: all 0.3s ease;
      
      &.active {
        background: rgba(0, 122, 255, 0.1);
      }
      
      .category-icon {
        width: 72rpx;
        height: 72rpx;
        border-radius: 36rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12rpx;
        
        .iconfont {
          font-size: 28rpx;
          color: #ffffff;
        }
      }
      
      .category-name {
        font-size: 24rpx;
        color: #666666;
      }
    }
  }
  
  .popup-actions {
    display: flex;
    padding: 24rpx;
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

.icon-calendar::before { content: '📅'; }
.icon-filter::before { content: '🔍'; }
.icon-plus::before { content: '➕'; }
</style>
