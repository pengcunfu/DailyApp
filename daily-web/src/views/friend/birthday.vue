<template>
  <div class="friend-birthday-container">
    <div class="page-header">
      <h2>朋友生日管理</h2>
      <div class="header-actions">
        <el-button @click="showBirthdayReminder">
          <el-icon><Bell /></el-icon>
          生日提醒设置
        </el-button>
        <el-button type="primary" @click="goToAddFriend">
          <el-icon><Plus /></el-icon>
          添加朋友
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stats-card">
        <div class="stats-item">
          <div class="stats-icon today">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ todayBirthdays.length }}</div>
            <div class="stats-label">今日生日</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stats-card">
        <div class="stats-item">
          <div class="stats-icon week">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ weekBirthdays.length }}</div>
            <div class="stats-label">本周生日</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stats-card">
        <div class="stats-item">
          <div class="stats-icon month">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ monthBirthdays.length }}</div>
            <div class="stats-label">本月生日</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stats-card">
        <div class="stats-item">
          <div class="stats-icon total">
            <el-icon><User /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ totalFriends }}</div>
            <div class="stats-label">朋友总数</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 筛选器 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="时间范围">
          <el-select v-model="filterForm.timeRange" placeholder="选择时间范围">
            <el-option label="今天" value="today" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="未来三个月" value="quarter" />
            <el-option label="全部" value="all" />
          </el-select>
        </el-form-item>
        <el-form-item label="关系">
          <el-select v-model="filterForm.relationship" placeholder="选择关系" clearable>
            <el-option label="朋友" value="friend" />
            <el-option label="同事" value="colleague" />
            <el-option label="同学" value="classmate" />
            <el-option label="家人" value="family" />
            <el-option label="恋人" value="lover" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 生日列表 -->
    <el-card class="birthday-list-card">
      <div class="birthday-timeline">
        <div 
          v-for="group in groupedBirthdays" 
          :key="group.date"
          class="birthday-group"
        >
          <div class="group-header">
            <div class="group-date">
              <span class="date-text">{{ formatGroupDate(group.date) }}</span>
              <el-tag 
                v-if="isToday(group.date)" 
                type="danger" 
                size="small"
                effect="dark"
              >
                今天
              </el-tag>
              <el-tag 
                v-else-if="isThisWeek(group.date)" 
                type="warning" 
                size="small"
              >
                本周
              </el-tag>
            </div>
            <div class="group-count">{{ group.friends.length }} 位朋友</div>
          </div>
          
          <div class="friends-list">
            <div 
              v-for="friend in group.friends" 
              :key="friend._id"
              class="friend-item"
              :class="{ 'today-birthday': isToday(friend.birthday) }"
            >
              <div class="friend-avatar">
                <img v-if="friend.avatar" :src="friend.avatar" :alt="friend.name" />
                <div v-else class="avatar-placeholder">
                  {{ friend.name.charAt(0) }}
                </div>
              </div>
              
              <div class="friend-info">
                <h4>{{ friend.name }}</h4>
                <p class="friend-details">
                  <span class="relationship">{{ getRelationshipText(friend.relationship) }}</span>
                  <span class="age" v-if="friend.birthday">{{ calculateAge(friend.birthday) }} 岁</span>
                </p>
                <p class="birthday-info">
                  <span>生日：{{ formatBirthday(friend.birthday) }}</span>
                  <span class="days-left">{{ getDaysLeft(friend.birthday) }}</span>
                </p>
              </div>
              
              <div class="friend-actions">
                <el-button size="small" @click="sendBirthdayWish(friend)">
                  <el-icon><Message /></el-icon>
                  发送祝福
                </el-button>
                <el-button size="small" @click="editBirthdayReminder(friend)">
                  <el-icon><Bell /></el-icon>
                  提醒设置
                </el-button>
                <el-button size="small" @click="viewFriendDetail(friend)">
                  <el-icon><View /></el-icon>
                  查看详情
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="filteredFriends.length === 0" description="暂无朋友生日信息">
        <el-button type="primary" @click="goToAddFriend">添加第一个朋友</el-button>
      </el-empty>
    </el-card>

    <!-- 生日祝福对话框 -->
    <el-dialog v-model="wishDialogVisible" title="发送生日祝福" width="500px">
      <div v-if="selectedFriend" class="wish-dialog-content">
        <div class="friend-summary">
          <div class="friend-avatar">
            <img v-if="selectedFriend.avatar" :src="selectedFriend.avatar" :alt="selectedFriend.name" />
            <div v-else class="avatar-placeholder">
              {{ selectedFriend.name.charAt(0) }}
            </div>
          </div>
          <div class="friend-info">
            <h3>{{ selectedFriend.name }}</h3>
            <p>{{ formatBirthday(selectedFriend.birthday) }} 生日快乐！</p>
          </div>
        </div>
        
        <el-form :model="wishForm" label-width="80px">
          <el-form-item label="祝福语">
            <el-input 
              v-model="wishForm.message" 
              type="textarea" 
              :rows="4"
              placeholder="写下您的生日祝福..."
            />
          </el-form-item>
          <el-form-item label="发送方式">
            <el-checkbox-group v-model="wishForm.methods">
              <el-checkbox label="微信">微信</el-checkbox>
              <el-checkbox label="短信">短信</el-checkbox>
              <el-checkbox label="QQ">QQ</el-checkbox>
              <el-checkbox label="邮件">邮件</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="wishDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="sendWish">发送祝福</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 提醒设置对话框 -->
    <el-dialog v-model="reminderDialogVisible" title="生日提醒设置" width="500px">
      <div v-if="selectedFriend" class="reminder-dialog-content">
        <h4>{{ selectedFriend.name }} 的生日提醒</h4>
        <el-form :model="reminderForm" label-width="100px">
          <el-form-item label="提醒时间">
            <el-checkbox-group v-model="reminderForm.reminderDays">
              <el-checkbox :label="30">提前30天</el-checkbox>
              <el-checkbox :label="7">提前一周</el-checkbox>
              <el-checkbox :label="3">提前3天</el-checkbox>
              <el-checkbox :label="1">提前1天</el-checkbox>
              <el-checkbox :label="0">当天</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="提醒方式">
            <el-checkbox-group v-model="reminderForm.reminderMethods">
              <el-checkbox label="系统通知">系统通知</el-checkbox>
              <el-checkbox label="邮件提醒">邮件提醒</el-checkbox>
              <el-checkbox label="短信提醒">短信提醒</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reminderDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveReminderSettings">保存设置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Bell, Plus, Calendar, Clock, Star, User, 
  Message, View 
} from '@element-plus/icons-vue'
import { friendAPI } from '@/api/apis'
import { formatDate } from '@/utils'

