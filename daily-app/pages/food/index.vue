<template>
  <view class="food-container">
    <!-- 顶部统计卡片 -->
    <view class="stats-header">
      <view class="stat-card">
        <view class="stat-icon">🍽️</view>
        <view class="stat-info">
          <view class="stat-value">{{ todayStats.mealCount || 0 }}</view>
          <view class="stat-label">今日用餐</view>
        </view>
      </view>
      <view class="stat-card">
        <view class="stat-icon">🔥</view>
        <view class="stat-info">
          <view class="stat-value">{{ todayStats.calories || 0 }}</view>
          <view class="stat-label">卡路里</view>
        </view>
      </view>
      <view class="stat-card">
        <view class="stat-icon">⚖️</view>
        <view class="stat-info">
          <view class="stat-value">{{ todayStats.weight || '--' }}</view>
          <view class="stat-label">体重(kg)</view>
        </view>
      </view>
    </view>
    
    <!-- 日期选择器 -->
    <view class="date-selector">
      <view class="date-nav">
        <text class="nav-btn" @tap="changeDate(-1)">◀</text>
        <picker 
          mode="date" 
          :value="selectedDate"
          @change="onDateChange"
        >
          <view class="date-display">
            <text class="date-text">{{ formatDisplayDate(selectedDate) }}</text>
            <text class="date-weekday">{{ getWeekday(selectedDate) }}</text>
          </view>
        </picker>
        <text class="nav-btn" @tap="changeDate(1)">▶</text>
      </view>
      
      <view class="quick-dates">
        <view 
          class="quick-date"
          :class="{ active: selectedDate === quickDate.value }"
          v-for="quickDate in quickDates"
          :key="quickDate.value"
          @tap="selectQuickDate(quickDate.value)"
        >
          {{ quickDate.name }}
        </view>
      </view>
    </view>
    
    <!-- 用餐时段 -->
    <view class="meal-sections">
      <view 
        class="meal-section"
        v-for="meal in mealSections"
        :key="meal.type"
      >
        <view class="meal-header">
          <view class="meal-info">
            <text class="meal-icon">{{ meal.icon }}</text>
            <text class="meal-name">{{ meal.name }}</text>
            <text class="meal-time">{{ meal.time }}</text>
          </view>
          <view class="meal-stats">
            <text class="meal-calories">{{ getMealCalories(meal.type) }} 卡</text>
            <text class="add-btn" @tap="addFood(meal.type)">➕</text>
          </view>
        </view>
        
        <view class="food-list" v-if="getMealFoods(meal.type).length > 0">
          <view 
            class="food-item"
            v-for="food in getMealFoods(meal.type)"
            :key="food.id"
            @tap="goToDetail(food)"
          >
            <view class="food-image">
              <image 
                :src="food.image || '/static/default-food.png'" 
                mode="aspectFill"
                class="food-img"
              ></image>
            </view>
            <view class="food-content">
              <view class="food-name">{{ food.name }}</view>
              <view class="food-desc">{{ food.description || '暂无描述' }}</view>
              <view class="food-nutrition">
                <text class="nutrition-item">{{ food.calories || 0 }}卡</text>
                <text class="nutrition-item">{{ food.protein || 0 }}g蛋白质</text>
              </view>
            </view>
            <view class="food-actions">
              <text class="action-btn edit" @tap.stop="editFood(food)">✏️</text>
              <text class="action-btn delete" @tap.stop="showDeleteConfirm(food)">🗑️</text>
            </view>
          </view>
        </view>
        
        <view class="empty-meal" v-else>
          <text class="empty-text">暂无{{ meal.name }}记录</text>
          <button class="empty-add-btn" @tap="addFood(meal.type)">
            添加{{ meal.name }}
          </button>
        </view>
      </view>
    </view>
    
    <!-- 营养总结 -->
    <view class="nutrition-summary" v-if="dayFoods.length > 0">
      <view class="summary-header">
        <text class="summary-title">营养总结</text>
        <text class="summary-date">{{ formatDisplayDate(selectedDate) }}</text>
      </view>
      
      <view class="nutrition-grid">
        <view class="nutrition-item">
          <view class="nutrition-value">{{ totalNutrition.calories }}</view>
          <view class="nutrition-label">卡路里</view>
          <view class="nutrition-bar">
            <view 
              class="nutrition-progress"
              :style="{ width: Math.min(totalNutrition.calories / 2000 * 100, 100) + '%' }"
            ></view>
          </view>
        </view>
        
        <view class="nutrition-item">
          <view class="nutrition-value">{{ totalNutrition.protein }}g</view>
          <view class="nutrition-label">蛋白质</view>
          <view class="nutrition-bar">
            <view 
              class="nutrition-progress protein"
              :style="{ width: Math.min(totalNutrition.protein / 60 * 100, 100) + '%' }"
            ></view>
          </view>
        </view>
        
        <view class="nutrition-item">
          <view class="nutrition-value">{{ totalNutrition.carbs }}g</view>
          <view class="nutrition-label">碳水</view>
          <view class="nutrition-bar">
            <view 
              class="nutrition-progress carbs"
              :style="{ width: Math.min(totalNutrition.carbs / 250 * 100, 100) + '%' }"
            ></view>
          </view>
        </view>
        
        <view class="nutrition-item">
          <view class="nutrition-value">{{ totalNutrition.fat }}g</view>
          <view class="nutrition-label">脂肪</view>
          <view class="nutrition-bar">
            <view 
              class="nutrition-progress fat"
              :style="{ width: Math.min(totalNutrition.fat / 65 * 100, 100) + '%' }"
            ></view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 悬浮添加按钮 -->
    <view class="fab-button" @tap="showMealSelector">
      <text class="iconfont icon-plus">➕</text>
    </view>
    
    <!-- 用餐类型选择弹窗 -->
    <uni-popup ref="mealPopup" type="bottom">
      <view class="meal-selector">
        <view class="popup-header">
          <text class="popup-title">选择用餐时段</text>
          <text class="popup-close" @tap="closeMealSelector">×</text>
        </view>
        <view class="meal-options">
          <view 
            class="meal-option"
            v-for="meal in mealSections"
            :key="meal.type"
            @tap="addFood(meal.type)"
          >
            <view class="option-icon">{{ meal.icon }}</view>
            <view class="option-content">
              <view class="option-name">{{ meal.name }}</view>
              <view class="option-time">{{ meal.time }}</view>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
    
    <!-- 删除确认弹窗 -->
    <uni-popup ref="deletePopup" type="dialog">
      <uni-popup-dialog 
        type="warn"
        title="确认删除"
        content="确定要删除这条美食记录吗？"
        @confirm="confirmDelete"
        @close="cancelDelete"
      ></uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script>
