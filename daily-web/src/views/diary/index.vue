<template>
  <div class="diary-container">
    <!-- 头部操作区 -->
    <div class="diary-header">
      <div class="left-actions">
        <el-input
          v-model="searchText"
          placeholder="搜索日记内容..."
          prefix-icon="Search"
          clearable
          style="width: 300px"
          @input="handleSearch"
        />
        <el-select
          v-model="searchMood"
          placeholder="筛选心情"
          clearable
          style="width: 120px; margin-left: 10px"
        >
          <el-option label="开心" value="happy" />
          <el-option label="平静" value="calm" />
          <el-option label="忧伤" value="sad" />
          <el-option label="兴奋" value="excited" />
          <el-option label="焦虑" value="anxious" />
          <el-option label="愤怒" value="angry" />
        </el-select>
      </div>
      <div class="right-actions">
        <el-button type="primary" :icon="EditPen" @click="showAddDialog = true">
          写日记
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon">
                <el-icon color="#409EFF"><Document /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.total }}</div>
                <div class="stats-label">总日记数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon">
                <el-icon color="#67C23A"><Calendar /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.thisMonth }}</div>
                <div class="stats-label">本月日记</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon">
                <el-icon color="#E6A23C"><Star /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.avgMood }}</div>
                <div class="stats-label">平均心情</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon">
                <el-icon color="#F56C6C"><Timer /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.streak }}</div>
                <div class="stats-label">连续记录</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 日记列表 -->
    <el-card class="diary-list-card">
      <template #header>
        <div class="card-header">
          <span>我的日记</span>
        </div>
      </template>

      <div class="diary-timeline">
        <el-timeline v-if="diaryList.length > 0">
          <el-timeline-item
            v-for="diary in paginatedDiaries"
            :key="diary._id"
            :timestamp="formatDate(diary.date)"
            placement="top"
          >
            <el-card class="diary-item">
              <div class="diary-header">
                <div class="diary-title">{{ diary.title }}</div>
                <div class="diary-mood">
                  <span :class="getMoodClass(diary.mood)">{{ getMoodText(diary.mood) }}</span>
                </div>
              </div>
              <div class="diary-content">{{ diary.content }}</div>
              <div class="diary-weather" v-if="diary.weather">
                <el-tag type="info" size="small">
                  <el-icon><Sunny /></el-icon>
                  {{ diary.weather }}
                </el-tag>
              </div>
              <div class="diary-tags" v-if="diary.tags && diary.tags.length > 0">
                <el-tag
                  v-for="tag in diary.tags"
                  :key="tag"
                  size="small"
                  style="margin-right: 5px"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <div class="diary-actions">
                <el-button link type="primary" @click="editDiary(diary)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button link type="danger" @click="deleteDiary(diary._id)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>

        <el-empty v-else description="还没有写过日记，快开始记录生活吧！" />
      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="diaryList.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredDiaries.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑日记对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingDiary ? '编辑日记' : '写日记'"
      width="60%"
      :before-close="handleDialogClose"
    >
      <el-form :model="diaryForm" :rules="diaryRules" ref="diaryFormRef" label-width="100px">
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="diaryForm.date"
            type="datetime"
            placeholder="选择日期时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="diaryForm.title"
            placeholder="给今天写个标题吧..."
          />
        </el-form-item>

        <el-form-item label="心情" prop="mood">
          <el-radio-group v-model="diaryForm.mood">
            <el-radio-button label="happy">😊 开心</el-radio-button>
            <el-radio-button label="calm">😌 平静</el-radio-button>
            <el-radio-button label="sad">😢 忧伤</el-radio-button>
            <el-radio-button label="excited">🤩 兴奋</el-radio-button>
            <el-radio-button label="anxious">😰 焦虑</el-radio-button>
            <el-radio-button label="angry">😠 愤怒</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="天气">
          <el-select v-model="diaryForm.weather" placeholder="今天天气如何？" clearable>
            <el-option label="☀️ 晴天" value="sunny" />
            <el-option label="⛅ 多云" value="cloudy" />
            <el-option label="🌧️ 雨天" value="rainy" />
            <el-option label="❄️ 雪天" value="snowy" />
            <el-option label="🌫️ 雾天" value="foggy" />
            <el-option label="🌪️ 风天" value="windy" />
          </el-select>
        </el-form-item>

        <el-form-item label="标签">
          <el-select
            v-model="diaryForm.tags"
            multiple
            filterable
            allow-create
            placeholder="添加标签..."
            style="width: 100%"
          >
            <el-option
              v-for="tag in commonTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            v-model="diaryForm.content"
            type="textarea"
            :rows="8"
            placeholder="记录今天的所思所想..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="saveDiary" :loading="saving">
            {{ editingDiary ? '更新' : '保存' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  EditPen,
  Search,
  Document,
  Calendar,
  Star,
  Timer,
  Sunny,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { diaryAPI } from '@/api/apis'

// 响应式数据
const diaryList = ref([])
const stats = ref({
  total: 0,
  thisMonth: 0,
  avgMood: 0,
  streak: 0
})
const searchText = ref('')
const searchMood = ref('')
const showAddDialog = ref(false)
const editingDiary = ref(null)
const saving = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// 表单数据
const diaryForm = reactive({
  date: '',
  title: '',
  mood: 'calm',
  weather: '',
  tags: [],
  content: ''
})

// 表单验证规则
const diaryRules = {
  date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 1, max: 50, message: '标题长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  mood: [
    { required: true, message: '请选择心情', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入日记内容', trigger: 'blur' },
    { min: 10, message: '内容至少10个字符', trigger: 'blur' }
  ]
}

// 常用标签
const commonTags = [
  '工作', '学习', '生活', '旅行', '运动', '美食', '电影', '音乐',
  '朋友', '家人', '爱情', '成长', '反思', '计划', '目标', '感恩'
]

// 表单引用
const diaryFormRef = ref()

// 计算属性
const filteredDiaries = computed(() => {
  let filtered = diaryList.value

  if (searchText.value) {
    filtered = filtered.filter(diary =>
      diary.title.includes(searchText.value) ||
      diary.content.includes(searchText.value)
    )
  }

  if (searchMood.value) {
    filtered = filtered.filter(diary => diary.mood === searchMood.value)
  }

  return filtered
})

const paginatedDiaries = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredDiaries.value.slice(start, end)
})

