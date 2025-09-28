<template>
  <view class="appearance-page">
    <!-- 导航栏 -->
    <van-nav-bar title="形象管理" fixed>
      <template #right>
        <van-icon name="plus" @click="showAddDialog = true" />
      </template>
    </van-nav-bar>

    <!-- 统计卡片 -->
    <view class="stats-container">
      <van-row gutter="12">
        <van-col span="8">
          <view class="stats-card">
            <view class="stats-number">{{ stats.total }}</view>
            <view class="stats-label">总记录</view>
          </view>
        </van-col>
        <van-col span="8">
          <view class="stats-card">
            <view class="stats-number">{{ stats.thisMonth }}</view>
            <view class="stats-label">本月记录</view>
          </view>
        </van-col>
        <van-col span="8">
          <view class="stats-card">
            <view class="stats-number">{{ stats.avgRating }}</view>
            <view class="stats-label">平均评分</view>
          </view>
        </van-col>
      </van-row>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-container">
      <van-dropdown-menu>
        <van-dropdown-item v-model="filterType" :options="typeOptions" />
        <van-dropdown-item v-model="filterDate" :options="dateOptions" />
      </van-dropdown-menu>
    </view>

    <!-- 形象记录列表 -->
    <view class="appearance-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <view
            v-for="item in appearanceList"
            :key="item._id"
            class="appearance-item"
            @click="viewDetail(item)"
          >
            <view class="item-image">
              <image :src="item.image || '/static/placeholder.png'" mode="aspectFill" />
              <view class="item-rating">
                <van-rate :model-value="item.rating" readonly size="12" />
              </view>
            </view>
            <view class="item-content">
              <view class="item-header">
                <text class="item-title">{{ item.title }}</text>
                <text class="item-date">{{ formatDate(item.date) }}</text>
              </view>
              <view class="item-tags">
                <van-tag
                  v-for="tag in item.tags"
                  :key="tag"
                  size="mini"
                  type="primary"
                  plain
                >
                  {{ tag }}
                </van-tag>
              </view>
              <view class="item-description">{{ item.description }}</view>
              <view class="item-meta">
                <text class="item-type">{{ getTypeText(item.type) }}</text>
                <text class="item-weather" v-if="item.weather">
                  {{ getWeatherIcon(item.weather) }} {{ item.weather }}
                </text>
              </view>
            </view>
          </view>
        </van-list>
      </van-pull-refresh>
    </view>

    <!-- 新增形象记录对话框 -->
    <van-popup v-model:show="showAddDialog" position="bottom" style="height: 80%">
      <view class="add-form">
        <van-nav-bar
          title="添加形象记录"
          left-text="取消"
          right-text="保存"
          @click-left="showAddDialog = false"
          @click-right="saveAppearance"
        />
        
        <van-form @submit="saveAppearance" class="form-content">
          <!-- 照片上传 -->
          <van-field name="image" label="照片">
            <template #input>
              <van-uploader
                v-model="imageList"
                :max-count="1"
                :after-read="afterRead"
                upload-text="上传照片"
              />
            </template>
          </van-field>

          <!-- 标题 -->
          <van-field
            v-model="formData.title"
            name="title"
            label="标题"
            placeholder="今天的造型主题"
            :rules="[{ required: true, message: '请输入标题' }]"
          />

          <!-- 类型 -->
          <van-field
            v-model="formData.type"
            name="type"
            label="类型"
            placeholder="选择类型"
            readonly
            is-link
            @click="showTypePicker = true"
            :rules="[{ required: true, message: '请选择类型' }]"
          />

          <!-- 评分 -->
          <van-field name="rating" label="满意度">
            <template #input>
              <van-rate v-model="formData.rating" />
            </template>
          </van-field>

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

          <!-- 场合 -->
          <van-field
            v-model="formData.occasion"
            name="occasion"
            label="场合"
            placeholder="请输入场合"
          />

          <!-- 描述 -->
          <van-field
            v-model="formData.description"
            name="description"
            label="描述"
            type="textarea"
            placeholder="记录今天的穿搭心得..."
            rows="3"
            autosize
          />
        </van-form>
      </view>
    </van-popup>

    <!-- 类型选择器 -->
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="typeColumns"
        title="选择类型"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
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
import { appearanceAPI } from '@/api'
import { showToast, showConfirmDialog } from 'vant'

// 响应式数据
const appearanceList = ref([])
const stats = ref({
  total: 0,
  thisMonth: 0,
  avgRating: 0
})
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

const showAddDialog = ref(false)
const showTypePicker = ref(false)
const showWeatherPicker = ref(false)
const showTagInput = ref(false)
const imageList = ref([])
const newTag = ref('')

