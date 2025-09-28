<template>
  <div class="appearance-container">
    <div class="page-header">
      <h2>形象管理</h2>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索记录..."
          style="width: 300px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          添加记录
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stats-card">
        <div class="stats-item">
          <div class="stats-icon total">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ stats.totalRecords }}</div>
            <div class="stats-label">总记录数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stats-card" v-if="stats.latestRecord">
        <div class="stats-item">
          <div class="stats-icon latest">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ formatDate(stats.latestRecord.record_date) }}</div>
            <div class="stats-label">最新记录</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stats-card" v-if="stats.latestRecord && stats.latestRecord.weight">
        <div class="stats-item">
          <div class="stats-icon weight">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ stats.latestRecord.weight }}kg</div>
            <div class="stats-label">当前体重</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 形象记录列表 -->
    <el-card class="appearance-list-card">
      <div class="appearance-grid">
        <div 
          v-for="record in appearanceList" 
          :key="record._id"
          class="appearance-item"
          @click="showDetailDialog(record)"
        >
          <div class="appearance-image">
            <img v-if="record.photo" :src="record.photo" :alt="record.description" />
            <div v-else class="image-placeholder">
              <el-icon><Picture /></el-icon>
              <span>暂无图片</span>
            </div>
          </div>
          
          <div class="appearance-info">
            <div class="record-date">{{ formatDate(record.record_date) }}</div>
            <div class="record-description" v-if="record.description">
              {{ record.description }}
            </div>
            <div class="record-metrics" v-if="record.weight || record.height">
              <span v-if="record.weight" class="metric">{{ record.weight }}kg</span>
              <span v-if="record.height" class="metric">{{ record.height }}cm</span>
              <span v-if="record.body_fat_rate" class="metric">{{ record.body_fat_rate }}%体脂</span>
            </div>
          </div>
          
          <div class="appearance-actions" @click.stop>
            <el-button size="small" @click="editRecord(record)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button size="small" type="danger" @click="deleteRecord(record._id)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="appearanceList.length === 0" description="暂无形象记录">
        <el-button type="primary" @click="showAddDialog">添加第一条记录</el-button>
      </el-empty>

      <!-- 分页 -->
      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑记录对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEditing ? '编辑形象记录' : '添加形象记录'"
      width="600px"
    >
      <el-form 
        ref="recordFormRef" 
        :model="recordForm" 
        :rules="recordRules"
        label-width="100px"
      >
        <el-form-item label="记录日期" prop="record_date">
          <el-date-picker
            v-model="recordForm.record_date"
            type="datetime"
            placeholder="选择记录日期"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="照片" prop="photo">
          <el-input v-model="recordForm.photo" placeholder="请输入照片URL或上传照片" />
          <div class="form-tip">
            可以输入图片链接，或点击上传本地图片
          </div>
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="recordForm.description" 
            type="textarea" 
            placeholder="记录当时的状态、心情或变化..."
            :rows="3"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="体重(kg)" prop="weight">
              <el-input-number 
                v-model="recordForm.weight" 
                :min="0" 
                :max="500"
                :precision="1"
                placeholder="体重"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="身高(cm)" prop="height">
              <el-input-number 
                v-model="recordForm.height" 
                :min="0" 
                :max="300"
                :precision="1"
                placeholder="身高"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="体脂率(%)" prop="body_fat_rate">
              <el-input-number 
                v-model="recordForm.body_fat_rate" 
                :min="0" 
                :max="100"
                :precision="1"
                placeholder="体脂率"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="备注" prop="notes">
          <el-input 
            v-model="recordForm.notes" 
            type="textarea" 
            placeholder="其他备注信息..."
            :rows="2"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRecord" :loading="submitting">
            {{ isEditing ? '更新' : '添加' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详情查看对话框 -->
    <el-dialog 
      v-model="detailVisible" 
      title="形象记录详情"
      width="500px"
    >
      <div v-if="selectedRecord" class="record-detail">
        <div class="detail-image">
          <img v-if="selectedRecord.photo" :src="selectedRecord.photo" :alt="selectedRecord.description" />
          <div v-else class="image-placeholder">
            <el-icon><Picture /></el-icon>
            <span>暂无图片</span>
          </div>
        </div>
        
        <div class="detail-info">
          <div class="info-item">
            <span class="label">记录时间：</span>
            <span class="value">{{ formatDateTime(selectedRecord.record_date) }}</span>
          </div>
          
          <div class="info-item" v-if="selectedRecord.description">
            <span class="label">描述：</span>
            <span class="value">{{ selectedRecord.description }}</span>
          </div>
          
          <div class="metrics-grid" v-if="selectedRecord.weight || selectedRecord.height || selectedRecord.body_fat_rate">
            <div class="metric-item" v-if="selectedRecord.weight">
              <div class="metric-label">体重</div>
              <div class="metric-value">{{ selectedRecord.weight }} kg</div>
            </div>
            <div class="metric-item" v-if="selectedRecord.height">
              <div class="metric-label">身高</div>
              <div class="metric-value">{{ selectedRecord.height }} cm</div>
            </div>
            <div class="metric-item" v-if="selectedRecord.body_fat_rate">
              <div class="metric-label">体脂率</div>
              <div class="metric-value">{{ selectedRecord.body_fat_rate }} %</div>
            </div>
          </div>
          
          <div class="info-item" v-if="selectedRecord.notes">
            <span class="label">备注：</span>
            <span class="value">{{ selectedRecord.notes }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, Document, Calendar, Star, Picture } from '@element-plus/icons-vue'
import { appearanceAPI } from '@/api/apis'
import { formatDate } from '@/utils'

// 响应式数据
const appearanceList = ref([])
const stats = ref({})
const searchKeyword = ref('')
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const selectedRecord = ref(null)
const recordFormRef = ref()

// 分页数据
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 表单数据
const recordForm = reactive({
  _id: '',
  photo: '',
  record_date: '',
  description: '',
  weight: null,
  height: null,
  body_fat_rate: null,
  notes: ''
})

// 表单验证规则
const recordRules = {
  photo: [
    { required: true, message: '请输入照片URL', trigger: 'blur' }
  ],
  record_date: [
    { required: true, message: '请选择记录日期', trigger: 'change' }
  ]
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 获取形象记录列表
const fetchAppearanceList = async () => {
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      keyword: searchKeyword.value
    }
    
    const response = await appearanceAPI.getList(params)
    appearanceList.value = response.data.data || []
    total.value = response.data.pagination?.total || 0
  } catch (error) {
    console.error('获取形象记录失败:', error)
    ElMessage.error('获取形象记录失败')
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await appearanceAPI.getStats()
    stats.value = response.data.data || {}
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  fetchAppearanceList()
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchAppearanceList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchAppearanceList()
}

// 显示添加对话框
const showAddDialog = () => {
  isEditing.value = false
  resetForm()
  recordForm.record_date = new Date().toISOString().slice(0, 19).replace('T', ' ')
  dialogVisible.value = true
}

// 编辑记录
const editRecord = (record) => {
  isEditing.value = true
  Object.assign(recordForm, {
    _id: record._id,
    photo: record.photo || '',
    record_date: record.record_date ? new Date(record.record_date).toISOString().slice(0, 19).replace('T', ' ') : '',
    description: record.description || '',
    weight: record.weight,
    height: record.height,
    body_fat_rate: record.body_fat_rate,
    notes: record.notes || ''
  })
  dialogVisible.value = true
}

// 显示详情对话框
const showDetailDialog = (record) => {
  selectedRecord.value = record
  detailVisible.value = true
}

// 重置表单
const resetForm = () => {
  recordForm._id = ''
  recordForm.photo = ''
  recordForm.record_date = ''
  recordForm.description = ''
  recordForm.weight = null
  recordForm.height = null
  recordForm.body_fat_rate = null
  recordForm.notes = ''
  if (recordFormRef.value) {
    recordFormRef.value.resetFields()
  }
}

// 提交记录
const submitRecord = async () => {
  if (!recordFormRef.value) return
  
  try {
    await recordFormRef.value.validate()
    
    submitting.value = true
    
    const data = { ...recordForm }
    delete data._id
    
    if (isEditing.value) {
      await appearanceAPI.update(recordForm._id, data)
      ElMessage.success('形象记录更新成功')
    } else {
      await appearanceAPI.create(data)
      ElMessage.success('形象记录添加成功')
    }
    
    dialogVisible.value = false
    await fetchAppearanceList()
    await fetchStats()
  } catch (error) {
    console.error('保存形象记录失败:', error)
    ElMessage.error('保存形象记录失败')
  } finally {
    submitting.value = false
  }
}

// 删除记录
const deleteRecord = async (recordId) => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除该形象记录，是否继续？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await appearanceAPI.delete(recordId)
    ElMessage.success('形象记录删除成功')
    await fetchAppearanceList()
    await fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除形象记录失败:', error)
      ElMessage.error('删除形象记录失败')
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchAppearanceList()
  fetchStats()
})
</script>

<style scoped>
.appearance-container {
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
  gap: 15px;
  align-items: center;
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

.stats-icon.total { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stats-icon.latest { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stats-icon.weight { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

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

/* 形象记录列表 */
.appearance-list-card {
  margin-bottom: 20px;
}

.appearance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.appearance-item {
  display: flex;
  flex-direction: column;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.appearance-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.appearance-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.appearance-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
}

.image-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.appearance-info {
  padding: 15px;
  flex: 1;
}

.record-date {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
  margin-bottom: 8px;
}

.record-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.record-metrics {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.metric {
  font-size: 12px;
  background: #f0f9ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 12px;
}

.appearance-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s;
}

.appearance-item:hover .appearance-actions {
  opacity: 1;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 对话框样式 */
.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 详情对话框 */
.record-detail {
  padding: 10px 0;
}

.detail-image {
  width: 100%;
  height: 300px;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: flex-start;
}

.info-item .label {
  font-weight: 500;
  color: #333;
  min-width: 80px;
}

.info-item .value {
  flex: 1;
  color: #666;
  line-height: 1.6;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin: 15px 0;
}

.metric-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.metric-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

:deep(.el-empty) {
  padding: 60px 0;
}
</style>
