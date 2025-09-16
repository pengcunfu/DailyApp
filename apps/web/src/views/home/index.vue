<template>
  <div class="home-container">
    <!-- 欢迎横幅 -->
    <el-card class="welcome-card">
      <div class="welcome-content">
        <div class="welcome-text">
          <h2>欢迎回来，{{ userName }}！</h2>
          <p>今天是 {{ getCurrentDate() }}，让我们开始充实的一天吧！</p>
        </div>
        <div class="welcome-image">
          <img src="../../assets/home.png" alt="欢迎" />
        </div>
      </div>
    </el-card>

    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bill-icon">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ dashboardData.bills.total || 0 }}</div>
              <div class="stat-label">账单记录</div>
              <div class="stat-trend">本月: {{ dashboardData.bills.thisMonth || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon todo-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ dashboardData.todos.pending || 0 }}</div>
              <div class="stat-label">待办事项</div>
              <div class="stat-trend">已完成: {{ dashboardData.todos.completed || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon note-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ dashboardData.notes.total || 0 }}</div>
              <div class="stat-label">笔记数量</div>
              <div class="stat-trend">本周: {{ dashboardData.notes.thisWeek || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon friend-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ dashboardData.friends.total || 0 }}</div>
              <div class="stat-label">朋友数量</div>
              <div class="stat-trend">新增: {{ dashboardData.friends.newThisMonth || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 主要内容区域 -->
    <el-row :gutter="20" class="main-content">
      <el-col :span="16">
        <!-- 最近活动 -->
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <h3>最近活动</h3>
              <el-button text @click="viewAllActivities">查看全部</el-button>
            </div>
          </template>
          <div class="activity-list">
            <div 
              v-for="activity in recentActivities" 
              :key="activity.id" 
              class="activity-item">
              <div class="activity-icon" :class="activity.type">
                <el-icon>
                  <component :is="getActivityIcon(activity.type)" />
                </el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ getRelativeTime(activity.createdAt) }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 今日待办 -->
        <el-card class="todo-card">
          <template #header>
            <div class="card-header">
              <h3>今日待办</h3>
              <el-button text @click="goToTodos">管理待办</el-button>
            </div>
          </template>
          <div class="todo-list">
            <div 
              v-for="todo in todayTodos" 
              :key="todo._id" 
              class="todo-item">
              <el-checkbox 
                :model-value="todo.status === 1" 
                @change="toggleTodo(todo)" />
              <span 
                :class="{ 'completed': todo.status === 1 }" 
                class="todo-title">
                {{ todo.title }}
              </span>
              <el-tag 
                v-if="todo.priority > 0" 
                :type="getPriorityType(todo.priority)" 
                size="small">
                {{ getPriorityText(todo.priority) }}
              </el-tag>
            </div>
            <div v-if="todayTodos.length === 0" class="empty-state">
              <el-icon><SuccessFilled /></el-icon>
              <p>今天没有待办事项！</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <!-- 快捷操作 -->
        <el-card class="quick-actions-card">
          <template #header>
            <h3>快捷操作</h3>
          </template>
          <div class="quick-actions">
            <div class="action-item" @click="goToPage('/bill')">
              <div class="action-icon bill-action">
                <el-icon><Money /></el-icon>
              </div>
              <span>记账</span>
            </div>
            <div class="action-item" @click="goToPage('/todo')">
              <div class="action-icon todo-action">
                <el-icon><Calendar /></el-icon>
              </div>
              <span>待办</span>
            </div>
            <div class="action-item" @click="goToPage('/note')">
              <div class="action-icon note-action">
                <el-icon><Document /></el-icon>
              </div>
              <span>笔记</span>
            </div>
            <div class="action-item" @click="goToPage('/food')">
              <div class="action-icon food-action">
                <el-icon><Food /></el-icon>
              </div>
              <span>美食</span>
            </div>
          </div>
        </el-card>

        <!-- 天气信息 -->
        <el-card class="weather-card">
          <template #header>
            <h3>今日天气</h3>
          </template>
          <div class="weather-content">
            <div class="weather-main">
              <div class="temperature">{{ weatherInfo.temperature || '22' }}°C</div>
              <div class="weather-desc">{{ weatherInfo.description || '晴朗' }}</div>
            </div>
            <div class="weather-details">
              <div class="detail-item">
                <span>湿度</span>
                <span>{{ weatherInfo.humidity || '65' }}%</span>
              </div>
              <div class="detail-item">
                <span>风速</span>
                <span>{{ weatherInfo.windSpeed || '3' }}km/h</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 每日一言 -->
        <el-card class="quote-card">
          <div class="quote-content">
            <el-icon class="quote-icon"><ChatDotSquare /></el-icon>
            <p class="quote-text">{{ dailyQuote.text || '生活就像海洋，只有意志坚强的人，才能到达彼岸。' }}</p>
            <div class="quote-author">— {{ dailyQuote.author || '马克思' }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { 
  Money, 
  Calendar, 
  Document, 
  User, 
  Food,
  SuccessFilled,
  ChatDotSquare
} from '@element-plus/icons-vue'
import { todoAPI } from '@/api/apis'
import { formatDate, getRelativeTime } from '@/utils'

const router = useRouter()
const store = useStore()

// 响应式数据
const loading = ref(false)
const dashboardData = reactive({
  bills: { total: 0, thisMonth: 0 },
  todos: { pending: 0, completed: 0 },
  notes: { total: 0, thisWeek: 0 },
  friends: { total: 0, newThisMonth: 0 }
})

const recentActivities = ref([])
const todayTodos = ref([])
const weatherInfo = ref({})
const dailyQuote = ref({})

// 计算属性
const userName = computed(() => store.getters['user/userName'] || '用户')

// 方法
const getCurrentDate = () => {
  const now = new Date()
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  }
  return now.toLocaleDateString('zh-CN', options)
}

const getActivityIcon = (type) => {
  const iconMap = {
    bill: 'Money',
    todo: 'Calendar', 
    note: 'Document',
    food: 'Food',
    friend: 'User'
  }
  return iconMap[type] || 'Document'
}

const getPriorityType = (priority) => {
  const types = ['info', 'warning', 'danger']
  return types[priority] || 'info'
}

const getPriorityText = (priority) => {
  const texts = ['普通', '重要', '紧急']
  return texts[priority] || '普通'
}

const goToPage = (path) => {
  router.push(path)
}

const goToTodos = () => {
  router.push('/todo')
}

const viewAllActivities = () => {
  ElMessage.info('活动历史功能开发中...')
}

const toggleTodo = async (todo) => {
  try {
    await todoAPI.toggleTodo(todo._id)
    todo.status = todo.status === 1 ? 0 : 1
    ElMessage.success('状态更新成功')
    loadTodayTodos()
  } catch (error) {
    ElMessage.error('状态更新失败')
  }
}

// 加载仪表盘数据
const loadDashboardData = async () => {
  try {
    // 这里应该调用各个模块的统计API
    // 暂时使用模拟数据
    Object.assign(dashboardData, {
      bills: { total: 156, thisMonth: 23 },
      todos: { pending: 8, completed: 15 },
      notes: { total: 89, thisWeek: 5 },
      friends: { total: 45, newThisMonth: 2 }
    })
  } catch (error) {
    console.error('加载仪表盘数据失败:', error)
  }
}

// 加载最近活动
const loadRecentActivities = () => {
  // 模拟最近活动数据
  recentActivities.value = [
    {
      id: 1,
      type: 'bill',
      title: '添加了午餐消费记录',
      createdAt: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 2, 
      type: 'todo',
      title: '完成了项目报告',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 3,
      type: 'note',
      title: '创建了学习笔记',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
  ]
}

// 加载今日待办
const loadTodayTodos = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const response = await todoAPI.getTodos({
      startDate: today,
      endDate: today,
      limit: 5
    })
    
    if (response.success) {
      todayTodos.value = response.data.todos
    }
  } catch (error) {
    console.error('加载今日待办失败:', error)
    // 使用模拟数据
    todayTodos.value = [
      {
        _id: '1',
        title: '完成项目文档',
        status: 0,
        priority: 1
      },
      {
        _id: '2', 
        title: '回复邮件',
        status: 1,
        priority: 0
      }
    ]
  }
}

// 加载天气信息
const loadWeatherInfo = () => {
  // 这里可以接入天气API
  weatherInfo.value = {
    temperature: 22,
    description: '晴朗',
    humidity: 65,
    windSpeed: 3
  }
}

// 加载每日一言
const loadDailyQuote = () => {
  const quotes = [
    { text: '生活就像海洋，只有意志坚强的人，才能到达彼岸。', author: '马克思' },
    { text: '今天的努力，是为了明天的美好。', author: '佚名' },
    { text: '不积跬步，无以至千里。', author: '荀子' },
    { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' }
  ]
  
  const randomIndex = Math.floor(Math.random() * quotes.length)
  dailyQuote.value = quotes[randomIndex]
}

// 生命周期
onMounted(() => {
  loadDashboardData()
  loadRecentActivities()
  loadTodayTodos()
  loadWeatherInfo()
  loadDailyQuote()
})
</script>

<style lang="scss" scoped>
@import './home.scss';
</style>
