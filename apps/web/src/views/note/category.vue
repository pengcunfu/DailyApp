<template>
  <div class="note-category-container">
    <div class="page-header">
      <h2>笔记分类管理</h2>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>
        添加分类
      </el-button>
    </div>

    <!-- 分类列表 -->
    <el-card class="category-card">
      <div class="category-grid">
        <div 
          v-for="category in categories" 
          :key="category._id"
          class="category-item"
        >
          <div class="category-icon">
            <el-icon>
              <component :is="getCategoryIcon(category.name)" />
            </el-icon>
          </div>
          <div class="category-info">
            <h4>{{ category.name }}</h4>
            <p class="category-desc">{{ category.description || '暂无描述' }}</p>
            <div class="category-stats">
              <el-tag size="small" type="info">{{ category.noteCount || 0 }} 篇笔记</el-tag>
              <el-tag size="small" type="success">{{ formatDate(category.createdAt) }}</el-tag>
            </div>
          </div>
          <div class="category-actions">
            <el-button size="small" @click="editCategory(category)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="deleteCategory(category._id)"
              :disabled="category.noteCount > 0"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="categories.length === 0" description="暂无分类">
        <el-button type="primary" @click="showAddDialog">创建第一个分类</el-button>
      </el-empty>
    </el-card>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEditing ? '编辑分类' : '添加分类'"
      width="500px"
    >
      <el-form 
        ref="categoryFormRef" 
        :model="categoryForm" 
        :rules="categoryRules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input 
            v-model="categoryForm.name" 
            placeholder="请输入分类名称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input 
            v-model="categoryForm.description" 
            type="textarea" 
            placeholder="请输入分类描述（可选）"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="排序权重" prop="sortOrder">
          <el-input-number 
            v-model="categoryForm.sortOrder" 
            :min="0" 
            :max="999"
            placeholder="数字越大排序越靠前"
          />
          <div class="form-tip">
            数字越大排序越靠前，默认为 0
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCategory">
            {{ isEditing ? '更新' : '添加' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Document, Folder, Reading, Star, User, Setting } from '@element-plus/icons-vue'
import { noteAPI } from '@/api/apis'
import { formatDate } from '@/utils'

// 响应式数据
const categories = ref([])
const dialogVisible = ref(false)
const isEditing = ref(false)
const categoryFormRef = ref()

// 表单数据
const categoryForm = reactive({
  _id: '',
  name: '',
  description: '',
  sortOrder: 0
})

// 表单验证规则
const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 20, message: '分类名称长度在 1 到 20 个字符', trigger: 'blur' }
  ]
}

// 获取分类图标
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    '学习': Reading,
    '工作': Document,
    '生活': User,
    '技术': Setting,
    '想法': Star,
    '日记': Document,
    '笔记': Folder,
    '其他': Document
  }
  return iconMap[categoryName] || Folder
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await noteAPI.getTypes()
    categories.value = response.data || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  }
}

// 显示添加对话框
const showAddDialog = () => {
  isEditing.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑分类
const editCategory = (category) => {
  isEditing.value = true
  categoryForm._id = category._id
  categoryForm.name = category.name
  categoryForm.description = category.description || ''
  categoryForm.sortOrder = category.sortOrder || 0
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  categoryForm._id = ''
  categoryForm.name = ''
  categoryForm.description = ''
  categoryForm.sortOrder = 0
  if (categoryFormRef.value) {
    categoryFormRef.value.resetFields()
  }
}

// 提交分类
const submitCategory = async () => {
  if (!categoryFormRef.value) return
  
  try {
    await categoryFormRef.value.validate()
    
    if (isEditing.value) {
      await noteAPI.updateType(categoryForm._id, categoryForm)
      ElMessage.success('分类更新成功')
    } else {
      await noteAPI.createType(categoryForm)
      ElMessage.success('分类添加成功')
    }
    
    dialogVisible.value = false
    await fetchCategories()
  } catch (error) {
    console.error('保存分类失败:', error)
    ElMessage.error('保存分类失败')
  }
}

// 删除分类
const deleteCategory = async (categoryId) => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除该分类，是否继续？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await noteAPI.deleteType(categoryId)
    ElMessage.success('分类删除成功')
    await fetchCategories()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error)
      ElMessage.error('删除分类失败')
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.note-category-container {
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

.category-card {
  margin-bottom: 20px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.category-item {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
  background: #fff;
}

.category-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.category-icon {
  margin-right: 15px;
  font-size: 28px;
  color: #409eff;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-info h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.category-desc {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  word-break: break-word;
}

.category-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 15px;
  flex-shrink: 0;
}

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

:deep(.el-empty) {
  padding: 60px 0;
}
</style>
