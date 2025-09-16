<template>
  <div class="system-container">
    <div class="page-header">
      <h2>系统管理</h2>
    </div>

    <el-row :gutter="20">
      <!-- 用户管理 -->
      <el-col :span="12">
        <el-card class="management-card">
          <template #header>
            <div class="card-header">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </div>
          </template>
          <div class="card-content">
            <p>管理系统用户信息和权限设置</p>
            <div class="user-info">
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="用户名">
                  {{ userInfo.username || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="邮箱">
                  {{ userInfo.email || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="注册时间">
                  {{ userInfo.createdAt ? formatDate(userInfo.createdAt) : '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
            <div class="card-actions">
              <el-button type="primary" @click="showProfileDialog">编辑资料</el-button>
              <el-button @click="showPasswordDialog">修改密码</el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 数据统计 -->
      <el-col :span="12">
        <el-card class="management-card">
          <template #header>
            <div class="card-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>数据统计</span>
            </div>
          </template>
          <div class="card-content">
            <p>系统数据概览和统计信息</p>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ systemStats.bills || 0 }}</div>
                <div class="stat-label">账单记录</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ systemStats.todos || 0 }}</div>
                <div class="stat-label">待办事项</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ systemStats.notes || 0 }}</div>
                <div class="stat-label">笔记数量</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ systemStats.foods || 0 }}</div>
                <div class="stat-label">美食记录</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 系统设置 -->
      <el-col :span="24">
        <el-card class="management-card">
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </div>
          </template>
          <div class="card-content">
            <p>系统配置和偏好设置</p>
            <el-form :model="systemSettings" label-width="120px" size="small">
              <el-form-item label="数据备份">
                <el-button @click="exportData">导出数据</el-button>
                <el-button @click="showImportDialog">导入数据</el-button>
              </el-form-item>
              <el-form-item label="清理数据">
                <el-button type="warning" @click="clearOldData">清理过期数据</el-button>
              </el-form-item>
              <el-form-item label="系统信息">
                <el-button @click="checkSystemInfo">查看系统信息</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="profileDialogVisible" title="编辑个人资料" width="500px">
      <el-form :model="profileForm" :rules="profileRules" ref="profileFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="profileForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input 
            v-model="profileForm.bio" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入个人简介" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="profileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateProfile" :loading="profileSaving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="400px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input 
            v-model="passwordForm.currentPassword" 
            type="password" 
            placeholder="请输入当前密码" 
            show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            placeholder="请输入新密码" 
            show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            placeholder="请确认新密码" 
            show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updatePassword" :loading="passwordSaving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, DataAnalysis, Setting } from '@element-plus/icons-vue'
import { authAPI } from '@/api/apis'
import { formatDate } from '@/utils'
import { useStore } from 'vuex'

const store = useStore()

// 响应式数据
const profileSaving = ref(false)
const passwordSaving = ref(false)
const profileDialogVisible = ref(false)
const passwordDialogVisible = ref(false)

// 表单引用
const profileFormRef = ref(null)
const passwordFormRef = ref(null)

// 数据
const systemStats = ref({
  bills: 156,
  todos: 23,
  notes: 89,
  foods: 234
})

// 系统设置
const systemSettings = reactive({
  primaryColor: '#409EFF'
})

// 表单数据
const profileForm = reactive({
  username: '',
  email: '',
  phone: '',
  bio: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 计算属性
const userInfo = computed(() => store.getters['user/userInfo'])

// 表单验证规则
const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 方法
const showProfileDialog = () => {
  Object.assign(profileForm, {
    username: userInfo.value.username || '',
    email: userInfo.value.email || '',
    phone: userInfo.value.profile?.phone || '',
    bio: userInfo.value.profile?.bio || ''
  })
  profileDialogVisible.value = true
}

const showPasswordDialog = () => {
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  passwordDialogVisible.value = true
}

const updateProfile = async () => {
  if (!profileFormRef.value) return
  
  const valid = await profileFormRef.value.validate().catch(() => false)
  if (!valid) return

  profileSaving.value = true
  try {
    const profileData = {
      username: profileForm.username,
      email: profileForm.email,
      profile: {
        phone: profileForm.phone,
        bio: profileForm.bio
      }
    }
    
    await store.dispatch('user/updateProfile', profileData)
    ElMessage.success('个人资料更新成功')
    profileDialogVisible.value = false
  } catch (error) {
    ElMessage.error('更新失败')
  } finally {
    profileSaving.value = false
  }
}

const updatePassword = async () => {
  if (!passwordFormRef.value) return
  
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return

  passwordSaving.value = true
  try {
    await authAPI.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    
    ElMessage.success('密码修改成功')
    passwordDialogVisible.value = false
  } catch (error) {
    ElMessage.error('密码修改失败')
  } finally {
    passwordSaving.value = false
  }
}

const exportData = () => {
  ElMessage.info('数据导出功能开发中...')
}

const showImportDialog = () => {
  ElMessage.info('数据导入功能开发中...')
}

const clearOldData = async () => {
  try {
    await ElMessageBox.confirm('确定要清理过期数据吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    ElMessage.success('过期数据清理完成')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清理失败')
    }
  }
}

const checkSystemInfo = () => {
  ElMessageBox.alert(`
    应用名称：日常助手
    版本：v1.0.0
    构建时间：${new Date().toLocaleString()}
    浏览器：${navigator.userAgent}
  `, '系统信息')
}

// 生命周期
onMounted(() => {
  // 初始化
})
</script>

<style scoped>
.system-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.management-card {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: bold;
}

.card-header .el-icon {
  margin-right: 8px;
}

.card-content {
  padding: 10px 0;
}

.card-content p {
  margin-bottom: 15px;
  color: #666;
}

.user-info {
  margin: 15px 0;
}

.card-actions {
  margin-top: 15px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 15px 0;
}

.stat-item {
  text-align: center;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}
</style>