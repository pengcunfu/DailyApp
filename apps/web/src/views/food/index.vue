<template>
  <div class="food-container">
    <div class="page-header">
      <h2>美食记录</h2>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>
        添加记录
      </el-button>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="餐次">
          <el-select v-model="filterForm.mealType" placeholder="请选择餐次" clearable>
            <el-option label="早餐" value="breakfast" />
            <el-option label="午餐" value="lunch" />
            <el-option label="晚餐" value="dinner" />
            <el-option label="零食" value="snack" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="filterForm.categoryId" placeholder="请选择分类" clearable>
            <el-option 
              v-for="category in categories" 
              :key="category._id" 
              :label="category.name" 
              :value="category._id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchFoods">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 今日营养统计 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ dailyNutrition.totalCalories || 0 }}</div>
            <div class="stat-label">今日热量(kcal)</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ dailyNutrition.totalProtein || 0 }}g</div>
            <div class="stat-label">蛋白质</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ dailyNutrition.totalCarbs || 0 }}g</div>
            <div class="stat-label">碳水化合物</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ dailyNutrition.totalFat || 0 }}g</div>
            <div class="stat-label">脂肪</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 美食列表 -->
    <el-card class="table-card">
      <el-table :data="foodList" v-loading="loading">
        <el-table-column prop="name" label="食物名称" min-width="150" />
        <el-table-column prop="mealType" label="餐次" width="80">
          <template #default="{ row }">
            <el-tag :type="getMealTypeColor(row.mealType)" size="small">
              {{ getMealTypeText(row.mealType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100">
          <template #default="{ row }">
            {{ row.quantity }}{{ row.unit }}
          </template>
        </el-table-column>
        <el-table-column prop="nutrition.calories" label="热量" width="100">
          <template #default="{ row }">
            {{ (row.nutrition.calories * row.quantity).toFixed(1) }} kcal
          </template>
        </el-table-column>
        <el-table-column prop="rating" label="评分" width="120">
          <template #default="{ row }">
            <el-rate 
              v-model="row.rating" 
              disabled 
              show-score 
              text-color="#ff9900" 
              score-template="{value}" />
          </template>
        </el-table-column>
        <el-table-column prop="mealTime" label="用餐时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.mealTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地点" width="120" show-overflow-tooltip />
        <el-table-column prop="price" label="价格" width="80">
          <template #default="{ row }">
            <span v-if="row.price">¥{{ row.price.toFixed(2) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="mood" label="心情" width="80">
          <template #default="{ row }">
            <span class="mood-emoji">{{ getMoodEmoji(row.mood) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editFood(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteFood(row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="resetForm">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="食物名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入食物名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="餐次" prop="mealType">
              <el-select v-model="form.mealType" placeholder="请选择餐次" style="width: 100%">
                <el-option label="早餐" value="breakfast" />
                <el-option label="午餐" value="lunch" />
                <el-option label="晚餐" value="dinner" />
                <el-option label="零食" value="snack" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="数量" prop="quantity">
              <el-input-number 
                v-model="form.quantity" 
                :min="0.1" 
                :precision="1" 
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单位">
              <el-input v-model="form.unit" placeholder="份/个/杯等" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分类">
              <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
                <el-option 
                  v-for="category in categories" 
                  :key="category._id" 
                  :label="category.name" 
                  :value="category._id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用餐时间" prop="mealTime">
              <el-date-picker
                v-model="form.mealTime"
                type="datetime"
                placeholder="请选择用餐时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地点">
              <el-input v-model="form.location" placeholder="用餐地点" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 营养信息 -->
        <el-divider content-position="left">营养信息(每份)</el-divider>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="热量(kcal)">
              <el-input-number 
                v-model="form.nutrition.calories" 
                :min="0" 
                :precision="1" 
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="蛋白质(g)">
              <el-input-number 
                v-model="form.nutrition.protein" 
                :min="0" 
                :precision="1" 
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="碳水(g)">
              <el-input-number 
                v-model="form.nutrition.carbs" 
                :min="0" 
                :precision="1" 
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="脂肪(g)">
              <el-input-number 
                v-model="form.nutrition.fat" 
                :min="0" 
                :precision="1" 
                style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="价格">
              <el-input-number 
                v-model="form.price" 
                :min="0" 
                :precision="2" 
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="评分">
              <el-rate v-model="form.rating" show-text />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="心情">
              <el-select v-model="form.mood" placeholder="选择心情" style="width: 100%">
                <el-option label="😍 非常棒" value="excellent" />
                <el-option label="😊 很好" value="good" />
                <el-option label="😐 一般" value="neutral" />
                <el-option label="😞 不好" value="bad" />
                <el-option label="😫 很糟" value="terrible" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注">
          <el-input 
            v-model="form.remark" 
            type="textarea" 
            :rows="3" 
            placeholder="记录感想、口味等..." />
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
        <el-button type="primary" @click="saveFood" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { foodAPI } from '@/api/apis'
import { formatDate } from '@/utils'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const foodList = ref([])
const categories = ref([])
const dailyNutrition = ref({})
const dialogVisible = ref(false)
const dialogTitle = ref('添加美食记录')
const formRef = ref(null)
const tagInput = ref('')
const editingId = ref(null)

// 分页
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 筛选表单
const filterForm = reactive({
  mealType: '',
  categoryId: '',
  dateRange: []
})

// 美食表单
const form = reactive({
  name: '',
  categoryId: '',
  mealTime: new Date().toISOString(),
  mealType: 'lunch',
  quantity: 1,
  unit: '份',
  nutrition: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  },
  location: '',
  price: 0,
  rating: 5,
  tags: [],
  remark: '',
  mood: 'good'
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入食物名称', trigger: 'blur' }
  ],
  mealType: [
    { required: true, message: '请选择餐次', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' }
  ],
  mealTime: [
    { required: true, message: '请选择用餐时间', trigger: 'change' }
  ]
}

// 方法
const loadFoods = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit
    }
    
    if (filterForm.mealType) {
      params.mealType = filterForm.mealType
    }
    if (filterForm.categoryId) {
      params.categoryId = filterForm.categoryId
    }
    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      params.startDate = filterForm.dateRange[0]
      params.endDate = filterForm.dateRange[1]
    }

    const response = await foodAPI.getFoods(params)
    if (response.success) {
      foodList.value = response.data.foods
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    ElMessage.error('加载美食记录失败')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await foodAPI.getCategories()
    if (response.success) {
      categories.value = response.data.categories
    }
  } catch (error) {
    ElMessage.error('加载分类失败')
  }
}

const loadDailyNutrition = async () => {
  try {
    const response = await foodAPI.getDailyNutrition({ 
      date: new Date().toISOString().split('T')[0] 
    })
    if (response.success) {
      dailyNutrition.value = response.data.nutrition
    }
  } catch (error) {
    console.error('加载今日营养数据失败:', error)
  }
}

const getMealTypeText = (mealType) => {
  const texts = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '零食'
  }
  return texts[mealType] || mealType
}

const getMealTypeColor = (mealType) => {
  const colors = {
    breakfast: 'success',
    lunch: 'primary',
    dinner: 'warning',
    snack: 'info'
  }
  return colors[mealType] || 'info'
}

const getMoodEmoji = (mood) => {
  const emojis = {
    excellent: '😍',
    good: '😊',
    neutral: '😐',
    bad: '😞',
    terrible: '😫'
  }
  return emojis[mood] || '😊'
}

const showAddDialog = () => {
  dialogTitle.value = '添加美食记录'
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const editFood = (food) => {
  dialogTitle.value = '编辑美食记录'
  editingId.value = food._id
  
  Object.assign(form, {
    name: food.name,
    categoryId: food.categoryId?._id || '',
    mealTime: food.mealTime,
    mealType: food.mealType,
    quantity: food.quantity,
    unit: food.unit,
    nutrition: { ...food.nutrition },
    location: food.location || '',
    price: food.price || 0,
    rating: food.rating || 5,
    tags: [...(food.tags || [])],
    remark: food.remark || '',
    mood: food.mood || 'good'
  })
  
  dialogVisible.value = true
}

const saveFood = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const foodData = { ...form }
    
    if (editingId.value) {
      await foodAPI.updateFood(editingId.value, foodData)
      ElMessage.success('美食记录更新成功')
    } else {
      await foodAPI.createFood(foodData)
      ElMessage.success('美食记录创建成功')
    }
    
    dialogVisible.value = false
    loadFoods()
    loadDailyNutrition()
  } catch (error) {
    ElMessage.error(editingId.value ? '更新失败' : '创建失败')
  } finally {
    saving.value = false
  }
}

const deleteFood = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条美食记录吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await foodAPI.deleteFood(id)
    ElMessage.success('删除成功')
    loadFoods()
    loadDailyNutrition()
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
    categoryId: '',
    mealTime: new Date().toISOString(),
    mealType: 'lunch',
    quantity: 1,
    unit: '份',
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    location: '',
    price: 0,
    rating: 5,
    tags: [],
    remark: '',
    mood: 'good'
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

const searchFoods = () => {
  pagination.page = 1
  loadFoods()
}

const resetFilter = () => {
  filterForm.mealType = ''
  filterForm.categoryId = ''
  filterForm.dateRange = []
  pagination.page = 1
  loadFoods()
}

const handleSizeChange = (val) => {
  pagination.limit = val
  pagination.page = 1
  loadFoods()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  loadFoods()
}

// 生命周期
onMounted(() => {
  loadCategories()
  loadFoods()
  loadDailyNutrition()
})
</script>

<style scoped>
.food-container {
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

.mood-emoji {
  font-size: 18px;
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
