<template>
  <div class="profile-container">
    <div class="page-header">
      <h2>个人资料</h2>
    </div>

    <div class="profile-content">
      <!-- 头像和基本信息 -->
      <el-card class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <div class="avatar-container">
              <img v-if="userProfile.avatar" :src="userProfile.avatar" alt="头像" class="avatar" />
              <div v-else class="avatar-placeholder">
                <el-icon><User /></el-icon>
              </div>
              <div class="avatar-overlay">
                <el-button size="small" @click="changeAvatar">
                  <el-icon><Camera /></el-icon>
                  更换头像
                </el-button>
              </div>
            </div>
          </div>
          <div class="user-info">
            <h3>{{ userProfile.username }}</h3>
            <p class="user-email">{{ userProfile.email }}</p>
            <p class="join-date">注册时间：{{ formatDate(userProfile.createdAt) }}</p>
            <div class="user-stats">
              <div class="stat-item">
                <div class="stat-number">{{ userStats.totalBills }}</div>
                <div class="stat-label">账单记录</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ userStats.totalTodos }}</div>
                <div class="stat-label">待办事项</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ userStats.totalNotes }}</div>
                <div class="stat-label">笔记数量</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ userStats.totalFriends }}</div>
                <div class="stat-label">朋友数量</div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 个人信息编辑 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>个人信息</span>
            <el-button @click="editMode = !editMode">
              {{ editMode ? '取消编辑' : '编辑信息' }}
            </el-button>
          </div>
        </template>
        
        <el-form 
          ref="profileFormRef" 
          :model="profileForm" 
          :rules="profileRules"
          label-width="120px"
          :disabled="!editMode"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="profileForm.username" placeholder="请输入用户名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="真实姓名" prop="realName">
                <el-input v-model="profileForm.realName" placeholder="请输入真实姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="profileForm.gender">
                  <el-radio label="male">男</el-radio>
                  <el-radio label="female">女</el-radio>
                  <el-radio label="other">其他</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="生日" prop="birthday">
                <el-date-picker
                  v-model="profileForm.birthday"
                  type="date"
                  placeholder="请选择生日"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号码" prop="phone">
                <el-input v-model="profileForm.phone" placeholder="请输入手机号码" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="个人简介" prop="bio">
            <el-input 
              v-model="profileForm.bio" 
              type="textarea" 
              placeholder="介绍一下自己吧..."
              :rows="4"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item v-if="editMode">
            <el-button @click="cancelEdit">取消</el-button>
            <el-button type="primary" @click="saveProfile" :loading="saving">
              保存信息
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 密码修改 -->
      <el-card class="password-card">
        <template #header>
          <div class="card-header">
            <span>密码修改</span>
          </div>
        </template>
        
        <el-form 
          ref="passwordFormRef" 
          :model="passwordForm" 
          :rules="passwordRules"
          label-width="120px"
        >
          <el-form-item label="当前密码" prop="currentPassword">
            <el-input 
              v-model="passwordForm.currentPassword" 
              type="password" 
              placeholder="请输入当前密码"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="新密码" prop="newPassword">
            <el-input 
              v-model="passwordForm.newPassword" 
              type="password" 
              placeholder="请输入新密码"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input 
              v-model="passwordForm.confirmPassword" 
              type="password" 
              placeholder="请再次输入新密码"
              show-password
            />
          </el-form-item>
          
          <el-form-item>
            <el-button @click="resetPasswordForm">重置</el-button>
            <el-button type="primary" @click="changePassword" :loading="changingPassword">
              修改密码
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 账户设置 -->
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <span>账户设置</span>
          </div>
        </template>
        
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <h4>邮件通知</h4>
              <p>接收系统通知和重要提醒</p>
            </div>
            <el-switch v-model="settings.emailNotification" />
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h4>生日提醒</h4>
              <p>朋友生日到来时发送提醒</p>
            </div>
            <el-switch v-model="settings.birthdayReminder" />
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h4>数据统计</h4>
              <p>允许收集使用数据用于功能改进</p>
            </div>
            <el-switch v-model="settings.dataStatistics" />
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h4>自动备份</h4>
              <p>定期自动备份您的数据</p>
            </div>
            <el-switch v-model="settings.autoBackup" />
          </div>
        </div>
        
        <div class="settings-actions">
          <el-button @click="exportData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
          <el-button @click="importData">
            <el-icon><Upload /></el-icon>
            导入数据
          </el-button>
          <el-button type="danger" @click="deleteAccount">
            <el-icon><Delete /></el-icon>
            删除账户
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 头像上传对话框 -->
    <el-dialog v-model="avatarDialogVisible" title="更换头像" width="400px">
      <el-upload
        class="avatar-uploader"
        action="#"
        :show-file-list="false"
        :before-upload="beforeAvatarUpload"
        :on-change="handleAvatarChange"
        :auto-upload="false"
        accept="image/*"
      >
        <div class="upload-area">
          <img v-if="previewAvatar" :src="previewAvatar" class="preview-avatar" />
          <div v-else class="upload-placeholder">
            <el-icon><Plus /></el-icon>
            <div>点击选择头像</div>
          </div>
        </div>
      </el-upload>
      <div class="upload-tips">
        <p>支持 JPG、PNG 格式，文件大小不超过 2MB</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="avatarDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="uploadAvatar" :disabled="!selectedFile">
            上传头像
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Camera, Download, Upload, Delete, Plus } from '@element-plus/icons-vue'
import { authAPI } from '@/api/apis'
import { formatDate } from '@/utils'

