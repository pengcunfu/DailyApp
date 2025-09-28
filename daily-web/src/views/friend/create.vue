<template>
  <div class="friend-create-container">
    <div class="page-header">
      <h2>添加朋友</h2>
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
    </div>

    <el-card class="form-card">
      <el-form 
        ref="friendFormRef" 
        :model="friendForm" 
        :rules="friendRules"
        label-width="120px"
        size="large"
      >
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>
        
        <el-form-item label="姓名" prop="name">
          <el-input 
            v-model="friendForm.name" 
            placeholder="请输入朋友姓名"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input 
            v-model="friendForm.nickname" 
            placeholder="请输入昵称（可选）"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="friendForm.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
            <el-radio label="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            v-model="friendForm.birthday"
            type="date"
            placeholder="请选择生日（可选）"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="关系" prop="relationship">
          <el-select v-model="friendForm.relationship" placeholder="请选择关系">
            <el-option label="朋友" value="friend" />
            <el-option label="同事" value="colleague" />
            <el-option label="同学" value="classmate" />
            <el-option label="家人" value="family" />
            <el-option label="恋人" value="lover" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="notes">
          <el-input 
            v-model="friendForm.notes" 
            type="textarea" 
            placeholder="关于这位朋友的备注信息（可选）"
            :rows="3"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <!-- 联系方式 -->
        <el-divider content-position="left">联系方式</el-divider>

        <el-form-item label="手机号码">
          <div class="contact-list">
            <div 
              v-for="(phone, index) in friendForm.phones" 
              :key="index"
              class="contact-item"
            >
              <el-input 
                v-model="phone.number" 
                placeholder="请输入手机号码"
                style="flex: 1"
              />
              <el-select v-model="phone.label" placeholder="标签" style="width: 120px; margin-left: 10px">
                <el-option label="主要" value="primary" />
                <el-option label="工作" value="work" />
                <el-option label="家庭" value="home" />
                <el-option label="其他" value="other" />
              </el-select>
              <el-button 
                type="danger" 
                size="small" 
                @click="removePhone(index)"
                style="margin-left: 10px"
                :disabled="friendForm.phones.length === 1"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button @click="addPhone" type="primary" size="small">
              <el-icon><Plus /></el-icon>
              添加手机号
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="邮箱地址">
          <div class="contact-list">
            <div 
              v-for="(email, index) in friendForm.emails" 
              :key="index"
              class="contact-item"
            >
              <el-input 
                v-model="email.email" 
                placeholder="请输入邮箱地址"
                style="flex: 1"
              />
              <el-select v-model="email.label" placeholder="标签" style="width: 120px; margin-left: 10px">
                <el-option label="主要" value="primary" />
                <el-option label="工作" value="work" />
                <el-option label="个人" value="personal" />
                <el-option label="其他" value="other" />
              </el-select>
              <el-button 
                type="danger" 
                size="small" 
                @click="removeEmail(index)"
                style="margin-left: 10px"
                :disabled="friendForm.emails.length === 1"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button @click="addEmail" type="primary" size="small">
              <el-icon><Plus /></el-icon>
              添加邮箱
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="QQ号码">
          <div class="contact-list">
            <div 
              v-for="(qq, index) in friendForm.qqs" 
              :key="index"
              class="contact-item"
            >
              <el-input 
                v-model="qq.number" 
                placeholder="请输入QQ号码"
                style="flex: 1"
              />
              <el-input 
                v-model="qq.label" 
                placeholder="标签（可选）"
                style="width: 120px; margin-left: 10px"
              />
              <el-button 
                type="danger" 
                size="small" 
                @click="removeQQ(index)"
                style="margin-left: 10px"
                :disabled="friendForm.qqs.length === 1"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button @click="addQQ" type="primary" size="small">
              <el-icon><Plus /></el-icon>
              添加QQ
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="微信号">
          <div class="contact-list">
            <div 
              v-for="(wechat, index) in friendForm.wechats" 
              :key="index"
              class="contact-item"
            >
              <el-input 
                v-model="wechat.wechatId" 
                placeholder="请输入微信号"
                style="flex: 1"
              />
              <el-input 
                v-model="wechat.label" 
                placeholder="标签（可选）"
                style="width: 120px; margin-left: 10px"
              />
              <el-button 
                type="danger" 
                size="small" 
                @click="removeWechat(index)"
                style="margin-left: 10px"
                :disabled="friendForm.wechats.length === 1"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button @click="addWechat" type="primary" size="small">
              <el-icon><Plus /></el-icon>
              添加微信
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button @click="resetForm">重置</el-button>
            <el-button type="primary" @click="submitFriend" :loading="submitting">
              添加朋友
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus, Delete } from '@element-plus/icons-vue'
import { friendAPI } from '@/api/apis'

