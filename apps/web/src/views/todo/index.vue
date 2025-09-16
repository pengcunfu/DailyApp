<template>
  <div class="todo-container">
    <div class="page-header">
      <h2>待办事项</h2>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>
        添加待办
      </el-button>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="未完成" :value="0" />
            <el-option label="已完成" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="filterForm.priority" placeholder="请选择优先级" clearable>
            <el-option label="普通" :value="0" />
            <el-option label="重要" :value="1" />
            <el-option label="紧急" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filterForm.search" placeholder="搜索标题或内容" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchTodos">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ todoStats.total || 0 }}</div>
            <div class="stat-label">总任务</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ todoStats.pending || 0 }}</div>
            <div class="stat-label">待完成</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ todoStats.completed || 0 }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ todoStats.avgProgress || 0 }}%</div>
            <div class="stat-label">平均进度</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办列表 -->
    <el-card class="table-card">
      <el-table :data="todoList" v-loading="loading">
        <el-table-column width="50">
          <template #default="{ row }">
            <el-checkbox 
              :model-value="row.status === 1" 
              @change="toggleStatus(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <span :class="{ 'completed-text': row.status === 1 }">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="getPriorityType(row.priority)" 
              size="small">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="{ row }">
            {{ row.startTime ? formatDate(row.startTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="截止时间" width="180">
          <template #default="{ row }">
            <span :class="{ 'overdue-text': isOverdue(row) }">
              {{ row.endTime ? formatDate(row.endTime) : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" width="150">
          <template #default="{ row }">
            <el-tag 
              v-for="tag in row.tags" 
              :key="tag" 
              size="small" 
              class="tag-item">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editTodo(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteTodo(row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination">
      </el-pagination>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="resetForm">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入待办标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="form.priority" placeholder="请选择优先级" style="width: 100%">
                <el-option label="普通" :value="0" />
                <el-option label="重要" :value="1" />
                <el-option label="紧急" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                placeholder="请选择开始时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止时间">
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                placeholder="请选择截止时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="内容">
          <el-input 
            v-model="form.content" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入待办内容" />
        </el-form-item>

        <el-form-item label="标签">
          <el-input 
            v-model="tagInput" 
            placeholder="输入标签后按回车添加" 
            @keyup.enter="addTag" />
          <div class="tags-container">
            <el-tag 
              v-for="tag in form.tags" 
              :key="tag" 
              closable 
              @close="removeTag(tag)"
              class="tag-item">
              {{ tag }}
            </el-tag>
          </div>
        </el-form-item>

        <el-form-item label="子任务">
          <div class="details-container">
            <div 
              v-for="(detail, index) in form.details" 
              :key="index" 
              class="detail-item">
              <el-input 
                v-model="detail.content" 
                placeholder="子任务内容"
                style="flex: 1; margin-right: 10px;" />
              <el-button 
                type="danger" 
                size="small" 
                @click="removeDetail(index)">
                删除
              </el-button>
            </div>
            <el-button type="primary" size="small" @click="addDetail">
              添加子任务
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTodo" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { todoAPI } from '@/api/apis'
import { formatDate } from '@/utils'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const todoList = ref([])
const todoStats = ref({})
const dialogVisible = ref(false)
const dialogTitle = ref('添加待办')
const formRef = ref(null)
const tagInput = ref('')
const editingId = ref(null)

// 分页
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 筛选表单
const filterForm = reactive({
  status: '',
  priority: '',
  search: ''
})

// 待办表单
const form = reactive({
  title: '',
  content: '',
  priority: 0,
  startTime: '',
  endTime: '',
  tags: [],
  details: []
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ]
}

// 方法
const loadTodos = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit
    }
    
    if (filterForm.status !== '') {
      params.status = filterForm.status
    }
    if (filterForm.priority !== '') {
      params.priority = filterForm.priority
    }
    if (filterForm.search) {
      params.search = filterForm.search
    }

    const response = await todoAPI.getTodos(params)
    if (response.success) {
      todoList.value = response.data.todos
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    ElMessage.error('加载待办失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await todoAPI.getStats()
    if (response.success) {
      todoStats.value = response.data.stats
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const getPriorityType = (priority) => {
  const types = ['info', 'warning', 'danger']
  return types[priority] || 'info'
}

const getPriorityText = (priority) => {
  const texts = ['普通', '重要', '紧急']
  return texts[priority] || '普通'
}

const isOverdue = (todo) => {
  if (!todo.endTime || todo.status === 1) return false
  return new Date(todo.endTime) < new Date()
}

const toggleStatus = async (todo) => {
  try {
    await todoAPI.toggleTodo(todo._id)
    ElMessage.success('状态更新成功')
    loadTodos()
    loadStats()
  } catch (error) {
    ElMessage.error('状态更新失败')
  }
}

const showAddDialog = () => {
  dialogTitle.value = '添加待办'
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const editTodo = (todo) => {
  dialogTitle.value = '编辑待办'
  editingId.value = todo._id
  
  Object.assign(form, {
    title: todo.title,
    content: todo.content || '',
    priority: todo.priority,
    startTime: todo.startTime || '',
    endTime: todo.endTime || '',
    tags: [...(todo.tags || [])],
    details: [...(todo.details || [])]
  })
  
  dialogVisible.value = true
}

const saveTodo = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const todoData = { ...form }
    
    if (editingId.value) {
      await todoAPI.updateTodo(editingId.value, todoData)
      ElMessage.success('待办更新成功')
    } else {
      await todoAPI.createTodo(todoData)
      ElMessage.success('待办创建成功')
    }
    
    dialogVisible.value = false
    loadTodos()
    loadStats()
  } catch (error) {
    ElMessage.error(editingId.value ? '更新失败' : '创建失败')
  } finally {
    saving.value = false
  }
}

const deleteTodo = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个待办吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await todoAPI.deleteTodo(id)
    ElMessage.success('删除成功')
    loadTodos()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    title: '',
    content: '',
    priority: 0,
    startTime: '',
    endTime: '',
    tags: [],
    details: []
  })
  tagInput.value = ''
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (tag) => {
  const index = form.tags.indexOf(tag)
  if (index > -1) {
    form.tags.splice(index, 1)
  }
}

const addDetail = () => {
  form.details.push({ content: '', status: 0 })
}

const removeDetail = (index) => {
  form.details.splice(index, 1)
}

const searchTodos = () => {
  pagination.page = 1
  loadTodos()
}

const resetFilter = () => {
  filterForm.status = ''
  filterForm.priority = ''
  filterForm.search = ''
  pagination.page = 1
  loadTodos()
}

const handleSizeChange = (val) => {
  pagination.limit = val
  pagination.page = 1
  loadTodos()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  loadTodos()
}

// 生命周期
onMounted(() => {
  loadTodos()
  loadStats()
})
</script>

<style scoped>
.todo-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-item {
  padding: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.table-card {
  margin-bottom: 20px;
}

.completed-text {
  text-decoration: line-through;
  color: #999;
}

.overdue-text {
  color: #F56C6C;
  font-weight: bold;
}

.tag-item {
  margin-right: 5px;
  margin-bottom: 5px;
}

.tags-container {
  margin-top: 10px;
}

.details-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
