<template>
  <div class="bill-category-container">
    <div class="page-header">
      <h2>账单分类管理</h2>
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
          :class="{ 'income': category.type === 'income', 'expense': category.type === 'expense' }"
        >
          <div class="category-icon">
            <el-icon>
              <component :is="getCategoryIcon(category.name)" />
            </el-icon>
          </div>
          <div class="category-info">
            <h4>{{ category.name }}</h4>
            <p class="category-type">{{ category.type === 'income' ? '收入' : '支出' }}</p>
            <p class="category-desc">{{ category.description || '暂无描述' }}</p>
          </div>
          <div class="category-actions">
            <el-button size="small" @click="editCategory(category)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="deleteCategory(category._id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
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
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类类型" prop="type">
          <el-select v-model="categoryForm.type" placeholder="请选择分类类型">
            <el-option label="收入" value="income" />
            <el-option label="支出" value="expense" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input 
            v-model="categoryForm.description" 
            type="textarea" 
            placeholder="请输入分类描述（可选）"
            :rows="3"
          />
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
import { Plus, Edit, Delete, Money, ShoppingBag, Bicycle, House, Coffee, Reading } from '@element-plus/icons-vue'
import { billAPI } from '@/api/apis'

// 响应式数据
const categories = ref([])
const dialogVisible = ref(false)
const isEditing = ref(false)
const categoryFormRef = ref()

// 表单数据
const categoryForm = reactive({
  _id: '',
  name: '',
  type: 'expense',
  description: ''
})

// 表单验证规则
const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 20, message: '分类名称长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择分类类型', trigger: 'change' }
  ]
}

// 获取分类图标
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    '餐饮': Coffee,
    '购物': ShoppingBag,
    '交通': Bicycle,
    '住房': House,
    '娱乐': Reading,
    '工资': Money,
    '投资': Money,
    '其他': Money
  }
  return iconMap[categoryName] || Money
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await billAPI.getCategories()
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
  categoryForm.type = category.type
  categoryForm.description = category.description || ''
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  categoryForm._id = ''
  categoryForm.name = ''
  categoryForm.type = 'expense'
  categoryForm.description = ''
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
      await billAPI.updateCategory(categoryForm._id, categoryForm)
      ElMessage.success('分类更新成功')
    } else {
      await billAPI.createCategory(categoryForm)
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
    
    await billAPI.deleteCategory(categoryId)
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
.bill-category-container {
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
}

.category-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.category-item.income {
  border-left: 4px solid #67c23a;
}

.category-item.expense {
  border-left: 4px solid #f56c6c;
}

.category-icon {
  margin-right: 15px;
  font-size: 24px;
  color: #409eff;
}

.category-info {
  flex: 1;
}

.category-info h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.category-type {
  margin: 0 0 5px 0;
  font-size: 12px;
  color: #999;
}

.category-desc {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.category-actions {
  display: flex;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
