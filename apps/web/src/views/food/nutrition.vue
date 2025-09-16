<template>
  <div class="food-nutrition-container">
    <div class="page-header">
      <h2>食物营养信息</h2>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索食物名称"
          style="width: 300px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          添加食物
        </el-button>
      </div>
    </div>

    <!-- 筛选器 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="食物分类">
          <el-select v-model="filterForm.category" placeholder="全部分类" clearable>
            <el-option
              v-for="category in foodCategories"
              :key="category._id"
              :label="category.name"
              :value="category._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="热量范围">
          <el-select v-model="filterForm.calorieRange" placeholder="全部热量" clearable>
            <el-option label="低热量 (0-100卡)" value="low" />
            <el-option label="中热量 (100-300卡)" value="medium" />
            <el-option label="高热量 (300卡以上)" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="primary" @click="applyFilter">筛选</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 食物列表 -->
    <el-card class="food-list-card">
      <div class="food-grid">
        <div 
          v-for="food in filteredFoods" 
          :key="food._id"
          class="food-item"
          @click="showNutritionDetail(food)"
        >
          <div class="food-image">
            <img v-if="food.image" :src="food.image" :alt="food.name" />
            <div v-else class="food-placeholder">
              <el-icon><Picture /></el-icon>
            </div>
          </div>
          <div class="food-info">
            <h4>{{ food.name }}</h4>
            <p class="food-category">{{ getCategoryName(food.category) }}</p>
            <div class="nutrition-summary">
              <div class="nutrition-item">
                <span class="label">热量</span>
                <span class="value">{{ food.calories || 0 }} 卡</span>
              </div>
              <div class="nutrition-item">
                <span class="label">蛋白质</span>
                <span class="value">{{ food.protein || 0 }}g</span>
              </div>
              <div class="nutrition-item">
                <span class="label">脂肪</span>
                <span class="value">{{ food.fat || 0 }}g</span>
              </div>
              <div class="nutrition-item">
                <span class="label">碳水</span>
                <span class="value">{{ food.carbs || 0 }}g</span>
              </div>
            </div>
          </div>
          <div class="food-actions" @click.stop>
            <el-button size="small" @click="editFood(food)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button size="small" type="danger" @click="deleteFood(food._id)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="filteredFoods.length === 0" description="暂无食物信息">
        <el-button type="primary" @click="showAddDialog">添加第一个食物</el-button>
      </el-empty>
    </el-card>

    <!-- 添加/编辑食物对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEditing ? '编辑食物' : '添加食物'"
      width="600px"
    >
      <el-form 
        ref="foodFormRef" 
        :model="foodForm" 
        :rules="foodRules"
        label-width="100px"
      >
        <el-form-item label="食物名称" prop="name">
          <el-input v-model="foodForm.name" placeholder="请输入食物名称" />
        </el-form-item>
        <el-form-item label="食物分类" prop="category">
          <el-select v-model="foodForm.category" placeholder="请选择分类">
            <el-option
              v-for="category in foodCategories"
              :key="category._id"
              :label="category.name"
              :value="category._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单位重量" prop="unit">
          <el-input v-model="foodForm.unit" placeholder="如：100g、1个、1杯等" />
        </el-form-item>
        
        <el-divider content-position="left">营养成分 (每{{ foodForm.unit || '100g' }})</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="热量 (卡)" prop="calories">
              <el-input-number v-model="foodForm.calories" :min="0" :precision="1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="蛋白质 (g)" prop="protein">
              <el-input-number v-model="foodForm.protein" :min="0" :precision="1" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="脂肪 (g)" prop="fat">
              <el-input-number v-model="foodForm.fat" :min="0" :precision="1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="碳水化合物 (g)" prop="carbs">
              <el-input-number v-model="foodForm.carbs" :min="0" :precision="1" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="纤维 (g)" prop="fiber">
              <el-input-number v-model="foodForm.fiber" :min="0" :precision="1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="糖分 (g)" prop="sugar">
              <el-input-number v-model="foodForm.sugar" :min="0" :precision="1" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="描述">
          <el-input 
            v-model="foodForm.description" 
            type="textarea" 
            placeholder="食物描述、注意事项等（可选）"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitFood">
            {{ isEditing ? '更新' : '添加' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 营养详情对话框 -->
    <el-dialog 
      v-model="detailVisible" 
      :title="selectedFood?.name + ' - 营养详情'"
      width="500px"
    >
      <div v-if="selectedFood" class="nutrition-detail">
        <div class="detail-header">
          <h3>{{ selectedFood.name }}</h3>
          <el-tag>{{ getCategoryName(selectedFood.category) }}</el-tag>
        </div>
        
        <div class="nutrition-chart">
          <div class="chart-item calories">
            <div class="chart-label">热量</div>
            <div class="chart-value">{{ selectedFood.calories || 0 }} 卡</div>
            <div class="chart-unit">每{{ selectedFood.unit || '100g' }}</div>
          </div>
          
          <div class="macros-grid">
            <div class="macro-item protein">
              <div class="macro-label">蛋白质</div>
              <div class="macro-value">{{ selectedFood.protein || 0 }}g</div>
            </div>
            <div class="macro-item fat">
              <div class="macro-label">脂肪</div>
              <div class="macro-value">{{ selectedFood.fat || 0 }}g</div>
            </div>
            <div class="macro-item carbs">
              <div class="macro-label">碳水化合物</div>
              <div class="macro-value">{{ selectedFood.carbs || 0 }}g</div>
            </div>
          </div>
          
          <div class="other-nutrients">
            <div class="nutrient-item">
              <span>纤维：{{ selectedFood.fiber || 0 }}g</span>
            </div>
            <div class="nutrient-item">
              <span>糖分：{{ selectedFood.sugar || 0 }}g</span>
            </div>
          </div>
        </div>
        
        <div v-if="selectedFood.description" class="food-description">
          <h4>描述</h4>
          <p>{{ selectedFood.description }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete, Picture } from '@element-plus/icons-vue'
import { foodAPI } from '@/api/apis'

// 响应式数据
const foods = ref([])
const foodCategories = ref([])
const searchKeyword = ref('')
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEditing = ref(false)
const selectedFood = ref(null)
const foodFormRef = ref()

// 筛选表单
const filterForm = reactive({
  category: '',
  calorieRange: ''
})

// 食物表单
const foodForm = reactive({
  _id: '',
  name: '',
  category: '',
  unit: '100g',
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  fiber: 0,
  sugar: 0,
  description: ''
})

// 表单验证规则
const foodRules = {
  name: [
    { required: true, message: '请输入食物名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择食物分类', trigger: 'change' }
  ],
  unit: [
    { required: true, message: '请输入单位重量', trigger: 'blur' }
  ]
}

// 过滤后的食物列表
const filteredFoods = computed(() => {
  let result = foods.value

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(food => 
      food.name.toLowerCase().includes(keyword)
    )
  }

  // 按分类筛选
  if (filterForm.category) {
    result = result.filter(food => food.category === filterForm.category)
  }

  // 按热量范围筛选
  if (filterForm.calorieRange) {
    result = result.filter(food => {
      const calories = food.calories || 0
      switch (filterForm.calorieRange) {
        case 'low': return calories <= 100
        case 'medium': return calories > 100 && calories <= 300
        case 'high': return calories > 300
        default: return true
      }
    })
  }

  return result
})

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = foodCategories.value.find(cat => cat._id === categoryId)
  return category ? category.name : '未分类'
}

