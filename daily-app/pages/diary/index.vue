<template>
  <view class="diary-page">
    <!-- 导航栏 -->
    <van-nav-bar title="我的日记" fixed>
      <template #right>
        <van-icon name="plus" @click="showAddDialog = true" />
      </template>
    </van-nav-bar>

    <!-- 统计卡片 -->
    <view class="stats-container">
      <van-row gutter="12">
        <van-col span="6">
          <view class="stats-card">
            <view class="stats-number">{{ stats.total }}</view>
            <view class="stats-label">总日记</view>
          </view>
        </van-col>
        <van-col span="6">
          <view class="stats-card">
            <view class="stats-number">{{ stats.thisMonth }}</view>
            <view class="stats-label">本月</view>
          </view>
        </van-col>
        <van-col span="6">
          <view class="stats-card">
            <view class="stats-number">{{ stats.streak }}</view>
            <view class="stats-label">连续天数</view>
          </view>
        </van-col>
        <van-col span="6">
          <view class="stats-card">
            <view class="stats-number">{{ getMoodText(stats.avgMood) }}</view>
            <view class="stats-label">平均心情</view>
          </view>
        </van-col>
      </van-row>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-container">
      <van-dropdown-menu>
        <van-dropdown-item v-model="filterMood" :options="moodOptions" />
        <van-dropdown-item v-model="filterDate" :options="dateOptions" />
      </van-dropdown-menu>
    </view>

    <!-- 日记列表 -->
    <view class="diary-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <view
            v-for="item in diaryList"
            :key="item._id"
            class="diary-item"
            @click="viewDetail(item)"
          >
            <view class="item-header">
              <view class="item-date">{{ formatDate(item.date) }}</view>
              <view class="item-mood">{{ getMoodEmoji(item.mood) }}</view>
            </view>
            <view class="item-title">{{ item.title }}</view>
            <view class="item-content">{{ item.content }}</view>
            <view class="item-footer">
              <view class="item-tags" v-if="item.tags && item.tags.length > 0">
                <van-tag
                  v-for="tag in item.tags.slice(0, 3)"
                  :key="tag"
                  size="mini"
                  type="primary"
                  plain
                >
                  {{ tag }}
                </van-tag>
                <text v-if="item.tags.length > 3" class="more-tags">+{{ item.tags.length - 3 }}</text>
              </view>
              <view class="item-weather" v-if="item.weather">
                {{ getWeatherIcon(item.weather) }}
              </view>
            </view>
          </view>
        </van-list>
      </van-pull-refresh>
    </view>

    <!-- 写日记对话框 -->
    <van-popup v-model:show="showAddDialog" position="bottom" style="height: 85%">
      <view class="add-form">
        <van-nav-bar
          title="写日记"
          left-text="取消"
          right-text="保存"
          @click-left="showAddDialog = false"
          @click-right="saveDiary"
        />
        
        <van-form @submit="saveDiary" class="form-content">
          <!-- 日期时间 -->
          <van-field
            v-model="formData.date"
            name="date"
            label="日期"
            placeholder="选择日期"
            readonly
            is-link
            @click="showDatePicker = true"
            :rules="[{ required: true, message: '请选择日期' }]"
          />

          <!-- 标题 -->
          <van-field
            v-model="formData.title"
            name="title"
            label="标题"
            placeholder="今天发生了什么..."
            :rules="[{ required: true, message: '请输入标题' }]"
          />

          <!-- 心情 -->
          <van-field name="mood" label="心情">
            <template #input>
              <view class="mood-selector">
                <view
                  v-for="mood in moodList"
                  :key="mood.value"
                  class="mood-item"
                  :class="{ active: formData.mood === mood.value }"
                  @click="formData.mood = mood.value"
                >
                  <text class="mood-emoji">{{ mood.emoji }}</text>
                  <text class="mood-label">{{ mood.label }}</text>
                </view>
              </view>
            </template>
          </van-field>

          <!-- 天气 -->
          <van-field
            v-model="formData.weather"
            name="weather"
            label="天气"
            placeholder="选择天气"
            readonly
            is-link
            @click="showWeatherPicker = true"
          />

          <!-- 标签 -->
          <van-field name="tags" label="标签">
            <template #input>
              <view class="tags-input">
                <van-tag
                  v-for="(tag, index) in formData.tags"
                  :key="index"
                  closeable
                  size="medium"
                  @close="removeTag(index)"
                  style="margin-right: 8px; margin-bottom: 8px;"
                >
                  {{ tag }}
                </van-tag>
                <van-button
                  size="small"
                  @click="showTagInput = true"
                  style="margin-bottom: 8px;"
                >
                  + 添加
                </van-button>
              </view>
            </template>
          </van-field>

          <!-- 内容 -->
          <van-field
            v-model="formData.content"
            name="content"
            label="内容"
            type="textarea"
            placeholder="记录今天的所思所想..."
            rows="6"
            autosize
            :rules="[{ required: true, message: '请输入日记内容' }]"
          />
        </van-form>
      </view>
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-datetime-picker
        v-model="currentDate"
        type="datetime"
        title="选择日期时间"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 天气选择器 -->
    <van-popup v-model:show="showWeatherPicker" position="bottom">
      <van-picker
        :columns="weatherColumns"
        title="选择天气"
        @confirm="onWeatherConfirm"
        @cancel="showWeatherPicker = false"
      />
    </van-popup>

    <!-- 标签输入对话框 -->
    <van-dialog
      v-model:show="showTagInput"
      title="添加标签"
      show-cancel-button
      @confirm="addTag"
      @cancel="newTag = ''"
    >
      <van-field
        v-model="newTag"
        placeholder="请输入标签名称"
        style="margin: 16px 0;"
      />
    </van-dialog>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { diaryAPI } from '@/api'