// 方法
const loadDiaries = async () => {
  try {
    const res = await diaryAPI.getList()
    diaryList.value = res.data.diaries || []
  } catch (error) {
    console.error('获取日记列表失败:', error)
    ElMessage.error('获取日记列表失败')
  }
}

const loadStats = async () => {
  try {
    const res = await diaryAPI.getStats()
    stats.value = res.data || {
      total: 0,
      thisMonth: 0,
      avgMood: 0,
      streak: 0
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}

const getMoodClass = (mood) => {
  const moodClasses = {
    happy: 'mood-happy',
    calm: 'mood-calm',
    sad: 'mood-sad',
    excited: 'mood-excited',
    anxious: 'mood-anxious',
    angry: 'mood-angry'
  }
  return moodClasses[mood] || 'mood-calm'
}

const getMoodText = (mood) => {
  const moodTexts = {
    happy: '😊 开心',
    calm: '😌 平静',
    sad: '😢 忧伤',
    excited: '🤩 兴奋',
    anxious: '😰 焦虑',
    angry: '😠 愤怒'
  }
  return moodTexts[mood] || '😌 平静'
}

const editDiary = (diary) => {
  editingDiary.value = diary
  Object.assign(diaryForm, {
    date: diary.date,
    title: diary.title,
    mood: diary.mood,
    weather: diary.weather || '',
    tags: diary.tags || [],
    content: diary.content
  })
  showAddDialog.value = true
}

const deleteDiary = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这篇日记吗？此操作不可恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await diaryAPI.delete(id)
    ElMessage.success('删除成功')
    await loadDiaries()
    await loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除日记失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const saveDiary = async () => {
  if (!diaryFormRef.value) return

  try {
    await diaryFormRef.value.validate()
    saving.value = true

    if (editingDiary.value) {
      await diaryAPI.update(editingDiary.value._id, diaryForm)
      ElMessage.success('更新成功')
    } else {
      await diaryAPI.create(diaryForm)
      ElMessage.success('保存成功')
    }

    showAddDialog.value = false
    await loadDiaries()
    await loadStats()
  } catch (error) {
    if (error !== false) {
      console.error('保存日记失败:', error)
      ElMessage.error('保存失败')
    }
  } finally {
    saving.value = false
  }
}

const handleDialogClose = () => {
  showAddDialog.value = false
  editingDiary.value = null
  diaryFormRef.value?.resetFields()
  Object.assign(diaryForm, {
    date: '',
    title: '',
    mood: 'calm',
    weather: '',
    tags: [],
    content: ''
  })
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 初始化
onMounted(() => {
  loadDiaries()
  loadStats()
  // 设置默认日期为当前时间
  diaryForm.date = new Date().toISOString().slice(0, 19).replace('T', ' ')
})
</script>

<style scoped>
.diary-container {
  padding: 20px;
}

.diary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.left-actions {
  display: flex;
  align-items: center;
}

.stats-cards {
  margin-bottom: 20px;
}

.stats-card {
  text-align: center;
}

.stats-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-icon {
  font-size: 24px;
  margin-right: 15px;
}

.stats-info {
  text-align: left;
}

.stats-number {
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 5px;
}

.stats-label {
  font-size: 14px;
  color: #666;
}

.diary-list-card {
  min-height: 500px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.diary-timeline {
  margin-top: 20px;
}

.diary-item {
  margin-bottom: 10px;
}

.diary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.diary-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.diary-mood {
  font-size: 14px;
}

.mood-happy { color: #f56c6c; }
.mood-calm { color: #67c23a; }
.mood-sad { color: #909399; }
.mood-excited { color: #e6a23c; }
.mood-anxious { color: #f56c6c; }
.mood-angry { color: #f56c6c; }

.diary-content {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #666;
}

.diary-weather {
  margin-bottom: 10px;
}

.diary-tags {
  margin-bottom: 15px;
}

.diary-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