// 获取食物列表
const fetchFoods = async () => {
  try {
    const response = await foodAPI.getList()
    foods.value = response.data || []
  } catch (error) {
    console.error('获取食物列表失败:', error)
    ElMessage.error('获取食物列表失败')
  }
}

// 获取食物分类
const fetchFoodCategories = async () => {
  try {
    const response = await foodAPI.getCategories()
    foodCategories.value = response.data || []
  } catch (error) {
    console.error('获取食物分类失败:', error)
    ElMessage.error('获取食物分类失败')
  }
}

// 搜索处理
const handleSearch = () => {
  // 实时搜索，由计算属性处理
}

// 重置筛选
const resetFilter = () => {
  filterForm.category = ''
  filterForm.calorieRange = ''
}

// 应用筛选
const applyFilter = () => {
  // 由计算属性自动处理
}

// 显示添加对话框
const showAddDialog = () => {
  isEditing.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑食物
const editFood = (food) => {
  isEditing.value = true
  Object.assign(foodForm, food)
  dialogVisible.value = true
}

// 显示营养详情
const showNutritionDetail = (food) => {
  selectedFood.value = food
  detailVisible.value = true
}

// 重置表单
const resetForm = () => {
  foodForm._id = ''
  foodForm.name = ''
  foodForm.category = ''
  foodForm.unit = '100g'
  foodForm.calories = 0
  foodForm.protein = 0
  foodForm.fat = 0
  foodForm.carbs = 0
  foodForm.fiber = 0
  foodForm.sugar = 0
  foodForm.description = ''
  if (foodFormRef.value) {
    foodFormRef.value.resetFields()
  }
}

// 提交食物
const submitFood = async () => {
  if (!foodFormRef.value) return
  
  try {
    await foodFormRef.value.validate()
    
    if (isEditing.value) {
      await foodAPI.update(foodForm._id, foodForm)
      ElMessage.success('食物更新成功')
    } else {
      await foodAPI.create(foodForm)
      ElMessage.success('食物添加成功')
    }
    
    dialogVisible.value = false
    await fetchFoods()
  } catch (error) {
    console.error('保存食物失败:', error)
    ElMessage.error('保存食物失败')
  }
}

// 删除食物
const deleteFood = async (foodId) => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除该食物，是否继续？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await foodAPI.delete(foodId)
    ElMessage.success('食物删除成功')
    await fetchFoods()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除食物失败:', error)
      ElMessage.error('删除食物失败')
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchFoods()
  fetchFoodCategories()
})
</script>