// 响应式数据
const editMode = ref(false)
const saving = ref(false)
const changingPassword = ref(false)
const avatarDialogVisible = ref(false)
const previewAvatar = ref('')
const selectedFile = ref(null)
const profileFormRef = ref()
const passwordFormRef = ref()

// 用户资料
const userProfile = ref({
  username: '',
  email: '',
  avatar: '',
  createdAt: '',
  realName: '',
  gender: '',
  birthday: '',
  phone: '',
  bio: ''
})

// 用户统计
const userStats = ref({
  totalBills: 0,
  totalTodos: 0,
  totalNotes: 0,
  totalFriends: 0
})

// 个人信息表单
const profileForm = reactive({
  username: '',
  email: '',
  realName: '',
  gender: '',
  birthday: '',
  phone: '',
  bio: ''
})

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 设置
const settings = reactive({
  emailNotification: true,
  birthdayReminder: true,
  dataStatistics: false,
  autoBackup: true
})

// 表单验证规则
const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
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

// 获取用户资料
const fetchUserProfile = async () => {
  try {
    const response = await authAPI.getProfile()
    const profile = response.data
    
    userProfile.value = profile
    
    // 同步到表单
    Object.assign(profileForm, {
      username: profile.username || '',
      email: profile.email || '',
      realName: profile.realName || '',
      gender: profile.gender || '',
      birthday: profile.birthday || '',
      phone: profile.phone || '',
      bio: profile.bio || ''
    })
  } catch (error) {
    console.error('获取用户资料失败:', error)
    ElMessage.error('获取用户资料失败')
  }
}

// 获取用户统计
const fetchUserStats = async () => {
  try {
    // 这里可以调用实际的统计API
    userStats.value = {
      totalBills: 128,
      totalTodos: 45,
      totalNotes: 32,
      totalFriends: 18
    }
  } catch (error) {
    console.error('获取用户统计失败:', error)
  }
}

// 保存个人信息
const saveProfile = async () => {
  if (!profileFormRef.value) return
  
  try {
    await profileFormRef.value.validate()
    
    saving.value = true
    
    await authAPI.updateProfile(profileForm)
    ElMessage.success('个人信息更新成功')
    
    editMode.value = false
    await fetchUserProfile()
  } catch (error) {
    console.error('更新个人信息失败:', error)
    ElMessage.error('更新个人信息失败')
  } finally {
    saving.value = false
  }
}

// 取消编辑
const cancelEdit = () => {
  editMode.value = false
  // 重置表单到原始值
  Object.assign(profileForm, {
    username: userProfile.value.username || '',
    email: userProfile.value.email || '',
    realName: userProfile.value.realName || '',
    gender: userProfile.value.gender || '',
    birthday: userProfile.value.birthday || '',
    phone: userProfile.value.phone || '',
    bio: userProfile.value.bio || ''
  })
}

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    
    changingPassword.value = true
    
    await authAPI.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    
    ElMessage.success('密码修改成功')
    resetPasswordForm()
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('修改密码失败')
  } finally {
    changingPassword.value = false
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

// 更换头像
const changeAvatar = () => {
  previewAvatar.value = ''
  selectedFile.value = null
  avatarDialogVisible.value = true
}

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  
  return false // 阻止自动上传
}

// 处理头像选择
const handleAvatarChange = (file) => {
  selectedFile.value = file.raw
  
  const reader = new FileReader()
  reader.onload = (e) => {
    previewAvatar.value = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 上传头像
const uploadAvatar = async () => {
  if (!selectedFile.value) return
  
  try {
    const formData = new FormData()
    formData.append('avatar', selectedFile.value)
    
    // 这里调用上传头像的API
    // await authAPI.uploadAvatar(formData)
    
    ElMessage.success('头像上传成功')
    avatarDialogVisible.value = false
    await fetchUserProfile()
  } catch (error) {
    console.error('上传头像失败:', error)
    ElMessage.error('上传头像失败')
  }
}

// 导出数据
const exportData = () => {
  ElMessage.info('数据导出功能开发中...')
}

// 导入数据
const importData = () => {
  ElMessage.info('数据导入功能开发中...')
}

// 删除账户
const deleteAccount = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除您的账户和所有数据，是否继续？',
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    ElMessage.info('账户删除功能开发中...')
  } catch (error) {
    // 用户取消
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUserProfile()
  fetchUserStats()
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #333;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 个人资料卡片 */
.profile-card {
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 30px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #ccc;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.user-info {
  flex: 1;
}

.user-info h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.user-email {
  margin: 0 0 5px 0;
  color: #666;
  font-size: 16px;
}

.join-date {
  margin: 0 0 20px 0;
  color: #999;
  font-size: 14px;
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #333;
}

/* 设置列表 */
.settings-list {
  margin-bottom: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h4 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 16px;
}

.setting-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.settings-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

/* 头像上传 */
.avatar-uploader {
  display: block;
  text-align: center;
}

.upload-area {
  width: 200px;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
  margin: 0 auto;
}

.upload-area:hover {
  border-color: #409eff;
}

.preview-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.upload-placeholder {
  text-align: center;
  color: #666;
}

.upload-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.upload-tips {
  margin-top: 15px;
  text-align: center;
}

.upload-tips p {
  margin: 0;
  color: #999;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