import { foodAPI } from '@/api/index'
import dayjs from 'dayjs'

export default {
  name: 'FoodIndex',
  data() {
    return {
      loading: false,
      foods: [],
      selectedDate: dayjs().format('YYYY-MM-DD'),
      deleteTarget: null,
      
      // 今日统计
      todayStats: {
        mealCount: 0,
        calories: 0,
        weight: null
      },
      
      // 快捷日期选择
      quickDates: [
        { name: '昨天', value: dayjs().subtract(1, 'day').format('YYYY-MM-DD') },
        { name: '今天', value: dayjs().format('YYYY-MM-DD') },
        { name: '明天', value: dayjs().add(1, 'day').format('YYYY-MM-DD') }
      ],
      
      // 用餐时段
      mealSections: [
        { type: 'breakfast', name: '早餐', icon: '🌅', time: '06:00-10:00' },
        { type: 'lunch', name: '午餐', icon: '☀️', time: '11:00-14:00' },
        { type: 'dinner', name: '晚餐', icon: '🌙', time: '17:00-21:00' },
        { type: 'snack', name: '加餐', icon: '🍎', time: '其他时间' }
      ]
    }
  },
  
  computed: {
    // 当日美食记录
    dayFoods() {
      return this.foods.filter(food => 
        dayjs(food.mealTime).format('YYYY-MM-DD') === this.selectedDate
      )
    },
    
    // 营养总计
    totalNutrition() {
      return this.dayFoods.reduce((total, food) => {
        return {
          calories: total.calories + (food.calories || 0),
          protein: total.protein + (food.protein || 0),
          carbs: total.carbs + (food.carbs || 0),
          fat: total.fat + (food.fat || 0)
        }
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
    }
  },
  
  onShow() {
    this.loadFoods()
    this.loadTodayStats()
  },
  
  onPullDownRefresh() {
    this.refreshData()
  },
  
  methods: {
    // 加载美食记录
    async loadFoods() {
      try {
        this.loading = true
        const response = await foodAPI.getList({
          startDate: dayjs(this.selectedDate).subtract(7, 'day').format('YYYY-MM-DD'),
          endDate: dayjs(this.selectedDate).add(7, 'day').format('YYYY-MM-DD')
        })
        this.foods = response.data?.foods || []
      } catch (error) {
        console.error('加载美食记录失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 加载今日统计
    async loadTodayStats() {
      try {
        const today = dayjs().format('YYYY-MM-DD')
        const todayFoods = this.foods.filter(food => 
          dayjs(food.mealTime).format('YYYY-MM-DD') === today
        )
        
        this.todayStats = {
          mealCount: todayFoods.length,
          calories: todayFoods.reduce((sum, food) => sum + (food.calories || 0), 0),
          weight: null // 这里可以从体重记录API获取
        }
      } catch (error) {
        console.error('加载统计失败:', error)
      }
    },
    
    // 刷新数据
    async refreshData() {
      await Promise.all([
        this.loadFoods(),
        this.loadTodayStats()
      ])
      uni.stopPullDownRefresh()
    },
    
    // 日期改变
    onDateChange(e) {
      this.selectedDate = e.detail.value
      this.loadFoods()
    },
    
    // 改变日期
    changeDate(days) {
      this.selectedDate = dayjs(this.selectedDate).add(days, 'day').format('YYYY-MM-DD')
      this.loadFoods()
    },
    
    // 选择快捷日期
    selectQuickDate(date) {
      this.selectedDate = date
      this.loadFoods()
    },
    
    // 获取用餐时段的美食
    getMealFoods(mealType) {
      return this.dayFoods.filter(food => food.mealType === mealType)
    },
    
    // 获取用餐时段的卡路里
    getMealCalories(mealType) {
      const mealFoods = this.getMealFoods(mealType)
      return mealFoods.reduce((sum, food) => sum + (food.calories || 0), 0)
    },
    
    // 显示用餐选择器
    showMealSelector() {
      this.$refs.mealPopup.open()
    },
    
    // 关闭用餐选择器
    closeMealSelector() {
      this.$refs.mealPopup.close()
    },
    
    // 添加美食
    addFood(mealType) {
      this.closeMealSelector()
      uni.navigateTo({
        url: `/pages/food/add?mealType=${mealType}&date=${this.selectedDate}`
      })
    },
    
    // 编辑美食
    editFood(food) {
      uni.navigateTo({
        url: `/pages/food/add?id=${food.id}`
      })
    },
    
    // 显示删除确认
    showDeleteConfirm(food) {
      this.deleteTarget = food
      this.$refs.deletePopup.open()
    },
    
    // 确认删除
    async confirmDelete() {
      if (!this.deleteTarget) return
      
      try {
        await foodAPI.delete(this.deleteTarget.id)
        
        // 从列表中移除
        const index = this.foods.findIndex(f => f.id === this.deleteTarget.id)
        if (index !== -1) {
          this.foods.splice(index, 1)
        }
        
        // 更新统计
        this.loadTodayStats()
        
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
    goToDetail(food) {
      uni.navigateTo({
        url: `/pages/food/detail?id=${food.id}`
      })
    },
    
    // 格式化显示日期
    formatDisplayDate(date) {
      const target = dayjs(date)
      const today = dayjs()
      
      if (target.isSame(today, 'day')) {
        return '今天'
      } else if (target.isSame(today.subtract(1, 'day'), 'day')) {
        return '昨天'
      } else if (target.isSame(today.add(1, 'day'), 'day')) {
        return '明天'
      } else {
        return target.format('MM月DD日')
      }
    },
    
    // 获取星期
    getWeekday(date) {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return weekdays[dayjs(date).day()]
    }
  }
}
</script>

<style lang="scss" scoped>
.food-container {
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

.date-selector {
  background: #ffffff;
  margin: 0 32rpx 24rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  .date-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .nav-btn {
      width: 64rpx;
      height: 64rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      border-radius: 32rpx;
      font-size: 28rpx;
      color: #666666;
    }
    
    .date-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .date-text {
        font-size: 32rpx;
        font-weight: bold;
        color: #333333;
        margin-bottom: 4rpx;
      }
      
      .date-weekday {
        font-size: 24rpx;
        color: #666666;
      }
    }
  }
  
  .quick-dates {
    display: flex;
    justify-content: center;
    gap: 24rpx;
    
    .quick-date {
      padding: 16rpx 32rpx;
      background: #f8f9fa;
      border-radius: 24rpx;
      font-size: 26rpx;
      color: #666666;
      transition: all 0.3s ease;
      
      &.active {
        background: #007AFF;
        color: #ffffff;
      }
    }
  }
}

.meal-sections {
  padding: 0 32rpx;
  
  .meal-section {
    background: #ffffff;
    border-radius: 16rpx;
    margin-bottom: 24rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    
    .meal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32rpx;
      background: linear-gradient(135deg, #f8f9fa, #ffffff);
      border-bottom: 1rpx solid #f0f0f0;
      
      .meal-info {
        display: flex;
        align-items: center;
        
        .meal-icon {
          font-size: 36rpx;
          margin-right: 16rpx;
        }
        
        .meal-name {
          font-size: 32rpx;
          font-weight: bold;
          color: #333333;
          margin-right: 16rpx;
        }
        
        .meal-time {
          font-size: 24rpx;
          color: #999999;
        }
      }
      
      .meal-stats {
        display: flex;
        align-items: center;
        gap: 16rpx;
        
        .meal-calories {
          font-size: 26rpx;
          color: #007AFF;
          background: rgba(0, 122, 255, 0.1);
          padding: 8rpx 16rpx;
          border-radius: 16rpx;
        }
        
        .add-btn {
          font-size: 32rpx;
          color: #007AFF;
        }
      }
    }
    
    .food-list {
      .food-item {
        display: flex;
        align-items: center;
        padding: 24rpx 32rpx;
        border-bottom: 1rpx solid #f0f0f0;
        transition: all 0.3s ease;
        
        &:last-child {
          border-bottom: none;
        }
        
        &:active {
          background: #f8f9fa;
        }
        
        .food-image {
          width: 96rpx;
          height: 96rpx;
          margin-right: 24rpx;
          
          .food-img {
            width: 100%;
            height: 100%;
            border-radius: 12rpx;
          }
        }
        
        .food-content {
          flex: 1;
          
          .food-name {
            font-size: 30rpx;
            color: #333333;
            margin-bottom: 8rpx;
            font-weight: 500;
          }
          
          .food-desc {
            font-size: 24rpx;
            color: #666666;
            margin-bottom: 8rpx;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .food-nutrition {
            display: flex;
            gap: 16rpx;
            
            .nutrition-item {
              font-size: 22rpx;
              color: #007AFF;
              background: rgba(0, 122, 255, 0.1);
              padding: 4rpx 12rpx;
              border-radius: 12rpx;
            }
          }
        }
        
        .food-actions {
          display: flex;
          flex-direction: column;
          gap: 16rpx;
          
          .action-btn {
            font-size: 28rpx;
            padding: 8rpx;
          }
        }
      }
    }
    
    .empty-meal {
      padding: 60rpx 32rpx;
      text-align: center;
      
      .empty-text {
        display: block;
        font-size: 26rpx;
        color: #999999;
        margin-bottom: 24rpx;
      }
      
      .empty-add-btn {
        background: rgba(0, 122, 255, 0.1);
        color: #007AFF;
        border: none;
        border-radius: 24rpx;
        padding: 16rpx 32rpx;
        font-size: 26rpx;
      }
    }
  }
}

.nutrition-summary {
  background: #ffffff;
  margin: 0 32rpx 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .summary-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333333;
    }
    
    .summary-date {
      font-size: 24rpx;
      color: #666666;
    }
  }
  
  .nutrition-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    
    .nutrition-item {
      text-align: center;
      
      .nutrition-value {
        font-size: 36rpx;
        font-weight: bold;
        color: #333333;
        margin-bottom: 8rpx;
      }
      
      .nutrition-label {
        font-size: 24rpx;
        color: #666666;
        margin-bottom: 16rpx;
      }
      
      .nutrition-bar {
        height: 8rpx;
        background: #f0f0f0;
        border-radius: 4rpx;
        overflow: hidden;
        
        .nutrition-progress {
          height: 100%;
          background: #007AFF;
          border-radius: 4rpx;
          transition: width 0.3s ease;
          
          &.protein {
            background: #28a745;
          }
          
          &.carbs {
            background: #ffc107;
          }
          
          &.fat {
            background: #dc3545;
          }
        }
      }
    }
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

.meal-selector {
  background: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  
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
  
  .meal-options {
    padding: 24rpx;
    
    .meal-option {
      display: flex;
      align-items: center;
      padding: 24rpx;
      border-radius: 16rpx;
      margin-bottom: 16rpx;
      transition: all 0.3s ease;
      
      &:active {
        background: #f8f9fa;
      }
      
      .option-icon {
        font-size: 48rpx;
        margin-right: 24rpx;
      }
      
      .option-content {
        flex: 1;
        
        .option-name {
          font-size: 30rpx;
          color: #333333;
          margin-bottom: 8rpx;
          font-weight: 500;
        }
        
        .option-time {
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
