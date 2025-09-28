<template>
  <view class="nutrition-page">
    <!-- 导航栏 -->
    <van-nav-bar title="营养统计" left-arrow @click-left="onBack" />

    <!-- 日期选择 -->
    <view class="date-selector">
      <van-field
        v-model="selectedDate"
        label="日期"
        placeholder="选择日期"
        readonly
        is-link
        @click="showDatePicker = true"
      />
    </view>

    <!-- 营养总览卡片 -->
    <view class="nutrition-overview">
      <van-row gutter="12">
        <van-col span="12">
          <view class="overview-card">
            <view class="card-title">总热量</view>
            <view class="card-value">{{ nutritionData.totalCalories || 0 }}</view>
            <view class="card-unit">kcal</view>
          </view>
        </van-col>
        <van-col span="12">
          <view class="overview-card">
            <view class="card-title">目标热量</view>
            <view class="card-value">{{ nutritionGoal.calories || 2000 }}</view>
            <view class="card-unit">kcal</view>
          </view>
        </van-col>
      </van-row>
      
      <view class="progress-container">
        <view class="progress-label">
          <text>今日热量进度</text>
          <text>{{ caloriesProgress }}%</text>
        </view>
        <van-progress 
          :percentage="caloriesProgress" 
          :color="getProgressColor(caloriesProgress)"
          stroke-width="8"
        />
      </view>
    </view>

    <!-- 营养成分详情 -->
    <view class="nutrition-details">
      <view class="section-title">营养成分</view>
      
      <view class="nutrition-item">
        <view class="nutrition-header">
          <text class="nutrition-name">蛋白质</text>
          <text class="nutrition-value">{{ nutritionData.protein || 0 }}g / {{ nutritionGoal.protein || 120 }}g</text>
        </view>
        <van-progress 
          :percentage="getProgressPercentage(nutritionData.protein, nutritionGoal.protein || 120)" 
          color="#4ECDC4"
          stroke-width="6"
        />
      </view>

      <view class="nutrition-item">
        <view class="nutrition-header">
          <text class="nutrition-name">碳水化合物</text>
          <text class="nutrition-value">{{ nutritionData.carbs || 0 }}g / {{ nutritionGoal.carbs || 250 }}g</text>
        </view>
        <van-progress 
          :percentage="getProgressPercentage(nutritionData.carbs, nutritionGoal.carbs || 250)" 
          color="#45B7D1"
          stroke-width="6"
        />
      </view>

      <view class="nutrition-item">
        <view class="nutrition-header">
          <text class="nutrition-name">脂肪</text>
          <text class="nutrition-value">{{ nutritionData.fat || 0 }}g / {{ nutritionGoal.fat || 65 }}g</text>
        </view>
        <van-progress 
          :percentage="getProgressPercentage(nutritionData.fat, nutritionGoal.fat || 65)" 
          color="#FFA726"
          stroke-width="6"
        />
      </view>

      <view class="nutrition-item">
        <view class="nutrition-header">
          <text class="nutrition-name">膳食纤维</text>
          <text class="nutrition-value">{{ nutritionData.fiber || 0 }}g / {{ nutritionGoal.fiber || 25 }}g</text>
        </view>
        <van-progress 
          :percentage="getProgressPercentage(nutritionData.fiber, nutritionGoal.fiber || 25)" 
          color="#96CEB4"
          stroke-width="6"
        />
      </view>
    </view>

    <!-- 餐次分布 -->
    <view class="meal-distribution">
      <view class="section-title">餐次分布</view>
      <view class="meal-charts">
        <view 
          v-for="meal in mealData" 
          :key="meal.type"
          class="meal-item"
          @click="goToMealDetail(meal.type)"
        >
          <view class="meal-header">
            <text class="meal-name">{{ meal.name }}</text>
            <text class="meal-calories">{{ meal.calories }}kcal</text>
          </view>
          <van-progress 
            :percentage="getMealPercentage(meal.calories)" 
            :color="meal.color"
            stroke-width="4"
          />
          <view class="meal-foods">
            <text v-for="food in meal.foods.slice(0, 2)" :key="food" class="food-tag">
              {{ food }}
            </text>
            <text v-if="meal.foods.length > 2" class="more-foods">
              +{{ meal.foods.length - 2 }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 建议和分析 -->
    <view class="nutrition-analysis">
      <view class="section-title">营养分析</view>
      <view class="analysis-cards">
        <view class="analysis-item" :class="getAnalysisType('calories')">
          <view class="analysis-icon">🔥</view>
          <view class="analysis-content">
            <view class="analysis-title">热量摄入</view>
            <view class="analysis-desc">{{ getCaloriesAnalysis() }}</view>
          </view>
        </view>

        <view class="analysis-item" :class="getAnalysisType('balance')">
          <view class="analysis-icon">⚖️</view>
          <view class="analysis-content">
            <view class="analysis-title">营养均衡</view>
            <view class="analysis-desc">{{ getNutritionBalanceAnalysis() }}</view>
          </view>
        </view>

        <view class="analysis-item">
          <view class="analysis-icon">💡</view>
          <view class="analysis-content">
            <view class="analysis-title">建议</view>
            <view class="analysis-desc">{{ getNutritionSuggestion() }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-datetime-picker
        v-model="currentDate"
        type="date"
        title="选择日期"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { foodAPI } from '@/api'
import { showToast } from 'vant'

// 响应式数据
const selectedDate = ref('')
const showDatePicker = ref(false)
const currentDate = ref(new Date())
const loading = ref(false)

const nutritionData = reactive({
  totalCalories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0
})

const nutritionGoal = reactive({
  calories: 2000,
  protein: 120,
  carbs: 250,
  fat: 65,
  fiber: 25
})

const mealData = ref([
  { type: 'breakfast', name: '早餐', calories: 0, foods: [], color: '#FFB74D' },
  { type: 'lunch', name: '午餐', calories: 0, foods: [], color: '#64B5F6' },
  { type: 'dinner', name: '晚餐', calories: 0, foods: [], color: '#81C784' },
  { type: 'snack', name: '加餐', calories: 0, foods: [], color: '#F06292' }
])

// 计算属性
const caloriesProgress = computed(() => {
  if (!nutritionGoal.calories) return 0
  return Math.round((nutritionData.totalCalories / nutritionGoal.calories) * 100)
})

// 方法
const onBack = () => {
  uni.navigateBack()
}

const loadNutritionData = async () => {
  try {
    loading.value = true
    const date = selectedDate.value || formatDate(new Date())
    
    const res = await foodAPI.getNutritionStats({ date })
    const data = res.data || {}
    
    Object.assign(nutritionData, {
      totalCalories: data.totalCalories || 0,
      protein: data.protein || 0,
      carbs: data.carbs || 0,
      fat: data.fat || 0,
      fiber: data.fiber || 0
    })

    // 更新餐次数据
    if (data.mealData) {
      mealData.value.forEach(meal => {
        const mealInfo = data.mealData[meal.type] || {}
        meal.calories = mealInfo.calories || 0
        meal.foods = mealInfo.foods || []
      })
    }
  } catch (error) {
    console.error('获取营养数据失败:', error)
    showToast('获取数据失败')
  } finally {
    loading.value = false
  }
}

const onDateConfirm = ({ selectedValues }) => {
  selectedDate.value = formatDate(currentDate.value)
  showDatePicker.value = false
  loadNutritionData()
}

const formatDate = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getProgressPercentage = (current, target) => {
  if (!target) return 0
  return Math.round((current / target) * 100)
}

const getProgressColor = (percentage) => {
  if (percentage < 50) return '#FF6B6B'
  if (percentage < 80) return '#FFA726'
  if (percentage <= 100) return '#4ECDC4'
  return '#FF6B6B'
}

const getMealPercentage = (calories) => {
  if (!nutritionData.totalCalories) return 0
  return Math.round((calories / nutritionData.totalCalories) * 100)
}

const goToMealDetail = (mealType) => {
  uni.navigateTo({
    url: `/pages/food/index?meal=${mealType}&date=${selectedDate.value}`
  })
}

const getAnalysisType = (type) => {
  if (type === 'calories') {
    const progress = caloriesProgress.value
    if (progress < 80) return 'warning'
    if (progress > 120) return 'danger'
    return 'success'
  }
  return ''
}

const getCaloriesAnalysis = () => {
  const progress = caloriesProgress.value
  if (progress < 80) return '热量摄入不足，建议增加营养密度高的食物'
  if (progress > 120) return '热量摄入过多，建议控制食量'
  return '热量摄入适中，继续保持'
}

const getNutritionBalanceAnalysis = () => {
  const proteinRatio = (nutritionData.protein * 4 / nutritionData.totalCalories * 100) || 0
  const carbsRatio = (nutritionData.carbs * 4 / nutritionData.totalCalories * 100) || 0
  const fatRatio = (nutritionData.fat * 9 / nutritionData.totalCalories * 100) || 0

  if (proteinRatio < 15) return '蛋白质摄入偏低，建议增加'
  if (carbsRatio > 65) return '碳水化合物摄入偏高，建议控制'
  if (fatRatio > 35) return '脂肪摄入偏高，建议减少'
  return '营养比例均衡'
}

const getNutritionSuggestion = () => {
  const suggestions = []
  
  if (nutritionData.fiber < nutritionGoal.fiber * 0.7) {
    suggestions.push('增加蔬菜和水果摄入')
  }
  if (nutritionData.protein < nutritionGoal.protein * 0.8) {
    suggestions.push('补充优质蛋白质')
  }
  if (caloriesProgress.value > 110) {
    suggestions.push('适当增加运动量')
  }

  return suggestions.length > 0 ? suggestions[0] : '营养摄入良好，继续保持'
}

// 监听日期变化
watch(selectedDate, () => {
  if (selectedDate.value) {
    loadNutritionData()
  }
})

// 初始化
onMounted(() => {
  selectedDate.value = formatDate(new Date())
  loadNutritionData()
})
</script>

<style lang="scss" scoped>
.nutrition-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.date-selector {
  background-color: #fff;
  margin-bottom: 8px;
}

.nutrition-overview {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 8px;
}

.overview-card {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  
  .card-title {
    font-size: 12px;
    opacity: 0.8;
    margin-bottom: 8px;
  }
  
  .card-value {
    font-size: 24px;
    font-weight: bold;
    line-height: 1;
  }
  
  .card-unit {
    font-size: 12px;
    opacity: 0.8;
    margin-top: 4px;
  }
}

.progress-container {
  margin-top: 16px;
  
  .progress-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
    color: #646566;
  }
}

.nutrition-details {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 16px;
}

.nutrition-item {
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.nutrition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  .nutrition-name {
    font-size: 14px;
    color: #323233;
  }
  
  .nutrition-value {
    font-size: 12px;
    color: #969799;
  }
}

.meal-distribution {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 8px;
}

.meal-charts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meal-item {
  padding: 12px;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  background-color: #fafafa;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  .meal-name {
    font-size: 14px;
    font-weight: bold;
    color: #323233;
  }
  
  .meal-calories {
    font-size: 12px;
    color: #969799;
  }
}

.meal-foods {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  
  .food-tag {
    font-size: 11px;
    background-color: #f2f3f5;
    color: #646566;
    padding: 2px 6px;
    border-radius: 4px;
  }
  
  .more-foods {
    font-size: 11px;
    color: #969799;
  }
}

.nutrition-analysis {
  background-color: #fff;
  padding: 16px;
}

.analysis-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.analysis-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background-color: #f7f8fa;
  border-left: 4px solid #ebedf0;
  
  &.success {
    border-left-color: #07c160;
    background-color: #f0f9ff;
  }
  
  &.warning {
    border-left-color: #ff976a;
    background-color: #fff7ed;
  }
  
  &.danger {
    border-left-color: #ee0a24;
    background-color: #fff1f0;
  }
}

.analysis-icon {
  font-size: 20px;
  margin-right: 12px;
}

.analysis-content {
  flex: 1;
  
  .analysis-title {
    font-size: 14px;
    font-weight: bold;
    color: #323233;
    margin-bottom: 4px;
  }
  
  .analysis-desc {
    font-size: 12px;
    color: #646566;
    line-height: 1.4;
  }
}
</style>