const filterType = ref('')
const filterDate = ref('')

// 表单数据
const formData = reactive({
  title: '',
  type: '',
  image: '',
  rating: 5,
  tags: [],
  weather: '',
  occasion: '',
  description: ''
})

// 筛选选项
const typeOptions = [
  { text: '全部', value: '' },
  { text: '日常', value: 'daily' },
  { text: '工作', value: 'work' },
  { text: '约会', value: 'date' },
  { text: '聚会', value: 'party' },
  { text: '运动', value: 'sport' },
  { text: '正式', value: 'formal' }
]

const dateOptions = [
  { text: '全部', value: '' },
  { text: '今天', value: 'today' },
  { text: '本周', value: 'week' },
  { text: '本月', value: 'month' }
]

const typeColumns = [
  { text: '日常', value: 'daily' },
  { text: '工作', value: 'work' },
  { text: '约会', value: 'date' },
  { text: '聚会', value: 'party' },
  { text: '运动', value: 'sport' },
  { text: '正式', value: 'formal' }
]

const weatherColumns = [
  { text: '晴天', value: 'sunny' },
  { text: '多云', value: 'cloudy' },
  { text: '阴天', value: 'overcast' },
  { text: '雨天', value: 'rainy' },
  { text: '雪天', value: 'snowy' }
]

// 方法
const loadAppearanceList = async (reset = false) => {
  if (loading.value) return

  loading.value = true
  
  try {
    const params = {
      page: reset ? 1 : currentPage.value,
      pageSize: pageSize.value,
      type: filterType.value,
      date: filterDate.value
    }

    const res = await appearanceAPI.getList(params)
    const newData = res.data.list || []

    if (reset) {
      appearanceList.value = newData
      currentPage.value = 1
    } else {
      appearanceList.value.push(...newData)
    }

    finished.value = newData.length < pageSize.value
    if (!finished.value) {
      currentPage.value++
    }
  } catch (error) {
    console.error('获取形象记录失败:', error)
    showToast('获取数据失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const loadStats = async () => {
  try {
    const res = await appearanceAPI.getStats()
    stats.value = res.data || {
      total: 0,
      thisMonth: 0,
      avgRating: 0
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const onRefresh = () => {
  finished.value = false
  loadAppearanceList(true)
  loadStats()
}

const onLoad = () => {
  loadAppearanceList()
}

const viewDetail = (item) => {
  uni.navigateTo({
    url: `/pages/appearance/detail?id=${item._id}`
  })
}

const afterRead = (file) => {
  formData.image = file.content || file.url
}

const onTypeConfirm = ({ selectedOptions }) => {
  formData.type = selectedOptions[0]?.value || ''
  showTypePicker.value = false
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

const saveAppearance = async () => {
  try {
    await appearanceAPI.create(formData)
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
    title: '',
    type: '',
    image: '',
    rating: 5,
    tags: [],
    weather: '',
    occasion: '',
    description: ''
  })
  imageList.value = []
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

const getTypeText = (type) => {
  const typeMap = {
    daily: '日常',
    work: '工作',
    date: '约会',
    party: '聚会',
    sport: '运动',
    formal: '正式'
  }
  return typeMap[type] || type
}

const getWeatherIcon = (weather) => {
  const weatherMap = {
    sunny: '☀️',
    cloudy: '⛅',
    overcast: '☁️',
    rainy: '🌧️',
    snowy: '❄️'
  }
  return weatherMap[weather] || ''
}

// 初始化
onMounted(() => {
  loadAppearanceList(true)
  loadStats()
})
</script>

<style lang="scss" scoped>
.appearance-page {
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
  padding: 16px 8px;
  
  .stats-number {
    font-size: 24px;
    font-weight: bold;
    color: #1989fa;
    line-height: 1;
  }
  
  .stats-label {
    font-size: 12px;
    color: #969799;
    margin-top: 4px;
  }
}

.filter-container {
  background-color: #fff;
  margin-bottom: 8px;
}

.appearance-list {
  padding: 0 16px;
}

.appearance-item {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-image {
  position: relative;
  width: 100%;
  height: 200px;
  
  image {
    width: 100%;
    height: 100%;
  }
  
  .item-rating {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 12px;
    padding: 4px 8px;
  }
}

.item-content {
  padding: 16px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  .item-title {
    font-size: 16px;
    font-weight: bold;
    color: #323233;
  }
  
  .item-date {
    font-size: 12px;
    color: #969799;
  }
}

.item-tags {
  margin-bottom: 8px;
  
  .van-tag {
    margin-right: 4px;
  }
}

.item-description {
  font-size: 14px;
  color: #646566;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #969799;
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

.tags-input {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
</style>
