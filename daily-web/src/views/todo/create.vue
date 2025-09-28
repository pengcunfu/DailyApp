<template>
  <div class="todo-create-container">
    <div class="page-header">
      <h2>创建待办事项</h2>
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
    </div>

    <el-card class="form-card">
      <el-form 
        ref="todoFormRef" 
        :model="todoForm" 
        :rules="todoRules"
        label-width="100px"
        size="large"
      >
        <el-form-item label="标题" prop="title">
          <el-input 
            v-model="todoForm.title" 
            placeholder="请输入待办事项标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="内容描述" prop="content">
          <el-input 
            v-model="todoForm.content" 
            type="textarea" 
            placeholder="请输入待办事项的详细描述（可选）"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-select v-model="todoForm.priority" placeholder="请选择优先级">
            <el-option label="低" value="low">
              <span style="color: #67c23a;">● 低优先级</span>
            </el-option>
            <el-option label="中" value="medium">
              <span style="color: #e6a23c;">● 中优先级</span>
            </el-option>
            <el-option label="高" value="high">
              <span style="color: #f56c6c;">● 高优先级</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="截止日期" prop="dueDate">
          <el-date-picker
            v-model="todoForm.dueDate"
            type="datetime"
            placeholder="请选择截止日期（可选）"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="提醒设置">
          <el-switch 
            v-model="todoForm.hasReminder"
            active-text="开启提醒"
            inactive-text="关闭提醒"
          />
        </el-form-item>

        <el-form-item 
          v-if="todoForm.hasReminder" 
          label="提醒时间" 
          prop="reminderTime"
        >
          <el-date-picker
            v-model="todoForm.reminderTime"
            type="datetime"
            placeholder="请选择提醒时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="标签">
          <el-select
            v-model="todoForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入标签（可选）"
            style="width: 100%"
          >
            <el-option
              v-for="tag in predefinedTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button @click="resetForm">重置</el-button>
            <el-button type="primary" @click="submitTodo" :loading="submitting">
              创建待办事项
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 快速模板 -->
    <el-card class="template-card">
      <template #header>
        <div class="card-header">
          <span>快速模板</span>
        </div>
      </template>
      <div class="template-grid">
        <div 
          v-for="template in templates" 
          :key="template.id"
          class="template-item"
          @click="applyTemplate(template)"
        >
          <div class="template-icon">
            <el-icon>
              <component :is="template.icon" />
            </el-icon>
          </div>
          <div class="template-info">
            <h4>{{ template.name }}</h4>
            <p>{{ template.description }}</p>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Document, Calendar, Coffee, Reading, Bicycle } from '@element-plus/icons-vue'
import { todoAPI } from '@/api/apis'

const router = useRouter()

// 响应式数据
const todoFormRef = ref()
const submitting = ref(false)

// 表单数据
const todoForm = reactive({
  title: '',
  content: '',
  priority: 'medium',
  dueDate: '',
  hasReminder: false,
  reminderTime: '',
  tags: []
})

// 预定义标签
const predefinedTags = ref([
  '工作', '学习', '生活', '健康', '娱乐', '购物', '重要', '紧急'
])

// 快速模板
const templates = ref([
  {
    id: 1,
    name: '工作任务',
    description: '创建一个工作相关的待办事项',
    icon: Document,
    data: {
      title: '',
      content: '',
      priority: 'high',
      tags: ['工作', '重要']
    }
  },
  {
    id: 2,
    name: '会议安排',
    description: '安排一个会议或约会',
    icon: Calendar,
    data: {
      title: '',
      content: '',
      priority: 'medium',
      tags: ['工作', '会议']
    }
  },
  {
    id: 3,
    name: '学习计划',
    description: '制定学习相关的计划',
    icon: Reading,
    data: {
      title: '',
      content: '',
      priority: 'medium',
      tags: ['学习']
    }
  },
  {
    id: 4,
    name: '生活琐事',
    description: '日常生活中的小事情',
    icon: Coffee,
    data: {
      title: '',
      content: '',
      priority: 'low',
      tags: ['生活']
    }
  }
])

// 表单验证规则
const todoRules = {
  title: [
    { required: true, message: '请输入待办事项标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  reminderTime: [
    {
      validator: (rule, value, callback) => {
        if (todoForm.hasReminder && !value) {
          callback(new Error('开启提醒时必须设置提醒时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 应用模板
const applyTemplate = (template) => {
  Object.assign(todoForm, template.data)
}

// 重置表单
const resetForm = () => {
  if (todoFormRef.value) {
    todoFormRef.value.resetFields()
  }
  todoForm.title = ''
  todoForm.content = ''
  todoForm.priority = 'medium'
  todoForm.dueDate = ''
  todoForm.hasReminder = false
  todoForm.reminderTime = ''
  todoForm.tags = []
}

// 提交待办事项
const submitTodo = async () => {
  if (!todoFormRef.value) return
  
  try {
    await todoFormRef.value.validate()
    
    submitting.value = true
    
    const todoData = {
      ...todoForm,
      status: 'pending'
    }
    
    // 如果没有开启提醒，清空提醒时间
    if (!todoData.hasReminder) {
      todoData.reminderTime = ''
    }
    
    await todoAPI.create(todoData)
    ElMessage.success('待办事项创建成功')
    
    // 跳转到列表页面
    router.push('/todo')
  } catch (error) {
    console.error('创建待办事项失败:', error)
    ElMessage.error('创建待办事项失败')
  } finally {
    submitting.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/todo')
}
</script>

<style scoped>
.todo-create-container {
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

.form-card {
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.template-card {
  margin-top: 20px;
}

.card-header {
  font-weight: bold;
  color: #333;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.template-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.template-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.template-icon {
  margin-right: 10px;
  font-size: 20px;
  color: #409eff;
}

.template-info h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #333;
}

.template-info p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
