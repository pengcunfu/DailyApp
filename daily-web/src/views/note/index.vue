<template>
  <div class="note-container">
    <div class="page-header">
      <h2>笔记管理</h2>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>
        新建笔记
      </el-button>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="分类">
          <el-select v-model="filterForm.typeId" placeholder="请选择分类" clearable>
            <el-option 
              v-for="type in noteTypes" 
              :key="type._id" 
              :label="type.name" 
              :value="type._id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input 
            v-model="filterForm.search" 
            placeholder="搜索标题或内容" 
            clearable 
            @keyup.enter="searchNotes" />
        </el-form-item>
        <el-form-item label="私有">
          <el-select v-model="filterForm.isPrivate" placeholder="请选择" clearable>
            <el-option label="公开" :value="false" />
            <el-option label="私有" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchNotes">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 笔记列表 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="table-card">
          <template v-if="viewMode === 'list'">
            <div class="view-controls">
              <el-button-group>
                <el-button 
                  :type="viewMode === 'list' ? 'primary' : ''" 
                  @click="viewMode = 'list'">
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

            <el-table :data="noteList" v-loading="loading">
              <el-table-column prop="title" label="标题" min-width="200">
                <template #default="{ row }">
                  <div class="title-cell">
                    <span class="note-title" @click="viewNote(row)">{{ row.title }}</span>
                    <el-icon v-if="row.isPrivate" class="private-icon"><Lock /></el-icon>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="typeId" label="分类" width="120">
                <template #default="{ row }">
                  <el-tag v-if="row.typeId">{{ getTypeName(row.typeId._id) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="content" label="内容预览" min-width="300">
                <template #default="{ row }">
                  <div class="content-preview">{{ getContentPreview(row.content) }}</div>
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
              <el-table-column prop="updatedAt" label="更新时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.updatedAt) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" @click="editNote(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteNote(row._id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>

          <!-- 卡片视图 -->
          <template v-else>
            <div class="view-controls">
              <el-button-group>
                <el-button 
                  :type="viewMode === 'list' ? 'primary' : ''" 
                  @click="viewMode = 'list'">
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

            <el-row :gutter="20" class="note-cards">
              <el-col :span="8" v-for="note in noteList" :key="note._id">
                <el-card class="note-card" @click="viewNote(note)">
                  <template #header>
                    <div class="card-header">
                      <span class="note-title">{{ note.title }}</span>
                      <el-icon v-if="note.isPrivate" class="private-icon"><Lock /></el-icon>
                    </div>
                  </template>
                  <div class="card-content">
                    <p class="content-preview">{{ getContentPreview(note.content) }}</p>
                    <div class="card-meta">
                      <el-tag v-if="note.typeId" size="small">{{ getTypeName(note.typeId._id) }}</el-tag>
                      <span class="update-time">{{ formatDate(note.updatedAt) }}</span>
                    </div>
                    <div class="card-tags">
                      <el-tag 
                        v-for="tag in note.tags" 
                        :key="tag" 
                        size="small" 
                        class="tag-item">
                        {{ tag }}
                      </el-tag>
                    </div>
                  </div>
                  <template #footer>
                    <div class="card-actions">
                      <el-button size="small" @click.stop="editNote(note)">编辑</el-button>
                      <el-button size="small" type="danger" @click.stop="deleteNote(note._id)">删除</el-button>
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
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            class="pagination">
          </el-pagination>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="80%"
      @close="resetForm"
      :close-on-click-modal="false">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入笔记标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类">
              <el-select v-model="form.typeId" placeholder="请选择分类" style="width: 100%">
                <el-option 
                  v-for="type in noteTypes" 
                  :key="type._id" 
                  :label="type.name" 
                  :value="type._id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="内容" prop="content">
          <el-input 
            v-model="form.content" 
            type="textarea" 
            :rows="10" 
            placeholder="请输入笔记内容" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
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
          </el-col>
          <el-col :span="12">
            <el-form-item label="设置">
              <el-checkbox v-model="form.isPrivate">设为私有</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveNote" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 查看笔记对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      :title="viewingNote.title"
      width="70%">
      <div class="note-view">
        <div class="note-meta">
          <el-tag v-if="viewingNote.typeId">{{ getTypeName(viewingNote.typeId._id) }}</el-tag>
          <el-tag v-if="viewingNote.isPrivate" type="warning">私有</el-tag>
          <span class="view-time">创建时间：{{ formatDate(viewingNote.createdAt) }}</span>
          <span class="view-time">更新时间：{{ formatDate(viewingNote.updatedAt) }}</span>
        </div>
        <div class="note-content">
          <pre>{{ viewingNote.content }}</pre>
        </div>
        <div class="note-tags" v-if="viewingNote.tags && viewingNote.tags.length">
          <span class="tags-label">标签：</span>
          <el-tag 
            v-for="tag in viewingNote.tags" 
            :key="tag" 
            size="small" 
            class="tag-item">
            {{ tag }}
          </el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="editNote(viewingNote)">编辑</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, List, Grid, Lock } from '@element-plus/icons-vue'
import { noteAPI } from '@/api/apis'
import { formatDate } from '@/utils'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const noteList = ref([])
const noteTypes = ref([])
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const dialogTitle = ref('新建笔记')
const formRef = ref(null)
const tagInput = ref('')
const editingId = ref(null)
const viewMode = ref('list')
const viewingNote = ref({})

// 分页
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 筛选表单
const filterForm = reactive({
  typeId: '',
  search: '',
  isPrivate: ''
})

// 笔记表单
const form = reactive({
  title: '',
  content: '',
  typeId: '',
  tags: [],
  isPrivate: false
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ]
}

// 方法
const loadNotes = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit
    }
    
    if (filterForm.typeId) {
      params.typeId = filterForm.typeId
    }
    if (filterForm.search) {
      params.search = filterForm.search
    }
    if (filterForm.isPrivate !== '') {
      params.isPrivate = filterForm.isPrivate
    }

    const response = await noteAPI.getNotes(params)
    if (response.success) {
      noteList.value = response.data.notes
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    ElMessage.error('加载笔记失败')
  } finally {
    loading.value = false
  }
}

