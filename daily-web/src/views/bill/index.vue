<template>
  <div class="bill-container">
    <div class="page-header">
      <h2>账单列表</h2>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>
        添加账单
      </el-button>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
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
          <el-button type="primary" @click="searchBills">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ totalAmount.toFixed(2) }}</div>
            <div class="stat-label">总支出</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ billList.length }}</div>
            <div class="stat-label">总笔数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ avgAmount.toFixed(2) }}</div>
            <div class="stat-label">平均金额</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ monthAmount.toFixed(2) }}</div>
            <div class="stat-label">本月支出</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 账单列表 -->
    <el-card class="table-card">
      <el-table :data="billList" v-loading="loading">
        <el-table-column prop="orderName" label="订单名称" min-width="150" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            <span class="amount-text">¥{{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="categoryId" label="分类" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.categoryId">{{ getCategoryName(row.categoryId._id) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="spendingTime" label="消费时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.spendingTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="备注" min-width="200" show-overflow-tooltip />
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
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editBill(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteBill(row._id)">删除</el-button>
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
      width="600px"
      @close="resetForm">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="订单名称" prop="orderName">
          <el-input v-model="form.orderName" placeholder="请输入订单名称" />
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number 
            v-model="form.amount" 
            :precision="2" 
            :min="0" 
            placeholder="请输入金额" 
            style="width: 100%" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option 
              v-for="category in categories" 
              :key="category._id" 
              :label="category.name" 
              :value="category._id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="消费时间" prop="spendingTime">
          <el-date-picker
            v-model="form.spendingTime"
            type="datetime"
            placeholder="请选择消费时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
            style="width: 100%">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入备注" />
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
        <el-button type="primary" @click="saveBill" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { billAPI } from '@/api/apis'
import { formatDate } from '@/utils'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const billList = ref([])
const categories = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加账单')
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
  categoryId: '',
  dateRange: [],
  search: ''
})

// 账单表单
const form = reactive({
  orderName: '',
  amount: 0,
  categoryId: '',
  spendingTime: new Date().toISOString(),
  description: '',
  tags: []
})

// 表单验证规则
const formRules = {
  orderName: [
    { required: true, message: '请输入订单名称', trigger: 'blur' }
  ],
  amount: [
    { required: true, message: '请输入金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '金额必须大于0', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  spendingTime: [
    { required: true, message: '请选择消费时间', trigger: 'change' }
  ]
}

// 计算属性
const totalAmount = computed(() => {
  return billList.value.reduce((sum, bill) => sum + bill.amount, 0)
})

const avgAmount = computed(() => {
  return billList.value.length > 0 ? totalAmount.value / billList.value.length : 0
})

const monthAmount = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  return billList.value
    .filter(bill => {
      const billDate = new Date(bill.spendingTime)
      return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear
    })
    .reduce((sum, bill) => sum + bill.amount, 0)
})

// 方法
const loadBills = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit
    }
    
    if (filterForm.categoryId) {
      params.categoryId = filterForm.categoryId
    }
    
    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      params.startDate = filterForm.dateRange[0]
      params.endDate = filterForm.dateRange[1]
    }

    const response = await billAPI.getBills(params)
    if (response.success) {
      billList.value = response.data.bills
      pagination.total = response.data.pagination.total
    }
  } catch (error) {
    ElMessage.error('加载账单失败')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await billAPI.getCategories()
    if (response.success) {
      categories.value = response.data.categories
    }
  } catch (error) {
    ElMessage.error('加载分类失败')
  }
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat._id === categoryId)
  return category ? category.name : '未知分类'
}

const showAddDialog = () => {
  dialogTitle.value = '添加账单'
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const editBill = (bill) => {
  dialogTitle.value = '编辑账单'
  editingId.value = bill._id
  
  Object.assign(form, {
    orderName: bill.orderName,
    amount: bill.amount,
    categoryId: bill.categoryId._id,
    spendingTime: bill.spendingTime,
    description: bill.description || '',
    tags: [...(bill.tags || [])]
  })
  
  dialogVisible.value = true
}

const saveBill = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const billData = { ...form }
    
    if (editingId.value) {
      await billAPI.updateBill(editingId.value, billData)
      ElMessage.success('账单更新成功')
    } else {
      await billAPI.createBill(billData)
      ElMessage.success('账单创建成功')
    }
    
    dialogVisible.value = false
    loadBills()
  } catch (error) {
    ElMessage.error(editingId.value ? '更新失败' : '创建失败')
  } finally {
    saving.value = false
  }
}

const deleteBill = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条账单吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await billAPI.deleteBill(id)
    ElMessage.success('删除成功')
    loadBills()
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
    orderName: '',
    amount: 0,
    categoryId: '',
    spendingTime: new Date().toISOString(),
    description: '',
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

const searchBills = () => {
  pagination.page = 1
  loadBills()
}

const resetFilter = () => {
  filterForm.categoryId = ''
  filterForm.dateRange = []
  filterForm.search = ''
  pagination.page = 1
  loadBills()
}

const handleSizeChange = (val) => {
  pagination.limit = val
  pagination.page = 1
  loadBills()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  loadBills()
}

// 生命周期
onMounted(() => {
  loadCategories()
  loadBills()
})
</script>

<style scoped>
.bill-container {
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

.amount-text {
  color: #F56C6C;
  font-weight: bold;
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
