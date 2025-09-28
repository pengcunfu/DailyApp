<template>
  <div class="friend-container">
    <div class="page-header">
      <h2>朋友管理</h2>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>
        添加朋友
      </el-button>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="关系类型">
          <el-select v-model="filterForm.relationship" placeholder="请选择关系类型" clearable>
            <el-option label="家人" value="family" />
            <el-option label="朋友" value="friend" />
            <el-option label="同事" value="colleague" />
            <el-option label="同学" value="classmate" />
            <el-option label="恋人" value="lover" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input 
            v-model="filterForm.search" 
            placeholder="搜索姓名、昵称或备注" 
            clearable 
            @keyup.enter="searchFriends" />
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="filterForm.city" placeholder="城市" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchFriends">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ friendStats.total || 0 }}</div>
            <div class="stat-label">总朋友</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ friendStats.thisMonth || 0 }}</div>
            <div class="stat-label">本月新增</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ friendStats.cities || 0 }}</div>
            <div class="stat-label">城市数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ friendStats.avgAge || 0 }}</div>
            <div class="stat-label">平均年龄</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 朋友列表 -->
    <el-card class="table-card">
      <div class="view-controls">
        <el-button-group>
          <el-button 
            :type="viewMode === 'table' ? 'primary' : ''" 
            @click="viewMode = 'table'">
            <el-icon><List /></el-icon>
            列表
          </el-button>
          <el-button 
            :type="viewMode === 'card' ? 'primary' : ''" 
            @click="viewMode = 'card'">
            <el-icon><Grid /></el-icon>
            卡片
          </el-button>
        </el-button-group>
      </div>

      <!-- 表格视图 -->
      <template v-if="viewMode === 'table'">
        <el-table :data="friendList" v-loading="loading">
          <el-table-column prop="avatar" label="头像" width="80">
            <template #default="{ row }">
              <el-avatar 
                :src="row.avatar" 
                :alt="row.name"
                class="friend-avatar">
                {{ row.name ? row.name.charAt(0) : 'N' }}
              </el-avatar>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="nickname" label="昵称" width="120" />
          <el-table-column prop="relationship" label="关系" width="100">
            <template #default="{ row }">
              <el-tag :type="getRelationshipColor(row.relationship)" size="small">
                {{ getRelationshipText(row.relationship) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="电话" width="130" />
          <el-table-column prop="email" label="邮箱" width="180" show-overflow-tooltip />
          <el-table-column prop="age" label="年龄" width="80" />
          <el-table-column prop="birthday" label="生日" width="120">
            <template #default="{ row }">
              {{ row.birthday ? formatDate(row.birthday, 'MM-DD') : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
          <el-table-column prop="lastContact" label="最后联系" width="120">
            <template #default="{ row }">
              {{ row.lastContact ? getRelativeTime(row.lastContact) : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="viewFriend(row)">查看</el-button>
              <el-button size="small" @click="editFriend(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteFriend(row._id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <!-- 卡片视图 -->
      <template v-else>
        <el-row :gutter="20" class="friend-cards">
          <el-col :span="8" v-for="friend in friendList" :key="friend._id">
            <el-card class="friend-card" @click="viewFriend(friend)">
              <template #header>
                <div class="card-header">
                  <el-avatar 
                    :src="friend.avatar" 
                    :alt="friend.name"
                    size="small"
                    class="friend-avatar">
                    {{ friend.name ? friend.name.charAt(0) : 'N' }}
                  </el-avatar>
                  <div class="friend-info">
                    <div class="friend-name">{{ friend.name }}</div>
                    <div class="friend-nickname">{{ friend.nickname }}</div>
                  </div>
                </div>
              </template>
              <div class="card-content">
                <div class="friend-detail">
                  <el-tag :type="getRelationshipColor(friend.relationship)" size="small">
                    {{ getRelationshipText(friend.relationship) }}
                  </el-tag>
                  <span class="friend-age" v-if="friend.age">{{ friend.age }}岁</span>
                </div>
                <div class="friend-contact">
                  <p v-if="friend.phone" class="contact-item">
                    <el-icon><Phone /></el-icon>
                    {{ friend.phone }}
                  </p>
                  <p v-if="friend.email" class="contact-item">
                    <el-icon><Message /></el-icon>
                    {{ friend.email }}
                  </p>
                  <p v-if="friend.address" class="contact-item">
                    <el-icon><Location /></el-icon>
                    {{ friend.address }}
                  </p>
                </div>
                <div class="last-contact" v-if="friend.lastContact">
                  最后联系：{{ getRelativeTime(friend.lastContact) }}
                </div>
              </div>
              <template #footer>
                <div class="card-actions">
                  <el-button size="small" @click.stop="editFriend(friend)">编辑</el-button>
                  <el-button size="small" type="danger" @click.stop="deleteFriend(friend._id)">删除</el-button>
                </div>
              </template>
            </el-card>
          </el-col>
        </el-row>
      </template>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :page-sizes="[12, 24, 48, 96]"
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
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="昵称">
              <el-input v-model="form.nickname" placeholder="请输入昵称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="关系类型" prop="relationship">
              <el-select v-model="form.relationship" placeholder="请选择关系" style="width: 100%">
                <el-option label="家人" value="family" />
                <el-option label="朋友" value="friend" />
                <el-option label="同事" value="colleague" />
                <el-option label="同学" value="classmate" />
                <el-option label="恋人" value="lover" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="年龄">
              <el-input-number v-model="form.age" :min="0" :max="120" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="性别">
              <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%">
                <el-option label="男" value="male" />
                <el-option label="女" value="female" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电话">
              <el-input v-model="form.phone" placeholder="请输入电话号码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱">
              <el-input v-model="form.email" placeholder="请输入邮箱地址" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生日">
              <el-date-picker
                v-model="form.birthday"
                type="date"
                placeholder="请选择生日"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最后联系">
              <el-date-picker
                v-model="form.lastContact"
                type="date"
                placeholder="最后联系时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="地址">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>

        <el-form-item label="头像URL">
          <el-input v-model="form.avatar" placeholder="请输入头像图片链接" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input 
            v-model="form.remark" 
            type="textarea" 
            :rows="3" 
            placeholder="备注信息..." />
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
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFriend" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 查看朋友详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      :title="viewingFriend.name || '朋友详情'"
      width="600px">
      <div class="friend-detail-view">
        <div class="friend-basic">
          <el-avatar 
            :src="viewingFriend.avatar" 
            :alt="viewingFriend.name"
            :size="80"
            class="detail-avatar">
            {{ viewingFriend.name ? viewingFriend.name.charAt(0) : 'N' }}
          </el-avatar>
          <div class="basic-info">
            <h3>{{ viewingFriend.name }}</h3>
            <p v-if="viewingFriend.nickname" class="nickname">昵称：{{ viewingFriend.nickname }}</p>
            <el-tag :type="getRelationshipColor(viewingFriend.relationship)">
              {{ getRelationshipText(viewingFriend.relationship) }}
            </el-tag>
          </div>
        </div>
        
        <el-divider />
        
        <div class="friend-details">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="年龄">
              {{ viewingFriend.age || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="性别">
              {{ getGenderText(viewingFriend.gender) }}
            </el-descriptions-item>
            <el-descriptions-item label="电话">
              {{ viewingFriend.phone || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ viewingFriend.email || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="生日">
              {{ viewingFriend.birthday ? formatDate(viewingFriend.birthday, 'YYYY-MM-DD') : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="最后联系">
              {{ viewingFriend.lastContact ? getRelativeTime(viewingFriend.lastContact) : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="地址" :span="2">
              {{ viewingFriend.address || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="标签" :span="2">
              <template v-if="viewingFriend.tags && viewingFriend.tags.length">
                <el-tag 
                  v-for="tag in viewingFriend.tags" 
                  :key="tag" 
                  size="small" 
                  class="tag-item">
                  {{ tag }}
                </el-tag>
              </template>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">
              {{ viewingFriend.remark || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="editFriend(viewingFriend)">编辑</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, List, Grid, Phone, Message, Location } from '@element-plus/icons-vue'
import { friendAPI } from '@/api/apis'
import { formatDate, getRelativeTime } from '@/utils'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const friendList = ref([])
const friendStats = ref({})
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const dialogTitle = ref('添加朋友')
const formRef = ref(null)
const tagInput = ref('')
const editingId = ref(null)
const viewMode = ref('table')
const viewingFriend = ref({})

// 分页
const pagination = reactive({
  page: 1,
  limit: 12,
  total: 0
})

// 筛选表单
const filterForm = reactive({
  relationship: '',
  search: '',
  city: ''
})

// 朋友表单
const form = reactive({
  name: '',
  nickname: '',
  relationship: '',
  age: null,
  gender: '',
  phone: '',
  email: '',
  birthday: '',
  address: '',
  avatar: '',
  lastContact: '',
  remark: '',
  tags: []
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  relationship: [
    { required: true, message: '请选择关系类型', trigger: 'change' }
  ]
}

// 方法
const loadFriends = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit
    }
    
    if (filterForm.relationship) {
      params.relationship = filterForm.relationship
    }
    if (filterForm.search) {
      params.search = filterForm.search
    }
    if (filterForm.city) {
      params.city = filterForm.city
    }

    const response = await friendAPI.getFriends(params)
    if (response.success) {
      friendList.value = response.data.friends
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    ElMessage.error('加载朋友列表失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await friendAPI.getStats()
    if (response.success) {
      friendStats.value = response.data.stats
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const getRelationshipText = (relationship) => {
  const texts = {
    family: '家人',
    friend: '朋友',
    colleague: '同事',
    classmate: '同学',
    lover: '恋人',
    other: '其他'
  }
  return texts[relationship] || relationship
}

const getRelationshipColor = (relationship) => {
  const colors = {
    family: 'danger',
    friend: 'primary',
    colleague: 'success',
    classmate: 'info',
    lover: 'warning',
    other: ''
  }
  return colors[relationship] || ''
}

const getGenderText = (gender) => {
  const texts = {
    male: '男',
    female: '女',
    other: '其他'
  }
  return texts[gender] || '-'
}

const showAddDialog = () => {
  dialogTitle.value = '添加朋友'
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const editFriend = (friend) => {
  dialogTitle.value = '编辑朋友'
  editingId.value = friend._id
  
  Object.assign(form, {
    name: friend.name,
    nickname: friend.nickname || '',
    relationship: friend.relationship,
    age: friend.age,
    gender: friend.gender || '',
    phone: friend.phone || '',
    email: friend.email || '',
    birthday: friend.birthday || '',
    address: friend.address || '',
    avatar: friend.avatar || '',
    lastContact: friend.lastContact || '',
    remark: friend.remark || '',
    tags: [...(friend.tags || [])]
  })
  
  viewDialogVisible.value = false
  dialogVisible.value = true
}

const viewFriend = (friend) => {
  viewingFriend.value = friend
  viewDialogVisible.value = true
}

const saveFriend = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const friendData = { ...form }
    
    if (editingId.value) {
      await friendAPI.updateFriend(editingId.value, friendData)
      ElMessage.success('朋友信息更新成功')
    } else {
      await friendAPI.createFriend(friendData)
      ElMessage.success('朋友添加成功')
    }
    
    dialogVisible.value = false
    loadFriends()
    loadStats()
  } catch (error) {
    ElMessage.error(editingId.value ? '更新失败' : '添加失败')
  } finally {
    saving.value = false
  }
}

const deleteFriend = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个朋友吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await friendAPI.deleteFriend(id)
    ElMessage.success('删除成功')
    loadFriends()
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
    name: '',
    nickname: '',
    relationship: '',
    age: null,
    gender: '',
    phone: '',
    email: '',
    birthday: '',
    address: '',
    avatar: '',
    lastContact: '',
    remark: '',
    tags: []
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

const searchFriends = () => {
  pagination.page = 1
  loadFriends()
}

const resetFilter = () => {
  filterForm.relationship = ''
  filterForm.search = ''
  filterForm.city = ''
  pagination.page = 1
  loadFriends()
}

const handleSizeChange = (val) => {
  pagination.limit = val
  pagination.page = 1
  loadFriends()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  loadFriends()
}

// 生命周期
onMounted(() => {
  loadFriends()
  loadStats()
})
</script>

<style scoped>
.friend-container {
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

.view-controls {
  margin-bottom: 20px;
  text-align: right;
}

.friend-avatar {
  margin-right: 10px;
}

.friend-cards {
  margin-top: 20px;
}

.friend-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.friend-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
}

.friend-info {
  flex: 1;
}

.friend-name {
  font-weight: bold;
  font-size: 16px;
}

.friend-nickname {
  color: #666;
  font-size: 14px;
}

.card-content {
  height: 120px;
  overflow: hidden;
}

.friend-detail {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.friend-age {
  margin-left: 10px;
  color: #666;
}

.friend-contact {
  margin-bottom: 10px;
}

.contact-item {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
}

.contact-item .el-icon {
  margin-right: 5px;
}

.last-contact {
  font-size: 12px;
  color: #999;
}

.card-actions {
  text-align: right;
}

.friend-detail-view {
  max-height: 600px;
  overflow-y: auto;
}

.friend-basic {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.detail-avatar {
  margin-right: 20px;
}

.basic-info h3 {
  margin: 0 0 10px 0;
}

.nickname {
  margin: 5px 0;
  color: #666;
}

.friend-details {
  margin-top: 20px;
}

.tag-item {
  margin-right: 5px;
  margin-bottom: 5px;
}

.tags-container {
  margin-top: 10px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
