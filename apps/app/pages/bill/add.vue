<template>
  <view class="add-bill-container">
    <!-- 金额输入区域 -->
    <view class="amount-section">
      <view class="amount-display">
        <text class="currency">¥</text>
        <text class="amount-text">{{ displayAmount }}</text>
      </view>
      <view class="amount-tips">{{ amountTips }}</view>
    </view>
    
    <!-- 类型切换 -->
    <view class="type-section">
      <view class="type-tabs">
        <view 
          class="type-tab"
          :class="{ active: billForm.type === 0 }"
          @tap="switchType(0)"
        >
          <text class="tab-icon expense">📤</text>
          <text class="tab-text">支出</text>
        </view>
        <view 
          class="type-tab"
          :class="{ active: billForm.type === 1 }"
          @tap="switchType(1)"
        >
          <text class="tab-icon income">📥</text>
          <text class="tab-text">收入</text>
        </view>
      </view>
    </view>
    
    <!-- 分类选择 -->
    <view class="category-section">
      <view class="section-title">选择分类</view>
      <scroll-view class="category-scroll" scroll-x>
        <view class="category-list">
          <view 
            class="category-item"
            :class="{ active: billForm.categoryId === category.id }"
            v-for="category in currentCategories"
            :key="category.id"
            @tap="selectCategory(category)"
          >
            <view class="category-icon" :style="{ backgroundColor: category.color }">
              <text class="iconfont">{{ category.icon }}</text>
            </view>
            <text class="category-name">{{ category.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 表单信息 -->
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">备注</text>
        <input 
          class="form-input"
          v-model="billForm.orderName"
          placeholder="请输入备注信息"
          maxlength="100"
        />
      </view>
      
      <view class="form-item">
        <text class="form-label">时间</text>
        <picker 
          mode="date" 
          :value="billForm.spendingDate"
          @change="onDateChange"
        >
          <view class="form-input picker-input">
            {{ billForm.spendingDate || '选择日期' }}
          </view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="form-label">时间</text>
        <picker 
          mode="time" 
          :value="billForm.spendingTime"
          @change="onTimeChange"
        >
          <view class="form-input picker-input">
            {{ billForm.spendingTime || '选择时间' }}
          </view>
        </picker>
      </view>
    </view>
    
    <!-- 数字键盘 -->
    <view class="keyboard-section">
      <view class="keyboard">
        <view class="keyboard-row" v-for="(row, index) in keyboard" :key="index">
          <view 
            class="keyboard-key"
            :class="{ 
              zero: key === '0',
              confirm: key === 'confirm',
              delete: key === 'delete'
            }"
            v-for="key in row"
            :key="key"
            @tap="onKeyPress(key)"
          >
            <text v-if="key === 'delete'" class="iconfont icon-delete">⌫</text>
            <text v-else-if="key === 'confirm'" class="confirm-text">完成</text>
            <text v-else>{{ key }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { billAPI } from '@/api/index'
import dayjs from 'dayjs'

export default {
  name: 'AddBill',
  data() {
    return {
      // 表单数据
      billForm: {
        type: 0, // 0: 支出, 1: 收入
        amount: '',
        categoryId: null,
        orderName: '',
        spendingDate: dayjs().format('YYYY-MM-DD'),
        spendingTime: dayjs().format('HH:mm')
      },
      
      // 分类数据
      expenseCategories: [],
      incomeCategories: [],
      
      // 数字键盘
      keyboard: [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['.', '0', 'delete'],
        ['confirm']
      ],
      
      // 编辑状态
      isEdit: false,
      editId: null
    }
  },
  
  computed: {
    // 当前显示的分类
    currentCategories() {
      return this.billForm.type === 0 ? this.expenseCategories : this.incomeCategories
    },
    
    // 显示金额
    displayAmount() {
      return this.billForm.amount || '0.00'
    },
    
    // 金额提示
    amountTips() {
      const amount = parseFloat(this.billForm.amount)
      if (isNaN(amount) || amount === 0) {
        return '请输入金额'
      }
      return this.billForm.type === 0 ? '支出金额' : '收入金额'
    }
  },
  
  onLoad(options) {
    if (options.id) {
      this.isEdit = true
      this.editId = options.id
      this.loadBillDetail(options.id)
    }
    this.loadCategories()
  },
  
  methods: {
    // 加载分类数据
    async loadCategories() {
      try {
        const response = await billAPI.getCategories()
        const categories = response.data
        
        // 分离收入和支出分类
        this.expenseCategories = categories.filter(cat => cat.type === 0)
        this.incomeCategories = categories.filter(cat => cat.type === 1)
        
        // 默认选择第一个分类
        if (this.currentCategories.length > 0) {
          this.billForm.categoryId = this.currentCategories[0].id
        }
        
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    },
    
    // 加载账单详情（编辑模式）
    async loadBillDetail(id) {
      try {
        const response = await billAPI.getDetail(id)
        const bill = response.data
        
        this.billForm = {
          type: bill.type,
          amount: bill.amount.toString(),
          categoryId: bill.categoryId,
          orderName: bill.orderName,
          spendingDate: dayjs(bill.spendingTime).format('YYYY-MM-DD'),
          spendingTime: dayjs(bill.spendingTime).format('HH:mm')
        }
        
        // 设置导航栏标题
        uni.setNavigationBarTitle({
          title: '编辑账单'
        })
        
      } catch (error) {
        console.error('加载账单详情失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },
    
    // 切换类型
    switchType(type) {
      if (this.billForm.type === type) return
      
      this.billForm.type = type
      this.billForm.categoryId = null
      
      // 自动选择第一个分类
      if (this.currentCategories.length > 0) {
        this.billForm.categoryId = this.currentCategories[0].id
      }
    },
    
    // 选择分类
    selectCategory(category) {
      this.billForm.categoryId = category.id
    },
    
    // 日期改变
    onDateChange(e) {
      this.billForm.spendingDate = e.detail.value
    },
    
    // 时间改变
    onTimeChange(e) {
      this.billForm.spendingTime = e.detail.value
    },
    
    // 键盘按键
    onKeyPress(key) {
      if (key === 'confirm') {
        this.handleSubmit()
        return
      }
      
      if (key === 'delete') {
        this.billForm.amount = this.billForm.amount.slice(0, -1)
        return
      }
      
      // 数字和小数点输入
      let currentAmount = this.billForm.amount
      
      // 限制小数点
      if (key === '.') {
        if (currentAmount.includes('.') || currentAmount === '') {
          return
        }
      }
      
      // 限制小数位数
      if (currentAmount.includes('.')) {
        const decimalPart = currentAmount.split('.')[1]
        if (decimalPart && decimalPart.length >= 2 && key !== '.') {
          return
        }
      }
      
      // 限制总长度
      if (currentAmount.length >= 10) {
        return
      }
      
      this.billForm.amount += key
    },
    
    // 表单验证
    validateForm() {
      if (!this.billForm.amount || parseFloat(this.billForm.amount) <= 0) {
        uni.showToast({
          title: '请输入有效金额',
          icon: 'none'
        })
        return false
      }
      
      if (!this.billForm.categoryId) {
        uni.showToast({
          title: '请选择分类',
          icon: 'none'
        })
        return false
      }
      
      if (!this.billForm.orderName.trim()) {
        uni.showToast({
          title: '请输入备注信息',
          icon: 'none'
        })
        return false
      }
      
      return true
    },
    
    // 提交表单
    async handleSubmit() {
      if (!this.validateForm()) return
      
      try {
        uni.showLoading({ title: '保存中...' })
        
        const formData = {
          ...this.billForm,
          amount: parseFloat(this.billForm.amount),
          spendingTime: `${this.billForm.spendingDate} ${this.billForm.spendingTime}:00`
        }
        
        delete formData.spendingDate
        delete formData.spendingTime
        
        if (this.isEdit) {
          await billAPI.update(this.editId, formData)
          uni.showToast({
            title: '更新成功',
            icon: 'success'
          })
        } else {
          await billAPI.create(formData)
          uni.showToast({
            title: '添加成功',
            icon: 'success'
          })
        }
        
        // 延迟返回
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
        
      } catch (error) {
        console.error('保存失败:', error)
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.add-bill-container {
  background: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.amount-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80rpx 32rpx 60rpx;
  color: #ffffff;
  text-align: center;
  
  .amount-display {
    display: flex;
    align-items: baseline;
    justify-content: center;
    margin-bottom: 16rpx;
    
    .currency {
      font-size: 48rpx;
      margin-right: 16rpx;
    }
    
    .amount-text {
      font-size: 96rpx;
      font-weight: 300;
      min-width: 200rpx;
    }
  }
  
  .amount-tips {
    font-size: 28rpx;
    opacity: 0.8;
  }
}

.type-section {
  background: #ffffff;
  margin: 32rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  .type-tabs {
    display: flex;
    gap: 24rpx;
    
    .type-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32rpx 24rpx;
      border-radius: 12rpx;
      background: #f8f9fa;
      transition: all 0.3s ease;
      
      &.active {
        background: rgba(0, 122, 255, 0.1);
        
        .tab-text {
          color: #007AFF;
          font-weight: bold;
        }
      }
      
      .tab-icon {
        font-size: 48rpx;
        margin-bottom: 12rpx;
        
        &.expense {
          color: #dc3545;
        }
        
        &.income {
          color: #28a745;
        }
      }
      
      .tab-text {
        font-size: 28rpx;
        color: #666666;
      }
    }
  }
}

.category-section {
  background: #ffffff;
  margin: 0 32rpx 32rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  .section-title {
    font-size: 28rpx;
    color: #333333;
    margin-bottom: 24rpx;
    font-weight: 500;
  }
  
  .category-scroll {
    width: 100%;
    
    .category-list {
      display: flex;
      gap: 24rpx;
      padding-bottom: 16rpx;
      
      .category-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 120rpx;
        padding: 16rpx;
        border-radius: 12rpx;
        transition: all 0.3s ease;
        
        &.active {
          background: rgba(0, 122, 255, 0.1);
          
          .category-name {
            color: #007AFF;
            font-weight: bold;
          }
        }
        
        .category-icon {
          width: 72rpx;
          height: 72rpx;
          border-radius: 36rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12rpx;
          
          .iconfont {
            font-size: 28rpx;
            color: #ffffff;
          }
        }
        
        .category-name {
          font-size: 24rpx;
          color: #666666;
          text-align: center;
        }
      }
    }
  }
}

.form-section {
  background: #ffffff;
  margin: 0 32rpx 32rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  .form-item {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .form-label {
      width: 120rpx;
      font-size: 28rpx;
      color: #333333;
    }
    
    .form-input {
      flex: 1;
      font-size: 28rpx;
      color: #333333;
      text-align: right;
      
      &.picker-input {
        color: #666666;
      }
    }
  }
}

.keyboard-section {
  flex: 1;
  display: flex;
  align-items: flex-end;
  
  .keyboard {
    width: 100%;
    background: #ffffff;
    border-top: 1rpx solid #e0e0e0;
    
    .keyboard-row {
      display: flex;
      
      &:last-child {
        .keyboard-key {
          background: #007AFF;
          color: #ffffff;
          
          .confirm-text {
            font-weight: bold;
          }
        }
      }
      
      .keyboard-key {
        flex: 1;
        height: 120rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ffffff;
        border: 1rpx solid #e0e0e0;
        font-size: 36rpx;
        color: #333333;
        transition: all 0.2s ease;
        
        &:active {
          background: #f0f0f0;
        }
        
        &.zero {
          flex: 2;
        }
        
        &.delete {
          background: #f8f9fa;
          
          .icon-delete {
            font-size: 32rpx;
            color: #666666;
          }
        }
        
        &.confirm {
          background: #007AFF;
          color: #ffffff;
          
          &:active {
            background: #0056b3;
          }
        }
      }
    }
  }
}

/* 图标字体样式 */
.iconfont {
  font-family: 'iconfont';
}
</style>