const router = useRouter()

// 响应式数据
const friends = ref([])
const wishDialogVisible = ref(false)
const reminderDialogVisible = ref(false)
const selectedFriend = ref(null)

// 筛选表单
const filterForm = reactive({
  timeRange: 'all',
  relationship: ''
})

// 祝福表单
const wishForm = reactive({
  message: '',
  methods: []
})

// 提醒表单
const reminderForm = reactive({
  reminderDays: [7, 1, 0],
  reminderMethods: ['系统通知']
})

// 计算属性
const totalFriends = computed(() => friends.value.length)

const todayBirthdays = computed(() => {
  const today = new Date()
  return friends.value.filter(friend => {
    if (!friend.birthday) return false
    const birthday = new Date(friend.birthday)
    return birthday.getMonth() === today.getMonth() && 
           birthday.getDate() === today.getDate()
  })
})

const weekBirthdays = computed(() => {
  const today = new Date()
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return friends.value.filter(friend => {
    if (!friend.birthday) return false
    const birthday = new Date(friend.birthday)
    const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate())
    
    return thisYearBirthday >= today && thisYearBirthday <= weekFromNow
  })
})

const monthBirthdays = computed(() => {
  const today = new Date()
  return friends.value.filter(friend => {
    if (!friend.birthday) return false
    const birthday = new Date(friend.birthday)
    return birthday.getMonth() === today.getMonth()
  })
})

const filteredFriends = computed(() => {
  let result = friends.value.filter(friend => friend.birthday)
  
  // 按关系筛选
  if (filterForm.relationship) {
    result = result.filter(friend => friend.relationship === filterForm.relationship)
  }
  
  // 按时间范围筛选
  const today = new Date()
  switch (filterForm.timeRange) {
    case 'today':
      result = result.filter(friend => {
        const birthday = new Date(friend.birthday)
        return birthday.getMonth() === today.getMonth() && 
               birthday.getDate() === today.getDate()
      })
      break
    case 'week':
      result = weekBirthdays.value
      break
    case 'month':
      result = monthBirthdays.value
      break
    case 'quarter':
      const quarterFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
      result = result.filter(friend => {
        const birthday = new Date(friend.birthday)
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate())
        return thisYearBirthday >= today && thisYearBirthday <= quarterFromNow
      })
      break
  }
  
  return result
})

const groupedBirthdays = computed(() => {
  const groups = {}
  
  filteredFriends.value.forEach(friend => {
    const birthday = new Date(friend.birthday)
    const dateKey = `${birthday.getMonth()}-${birthday.getDate()}`
    
    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: dateKey,
        friends: []
      }
    }
    
    groups[dateKey].friends.push(friend)
  })
  
  // 按日期排序
  return Object.values(groups).sort((a, b) => {
    const [aMonth, aDay] = a.date.split('-').map(Number)
    const [bMonth, bDay] = b.date.split('-').map(Number)
    
    if (aMonth !== bMonth) return aMonth - bMonth
    return aDay - bDay
  })
})

// 获取朋友列表
const fetchFriends = async () => {
  try {
    const response = await friendAPI.getList()
    friends.value = response.data || []
  } catch (error) {
    console.error('获取朋友列表失败:', error)
    ElMessage.error('获取朋友列表失败')
  }
}

// 格式化分组日期
const formatGroupDate = (dateKey) => {
  const [month, day] = dateKey.split('-').map(Number)
  const date = new Date(2024, month, day)
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
}