const loadNoteTypes = async () => {
  try {
    const response = await noteAPI.getTypes()
    if (response.success) {
      noteTypes.value = response.data.types
    }
  } catch (error) {
    ElMessage.error('加载分类失败')
  }
}

const getTypeName = (typeId) => {
  const type = noteTypes.value.find(t => t._id === typeId)
  return type ? type.name : '未知分类'
}

const getContentPreview = (content) => {
  if (!content) return ''
  return content.length > 100 ? content.substring(0, 100) + '...' : content
}

const showAddDialog = () => {
  dialogTitle.value = '新建笔记'
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const editNote = (note) => {
  dialogTitle.value = '编辑笔记'
  editingId.value = note._id
  
  Object.assign(form, {
    title: note.title,
    content: note.content || '',
    typeId: note.typeId?._id || '',
    tags: [...(note.tags || [])],
    isPrivate: note.isPrivate || false
  })
  
  viewDialogVisible.value = false
  dialogVisible.value = true
}

const viewNote = (note) => {
  viewingNote.value = note
  viewDialogVisible.value = true
}

const saveNote = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const noteData = { ...form }
    
    if (editingId.value) {
      await noteAPI.updateNote(editingId.value, noteData)
      ElMessage.success('笔记更新成功')
    } else {
      await noteAPI.createNote(noteData)
      ElMessage.success('笔记创建成功')
    }
    
    dialogVisible.value = false
    loadNotes()
  } catch (error) {
    ElMessage.error(editingId.value ? '更新失败' : '创建失败')
  } finally {
    saving.value = false
  }
}

const deleteNote = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇笔记吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await noteAPI.deleteNote(id)
    ElMessage.success('删除成功')
    loadNotes()
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
    typeId: '',
    tags: [],
    isPrivate: false
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

const searchNotes = () => {
  pagination.page = 1
  loadNotes()
}

const resetFilter = () => {
  filterForm.typeId = ''
  filterForm.search = ''
  filterForm.isPrivate = ''
  pagination.page = 1
  loadNotes()
}

const handleSizeChange = (val) => {
  pagination.limit = val
  pagination.page = 1
  loadNotes()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  loadNotes()
}

// 生命周期
onMounted(() => {
  loadNoteTypes()
  loadNotes()
})
</script>

<style scoped>
.note-container {
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

.table-card {
  margin-bottom: 20px;
}

.view-controls {
  margin-bottom: 20px;
  text-align: right;
}

.title-cell {
  display: flex;
  align-items: center;
}

.note-title {
  cursor: pointer;
  color: #409EFF;
  text-decoration: none;
  flex: 1;
}

.note-title:hover {
  text-decoration: underline;
}

.private-icon {
  margin-left: 8px;
  color: #E6A23C;
}

.content-preview {
  color: #666;
  line-height: 1.5;
}

.tag-item {
  margin-right: 5px;
  margin-bottom: 5px;
}

.tags-container {
  margin-top: 10px;
}

.note-cards {
  margin-top: 20px;
}

.note-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.note-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: bold;
}

.card-content {
  height: 150px;
  overflow: hidden;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
}

.update-time {
  font-size: 12px;
  color: #999;
}

.card-tags {
  margin-top: 10px;
}

.card-actions {
  text-align: right;
}

.note-view {
  max-height: 600px;
  overflow-y: auto;
}

.note-meta {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.view-time {
  margin-left: 10px;
  font-size: 12px;
  color: #999;
}

.note-content {
  margin: 20px 0;
  line-height: 1.6;
}

.note-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  margin: 0;
}

.note-tags {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.tags-label {
  font-weight: bold;
  margin-right: 10px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
