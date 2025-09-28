<template>
  <div class="food-category-container">
    <div class="page-header">
      <h2>食物分类管理</h2>
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
              <el-tag size="small" type="info">{{ category.foodCount || 0 }} 种食物</el-tag>
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
              :disabled="category.foodCount > 0"
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

    <!-- 预设分类模板 -->
    <el-card class="template-card">
      <template #header>
        <div class="card-header">
          <span>常用分类模板</span>
          <el-button size="small" @click="addAllTemplates">一键添加全部</el-button>
        </div>
      </template>
      <div class="template-grid">
        <div 
          v-for="template in categoryTemplates" 
          :key="template.id"
          class="template-item"
          @click="addTemplate(template)"
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Edit, Delete, 
  Document, Star, Folder, Setting,
  Shop, Bowl, Coffee, CirclePlus
} from '@element-plus/icons-vue'
import { foodAPI } from '@/api/apis'
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

// 分类模板
const categoryTemplates = ref([
  {
    id: 1,
    name: '水果',
    description: '各种新鲜水果',
    icon: Star,
    data: { name: '水果', description: '苹果、香蕉、橙子等各种新鲜水果' }
  },
  {
    id: 2,
    name: '蔬菜',
    description: '各种蔬菜类食物',
    icon: Document,
    data: { name: '蔬菜', description: '青菜、萝卜、土豆等各种蔬菜' }
  },
  {
    id: 3,
    name: '肉类',
    description: '猪肉、牛肉、鸡肉等',
    icon: Document,
    data: { name: '肉类', description: '猪肉、牛肉、鸡肉、鱼肉等各种肉类' }
  },
  {
    id: 4,
    name: '主食',
    description: '米饭、面条、面包等',
    icon: Bowl,
    data: { name: '主食', description: '米饭、面条、面包、馒头等主食类' }
  },
  {
    id: 5,
    name: '饮品',
    description: '各种饮料和汤品',
    icon: Coffee,
    data: { name: '饮品', description: '果汁、牛奶、茶水、汤品等各种饮品' }
  },
  {
    id: 6,
    name: '零食',
    description: '饼干、糖果、坚果等',
    icon: CirclePlus,
    data: { name: '零食', description: '饼干、糖果、坚果、薯片等零食类' }
  },
  {
    id: 7,
    name: '调料',
    description: '盐、糖、酱油等调味品',
    icon: Setting,
    data: { name: '调料', description: '盐、糖、酱油、醋等各种调味品' }
  },
  {
    id: 8,
    name: '乳制品',
    description: '牛奶、酸奶、奶酪等',
    icon: Folder,
    data: { name: '乳制品', description: '牛奶、酸奶、奶酪、黄油等乳制品' }
  }
])

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
    '水果': Star,
    '蔬菜': Document,
    '肉类': Document,
    '主食': Bowl,
    '饮品': Coffee,
    '零食': CirclePlus,
    '调料': Setting,
    '乳制品': Folder
  }
  return iconMap[categoryName] || Document
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await foodAPI.getCategories()
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
      await foodAPI.updateCategory(categoryForm._id, categoryForm)
      ElMessage.success('分类更新成功')
    } else {
      await foodAPI.createCategory(categoryForm)
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
    
    await foodAPI.deleteCategory(categoryId)
    ElMessage.success('分类删除成功')
    await fetchCategories()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error)
      ElMessage.error('删除分类失败')
    }
  }
}

// 添加模板分类
const addTemplate = async (template) => {
  try {
    // 检查是否已存在同名分类
    const existingCategory = categories.value.find(cat => cat.name === template.data.name)
    if (existingCategory) {
      ElMessage.warning(`分类"${template.data.name}"已存在`)
      return
    }
    
    await foodAPI.createCategory(template.data)
    ElMessage.success(`分类"${template.data.name}"添加成功`)
    await fetchCategories()
  } catch (error) {
    console.error('添加模板分类失败:', error)
    ElMessage.error('添加模板分类失败')
  }
}

// 一键添加全部模板
const addAllTemplates = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将添加所有模板分类（跳过已存在的），是否继续？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    let addedCount = 0
    let skippedCount = 0
    
    for (const template of categoryTemplates.value) {
      const existingCategory = categories.value.find(cat => cat.name === template.data.name)
      if (existingCategory) {
        skippedCount++
        continue
      }
      
      try {
        await foodAPI.createCategory(template.data)
        addedCount++
      } catch (error) {
        console.error(`添加分类"${template.data.name}"失败:`, error)
      }
    }
    
    ElMessage.success(`成功添加 ${addedCount} 个分类，跳过 ${skippedCount} 个已存在的分类`)
    await fetchCategories()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量添加分类失败:', error)
      ElMessage.error('批量添加分类失败')
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.food-category-container {
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

.template-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  background: #fafafa;
}

.template-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  background: #fff;
}

.template-icon {
  margin-right: 10px;
  font-size: 20px;
  color: #67c23a;
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

:deep(.el-empty) {
  padding: 60px 0;
}
</style>