<style scoped>
.food-nutrition-container {
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

.filter-card {
  margin-bottom: 20px;
}

.food-list-card {
  margin-bottom: 20px;
}

.food-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.food-item {
  display: flex;
  flex-direction: column;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.food-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.food-image {
  width: 100%;
  height: 120px;
  margin-bottom: 10px;
  border-radius: 4px;
  overflow: hidden;
}

.food-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.food-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 24px;
}

.food-info h4 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 16px;
}

.food-category {
  margin: 0 0 10px 0;
  font-size: 12px;
  color: #999;
}

.nutrition-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.nutrition-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.nutrition-item .label {
  color: #666;
}

.nutrition-item .value {
  color: #333;
  font-weight: 500;
}

.food-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s;
}

.food-item:hover .food-actions {
  opacity: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 营养详情样式 */
.nutrition-detail {
  padding: 10px 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-header h3 {
  margin: 0;
  color: #333;
}

.nutrition-chart {
  margin-bottom: 20px;
}

.chart-item.calories {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 20px;
}

.chart-label {
  font-size: 14px;
  opacity: 0.9;
}

.chart-value {
  font-size: 32px;
  font-weight: bold;
  margin: 10px 0;
}

.chart-unit {
  font-size: 12px;
  opacity: 0.8;
}

.macros-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.macro-item {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  color: white;
}

.macro-item.protein {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.macro-item.fat {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.macro-item.carbs {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.macro-label {
  font-size: 12px;
  opacity: 0.9;
}

.macro-value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

.other-nutrients {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.nutrient-item {
  padding: 8px 16px;
  background: #f5f7fa;
  border-radius: 20px;
  font-size: 12px;
  color: #666;
}

.food-description {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.food-description h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.food-description p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}
</style>