import { showToast, showConfirmDialog } from 'vant'

// 响应式数据
const diaryList = ref([])
const stats = ref({
  total: 0,
  thisMonth: 0,
  streak: 0,
  avgMood: 'calm'
})
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

const showAddDialog = ref(false)
const showDatePicker = ref(false)
const showWeatherPicker = ref(false)
const showTagInput = ref(false)
const currentDate = ref(new Date())
const newTag = ref('')

const filterMood = ref('')
const filterDate = ref('')

// 表单数据
const formData = reactive({
  date: '',
  title: '',
  mood: 'calm',
  weather: '',
  tags: [],
  content: ''
})

// 心情选项
const moodList = [
  { value: 'happy', emoji: '😊', label: '开心' },
  { value: 'calm', emoji: '😌', label: '平静' },
  { value: 'sad', emoji: '😢', label: '难过' },
  { value: 'excited', emoji: '🤩', label: '兴奋' },
  { value: 'anxious', emoji: '😰', label: '焦虑' },
  { value: 'angry', emoji: '😠', label: '愤怒' }
]

// 筛选选项
const moodOptions = [
  { text: '全部心情', value: '' },
  ...moodList.map(mood => ({ text: mood.emoji + ' ' + mood.label, value: mood.value }))
]

const dateOptions = [
  { text: '全部', value: '' },
  { text: '今天', value: 'today' },
  { text: '本周', value: 'week' },
  { text: '本月', value: 'month' }
]

const weatherColumns = [
  { text: '☀️ 晴天', value: 'sunny' },
  { text: '⛅ 多云', value: 'cloudy' },
  { text: '☁️ 阴天', value: 'overcast' },
  { text: '🌧️ 雨天', value: 'rainy' },
  { text: '❄️ 雪天', value: 'snowy' },
  { text: '🌫️ 雾天', value: 'foggy' }
]

