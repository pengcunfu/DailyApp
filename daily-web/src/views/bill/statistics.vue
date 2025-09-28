<template>
  <div class="statistics-container">
    <div class="page-header">
      <h2>消费统计</h2>
      <el-select v-model="selectedPeriod" @change="loadStatistics" style="width: 120px">
        <el-option label="本周" value="week" />
        <el-option label="本月" value="month" />
        <el-option label="本年" value="year" />
      </el-select>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">¥{{ stats.total.total ? stats.total.total.toFixed(2) : '0.00' }}</div>
            <div class="stat-label">总支出</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ stats.total.count || 0 }}</div>
            <div class="stat-label">总笔数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">¥{{ stats.total.avg ? stats.total.avg.toFixed(2) : '0.00' }}</div>
            <div class="stat-label">平均消费</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ categoryStats.length }}</div>
            <div class="stat-label">消费分类</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 分类统计饼图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>分类统计</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 分类统计表格 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>分类明细</span>
            </div>
          </template>
          <el-table :data="categoryStats" style="width: 100%" max-height="400">
            <el-table-column prop="categoryName" label="分类名称" width="120" />
            <el-table-column prop="totalAmount" label="总金额" width="100">
              <template #default="{ row }">
                <span class="amount-text">¥{{ row.totalAmount.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="count" label="笔数" width="80" />
            <el-table-column prop="avgAmount" label="平均" width="100">
              <template #default="{ row }">
                ¥{{ row.avgAmount.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="占比" width="100">
              <template #default="{ row }">
                {{ getPercentage(row.totalAmount) }}%
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图 -->
    <el-row :gutter="20" class="trend-row">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>消费趋势</span>
            </div>
          </template>
          <div ref="lineChartRef" class="chart-container-large"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { billAPI } from '@/api/apis'
import * as echarts from 'echarts'

// 响应式数据
const loading = ref(false)
const selectedPeriod = ref('month')
const pieChartRef = ref(null)
const lineChartRef = ref(null)
const pieChart = ref(null)
const lineChart = ref(null)

const stats = reactive({
  total: {},
  categoryStats: []
})

const categoryStats = ref([])

// 计算属性
const totalAmount = computed(() => {
  return categoryStats.value.reduce((sum, item) => sum + item.totalAmount, 0)
})

// 方法
const loadStatistics = async () => {
  loading.value = true
  try {
    const response = await billAPI.getStats({ period: selectedPeriod.value })
    if (response.success) {
      stats.total = response.data.total
      categoryStats.value = response.data.categoryStats
      
      await nextTick()
      initCharts()
    }
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

const getPercentage = (amount) => {
  if (totalAmount.value === 0) return 0
  return ((amount / totalAmount.value) * 100).toFixed(1)
}

const initCharts = () => {
  initPieChart()
  initLineChart()
}

const initPieChart = () => {
  if (!pieChartRef.value) return

  if (pieChart.value) {
    pieChart.value.dispose()
  }

  pieChart.value = echarts.init(pieChartRef.value)

  const pieData = categoryStats.value.map(item => ({
    name: item.categoryName,
    value: item.totalAmount
  }))

  const option = {
    title: {
      text: '消费分类统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: '消费金额',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: pieData
      }
    ]
  }

  pieChart.value.setOption(option)
}

const initLineChart = () => {
  if (!lineChartRef.value) return

  if (lineChart.value) {
    lineChart.value.dispose()
  }

  lineChart.value = echarts.init(lineChartRef.value)

  // 生成模拟的趋势数据
  const days = []
  const amounts = []
  const now = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    days.push(`${date.getMonth() + 1}/${date.getDate()}`)
    // 这里应该根据实际数据计算，暂时用随机数模拟
    amounts.push(Math.random() * 500 + 100)
  }

  const option = {
    title: {
      text: '近30天消费趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '日期: {b}<br/>消费: ¥{c}'
    },
    xAxis: {
      type: 'category',
      data: days,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '日消费',
        data: amounts,
        type: 'line',
        smooth: true,
        areaStyle: {
          opacity: 0.3
        },
        lineStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: '#409EFF'
            }, {
              offset: 1, color: 'rgba(64, 158, 255, 0.1)'
            }]
          }
        }
      }
    ]
  }

  lineChart.value.setOption(option)
}

// 生命周期
onMounted(() => {
  loadStatistics()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (pieChart.value) {
      pieChart.value.resize()
    }
    if (lineChart.value) {
      lineChart.value.resize()
    }
  })
})
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: bold;
}

.chart-container {
  height: 400px;
}

.chart-container-large {
  height: 300px;
}

.amount-text {
  color: #F56C6C;
  font-weight: bold;
}

.trend-row {
  margin-top: 20px;
}
</style>