// 格式化生日
const formatBirthday = (birthday) => {
  if (!birthday) return ''
  const date = new Date(birthday)
  return date.toLocaleDateString('zh-CN', { 
    month: 'long', 
    day: 'numeric'
  })
}

// 计算年龄
const calculateAge = (birthday) => {
  if (!birthday) return 0
  const today = new Date()
  const birthDate = new Date(birthday)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

// 获取剩余天数
const getDaysLeft = (birthday) => {
  if (!birthday) return ''
  
  const today = new Date()
  const birthDate = new Date(birthday)
  const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
  
  if (thisYearBirthday < today) {
    thisYearBirthday.setFullYear(today.getFullYear() + 1)
  }
  
  const diffTime = thisYearBirthday - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays <= 7) return `${diffDays}天后`
  return `${diffDays}天后`
}

// 判断是否是今天
const isToday = (birthday) => {
  if (!birthday) return false
  const today = new Date()
  const birthDate = new Date(birthday)
  return birthDate.getMonth() === today.getMonth() && 
         birthDate.getDate() === today.getDate()
}

// 判断是否是本周
const isThisWeek = (dateKey) => {
  const [month, day] = dateKey.split('-').map(Number)
  const today = new Date()
  const thisYearDate = new Date(today.getFullYear(), month, day)
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return thisYearDate >= today && thisYearDate <= weekFromNow
}

// 获取关系文本
const getRelationshipText = (relationship) => {
  const relationshipMap = {
    friend: '朋友',
    colleague: '同事',
    classmate: '同学',
    family: '家人',
    lover: '恋人',
    other: '其他'
  }
  return relationshipMap[relationship] || '朋友'
}

// 重置筛选
const resetFilter = () => {
  filterForm.timeRange = 'all'
  filterForm.relationship = ''
}

// 发送生日祝福
const sendBirthdayWish = (friend) => {
  selectedFriend.value = friend
  wishForm.message = `${friend.name}，生日快乐！愿你的生活充满阳光和快乐！🎂🎉`
  wishForm.methods = []
  wishDialogVisible.value = true
}

// 发送祝福
const sendWish = () => {
  if (!wishForm.message.trim()) {
    ElMessage.warning('请输入祝福语')
    return
  }
  
  if (wishForm.methods.length === 0) {
    ElMessage.warning('请选择发送方式')
    return
  }
  
  // 这里可以集成实际的发送逻辑
  ElMessage.success(`生日祝福已通过 ${wishForm.methods.join('、')} 发送给 ${selectedFriend.value.name}`)
  wishDialogVisible.value = false
}

// 编辑生日提醒
const editBirthdayReminder = (friend) => {
  selectedFriend.value = friend
  // 这里可以加载已有的提醒设置
  reminderDialogVisible.value = true
}

// 保存提醒设置
const saveReminderSettings = () => {
  ElMessage.success(`已为 ${selectedFriend.value.name} 设置生日提醒`)
  reminderDialogVisible.value = false
}

// 查看朋友详情
const viewFriendDetail = (friend) => {
  router.push(`/friend/view/${friend._id}`)
}

// 显示生日提醒设置
const showBirthdayReminder = () => {
  ElMessage.info('生日提醒功能开发中...')
}

// 跳转到添加朋友页面
const goToAddFriend = () => {
  router.push('/friend/create')
}

// 组件挂载时获取数据
onMounted(() => {
  fetchFriends()
})
</script>

<style scoped>
.friend-birthday-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stats-card {
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stats-item {
  display: flex;
  align-items: center;
}

.stats-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  margin-right: 15px;
}

.stats-icon.today { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stats-icon.week { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stats-icon.month { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stats-icon.total { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.stats-content {
  flex: 1;
}

.stats-number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.stats-label {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.filter-card {
  margin-bottom: 20px;
}

.birthday-list-card {
  margin-bottom: 20px;
}

/* 生日时间线 */
.birthday-timeline {
  padding: 10px 0;
}

.birthday-group {
  margin-bottom: 30px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 20px;
}

.group-date {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.group-count {
  font-size: 14px;
  color: #666;
}

.friends-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
}

.friend-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.friend-item.today-birthday {
  border-color: #f56c6c;
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
}

.friend-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
  flex-shrink: 0;
}

.friend-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-info h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
}

.friend-details {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #666;
}

.relationship {
  margin-right: 15px;
}

.birthday-info {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.days-left {
  margin-left: 15px;
  padding: 2px 8px;
  background: #f0f9ff;
  color: #1890ff;
  border-radius: 12px;
  font-size: 12px;
}

.friend-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 对话框样式 */
.wish-dialog-content {
  padding: 10px 0;
}

.friend-summary {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.friend-summary .friend-avatar {
  width: 50px;
  height: 50px;
  margin-right: 15px;
}

.friend-summary .avatar-placeholder {
  font-size: 20px;
}

.friend-summary .friend-info h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.friend-summary .friend-info p {
  margin: 0;
  color: #666;
}

.reminder-dialog-content h4 {
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-empty) {
  padding: 60px 0;
}
</style>