// 方法
const loadDiaryList = async (reset = false) => {
  if (loading.value) return

  loading.value = true
  
  try {
    const params = {
      page: reset ? 1 : currentPage.value,
      pageSize: pageSize.value,
      mood: filterMood.value,
      date: filterDate.value
    }

    const res = await diaryAPI.getList(params)
    const newData = res.data.list || []

    if (reset) {
      diaryList.value = newData
      currentPage.value = 1
    } else {
      diaryList.value.push(...newData)
    }

    finished.value = newData.length < pageSize.value
    if (!finished.value) {
      currentPage.value++
    }
  } catch (error) {
    console.error('获取日记列表失败:', error)
    showToast('获取数据失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const loadStats = async () => {
  try {
    const res = await diaryAPI.getStats()
    stats.value = res.data || {
      total: 0,
      thisMonth: 0,
      streak: 0,
      avgMood: 'calm'
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const onRefresh = () => {
  finished.value = false
  loadDiaryList(true)
  loadStats()
}

const onLoad = () => {
  loadDiaryList()
}

const viewDetail = (item) => {
  uni.navigateTo({
    url: `/pages/diary/detail?id=${item._id}`
  })
}

const onDateConfirm = ({ selectedValues }) => {
  formData.date = formatDateTime(currentDate.value)
  showDatePicker.value = false
}

const onWeatherConfirm = ({ selectedOptions }) => {
  formData.weather = selectedOptions[0]?.value || ''
  showWeatherPicker.value = false
}

const addTag = () => {
  if (newTag.value.trim() && !formData.tags.includes(newTag.value.trim())) {
    formData.tags.push(newTag.value.trim())
  }
  newTag.value = ''
  showTagInput.value = false
}

const removeTag = (index) => {
  formData.tags.splice(index, 1)
}

const saveDiary = async () => {
  try {
    await diaryAPI.create(formData)
    showToast('保存成功')
    showAddDialog.value = false
    resetForm()
    onRefresh()
  } catch (error) {
    console.error('保存失败:', error)
    showToast('保存失败，请重试')
  }
}

const resetForm = () => {
  Object.assign(formData, {
    date: formatDateTime(new Date()),
    title: '',
    mood: 'calm',
    weather: '',
    tags: [],
    content: ''
  })
}

const formatDate = (date) => {
  const d = new Date(date)
  const today = new Date()
  const diffTime = Math.abs(today - d)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) {
    return '今天'
  } else if (diffDays === 2) {
    return '昨天'
  } else if (diffDays <= 7) {
    return `${diffDays}天前`
  } else {
    return d.toLocaleDateString()
  }
}

const formatDateTime = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const getMoodText = (mood) => {
  const moodMap = {
    happy: '😊',
    calm: '😌',
    sad: '😢',
    excited: '🤩',
    anxious: '😰',
    angry: '😠'
  }
  return moodMap[mood] || '😌'
}

const getMoodEmoji = (mood) => {
  return getMoodText(mood)
}

const getWeatherIcon = (weather) => {
  const weatherMap = {
    sunny: '☀️',
    cloudy: '⛅',
    overcast: '☁️',
    rainy: '🌧️',
    snowy: '❄️',
    foggy: '🌫️'
  }
  return weatherMap[weather] || ''
}

// 初始化
onMounted(() => {
  loadDiaryList(true)
  loadStats()
  formData.date = formatDateTime(new Date())
})
</script>

<style lang="scss" scoped>
.diary-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-top: 46px;
}

.stats-container {
  padding: 16px;
  background-color: #fff;
  margin-bottom: 8px;
}

.stats-card {
  text-align: center;
  padding: 12px 8px;
  
  .stats-number {
    font-size: 20px;
    font-weight: bold;
    color: #1989fa;
    line-height: 1;
  }
  
  .stats-label {
    font-size: 11px;
    color: #969799;
    margin-top: 4px;
  }
}

.filter-container {
  background-color: #fff;
  margin-bottom: 8px;
}

.diary-list {
  padding: 0 16px;
}

.diary-item {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  .item-date {
    font-size: 12px;
    color: #969799;
  }
  
  .item-mood {
    font-size: 18px;
  }
}

.item-title {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 8px;
}

.item-content {
  font-size: 14px;
  color: #646566;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-tags {
  display: flex;
  align-items: center;
  
  .van-tag {
    margin-right: 4px;
  }
  
  .more-tags {
    font-size: 12px;
    color: #969799;
    margin-left: 4px;
  }
}

.item-weather {
  font-size: 16px;
}

.add-form {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.mood-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mood-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
  
  &.active {
    border-color: #1989fa;
    background-color: #e8f4fd;
  }
  
  .mood-emoji {
    font-size: 20px;
    margin-bottom: 4px;
  }
  
  .mood-label {
    font-size: 11px;
    color: #646566;
  }
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
</style>