const router = useRouter()

// 响应式数据
const friendFormRef = ref()
const submitting = ref(false)

// 表单数据
const friendForm = reactive({
  name: '',
  nickname: '',
  gender: '',
  birthday: '',
  relationship: '',
  notes: '',
  phones: [{ number: '', label: 'primary' }],
  emails: [{ email: '', label: 'primary' }],
  qqs: [{ number: '', label: '' }],
  wechats: [{ wechatId: '', label: '' }]
})

// 表单验证规则
const friendRules = {
  name: [
    { required: true, message: '请输入朋友姓名', trigger: 'blur' },
    { min: 1, max: 50, message: '姓名长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  relationship: [
    { required: true, message: '请选择关系', trigger: 'change' }
  ]
}

// 添加手机号
const addPhone = () => {
  friendForm.phones.push({ number: '', label: 'primary' })
}

// 删除手机号
const removePhone = (index) => {
  if (friendForm.phones.length > 1) {
    friendForm.phones.splice(index, 1)
  }
}

// 添加邮箱
const addEmail = () => {
  friendForm.emails.push({ email: '', label: 'primary' })
}

// 删除邮箱
const removeEmail = (index) => {
  if (friendForm.emails.length > 1) {
    friendForm.emails.splice(index, 1)
  }
}

// 添加QQ
const addQQ = () => {
  friendForm.qqs.push({ number: '', label: '' })
}

// 删除QQ
const removeQQ = (index) => {
  if (friendForm.qqs.length > 1) {
    friendForm.qqs.splice(index, 1)
  }
}

// 添加微信
const addWechat = () => {
  friendForm.wechats.push({ wechatId: '', label: '' })
}

// 删除微信
const removeWechat = (index) => {
  if (friendForm.wechats.length > 1) {
    friendForm.wechats.splice(index, 1)
  }
}

// 重置表单
const resetForm = () => {
  if (friendFormRef.value) {
    friendFormRef.value.resetFields()
  }
  friendForm.name = ''
  friendForm.nickname = ''
  friendForm.gender = ''
  friendForm.birthday = ''
  friendForm.relationship = ''
  friendForm.notes = ''
  friendForm.phones = [{ number: '', label: 'primary' }]
  friendForm.emails = [{ email: '', label: 'primary' }]
  friendForm.qqs = [{ number: '', label: '' }]
  friendForm.wechats = [{ wechatId: '', label: '' }]
}

// 提交朋友信息
const submitFriend = async () => {
  if (!friendFormRef.value) return
  
  try {
    await friendFormRef.value.validate()
    
    submitting.value = true
    
    // 过滤空的联系方式
    const friendData = {
      ...friendForm,
      phones: friendForm.phones.filter(phone => phone.number.trim()),
      emails: friendForm.emails.filter(email => email.email.trim()),
      qqs: friendForm.qqs.filter(qq => qq.number.trim()),
      wechats: friendForm.wechats.filter(wechat => wechat.wechatId.trim())
    }
    
    await friendAPI.create(friendData)
    ElMessage.success('朋友添加成功')
    
    // 跳转到列表页面
    router.push('/friend')
  } catch (error) {
    console.error('添加朋友失败:', error)
    ElMessage.error('添加朋友失败')
  } finally {
    submitting.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/friend')
}
</script>

<style scoped>
.friend-create-container {
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

.contact-list {
  width: 100%;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-divider__text) {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}
</style>
