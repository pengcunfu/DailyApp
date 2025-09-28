<template>
  <view class="add-todo-container">
    <!-- 表单内容 -->
    <view class="form-content">
      <!-- 标题输入 -->
      <view class="form-section">
        <view class="section-title">待办标题</view>
        <view class="input-wrapper">
          <input 
            class="title-input"
            v-model="todoForm.title"
            placeholder="请输入待办事项标题"
            maxlength="100"
            :focus="titleFocus"
          />
          <text class="char-count">{{ todoForm.title.length }}/100</text>
        </view>
      </view>
      
      <!-- 内容描述 -->
      <view class="form-section">
        <view class="section-title">详细描述</view>
        <view class="textarea-wrapper">
          <textarea 
            class="content-textarea"
            v-model="todoForm.content"
            placeholder="请输入详细描述（可选）"
            maxlength="500"
            :auto-height="true"
          />
          <text class="char-count">{{ todoForm.content.length }}/500</text>
        </view>
      </view>
      
      <!-- 优先级选择 -->
      <view class="form-section">
        <view class="section-title">优先级</view>
        <view class="priority-options">
          <view 
            class="priority-item"
            :class="{ active: todoForm.priority === priority.value }"
            v-for="priority in priorityOptions"
            :key="priority.value"
            @tap="selectPriority(priority.value)"
          >
            <view class="priority-icon" :class="'priority-' + priority.value">
              <text class="iconfont">{{ priority.icon }}</text>
            </view>
            <text class="priority-text">{{ priority.name }}</text>
          </view>
        </view>
      </view>
      
      <!-- 时间设置 -->
      <view class="form-section">
        <view class="section-title">时间设置</view>
        <view class="time-settings">
          <view class="time-item">
            <text class="time-label">开始时间</text>
            <picker 
              mode="datetime" 
              :value="todoForm.startTime"
              @change="onStartTimeChange"
            >
              <view class="time-picker">
                {{ todoForm.startTime ? formatDateTime(todoForm.startTime) : '选择开始时间' }}
              </view>
            </picker>
          </view>
          
          <view class="time-item">
            <text class="time-label">截止时间</text>
            <picker 
              mode="datetime" 
              :value="todoForm.endTime"
              @change="onEndTimeChange"
            >
              <view class="time-picker">
                {{ todoForm.endTime ? formatDateTime(todoForm.endTime) : '选择截止时间' }}
              </view>
            </picker>
          </view>
        </view>
      </view>
      
      <!-- 提醒设置 -->
      <view class="form-section">
        <view class="section-title">提醒设置</view>
        <view class="reminder-options">
          <view class="reminder-item">
            <text class="reminder-label">开启提醒</text>
            <switch 
              :checked="todoForm.reminderEnabled"
              @change="onReminderToggle"
              color="#007AFF"
            />
          </view>
          
          <view class="reminder-item" v-if="todoForm.reminderEnabled">
            <text class="reminder-label">提前提醒</text>
            <picker 
              :range="reminderOptions"
              :range-key="'name'"
              :value="reminderIndex"
              @change="onReminderChange"
            >
              <view class="reminder-picker">
                {{ reminderOptions[reminderIndex].name }}
              </view>
            </picker>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部操作按钮 -->
    <view class="bottom-actions">
      <button class="action-btn cancel" @tap="handleCancel">取消</button>
      <button 
        class="action-btn confirm" 
        :class="{ disabled: !canSubmit }"
        @tap="handleSubmit"
      >
        {{ isEdit ? '更新' : '创建' }}
      </button>
    </view>
  </view>
</template>

<script>
import { todoAPI } from '@/api/index'
import dayjs from 'dayjs'

export default {
  name: 'AddTodo',
  data() {
    return {
      titleFocus: false,
      isEdit: false,
      editId: null,
      
      // 表单数据
      todoForm: {
        title: '',
        content: '',
        priority: 0,
        startTime: '',
        endTime: '',
        reminderEnabled: false,
        reminderMinutes: 30
      },
      
      // 优先级选项
      priorityOptions: [
        { value: 0, name: '普通', icon: '🟢' },
        { value: 1, name: '重要', icon: '🟡' },
        { value: 2, name: '紧急', icon: '🔴' }
      ],
      
      // 提醒选项
      reminderOptions: [
        { value: 5, name: '5分钟前' },
        { value: 15, name: '15分钟前' },
        { value: 30, name: '30分钟前' },
        { value: 60, name: '1小时前' },
        { value: 120, name: '2小时前' },
        { value: 1440, name: '1天前' }
      ],
      reminderIndex: 2 // 默认30分钟
    }
  },
  
  computed: {
    // 是否可以提交
    canSubmit() {
      return this.todoForm.title.trim().length > 0
    }
  },
  
  onLoad(options) {
    if (options.id) {
      this.isEdit = true
      this.editId = options.id
      this.loadTodoDetail(options.id)
    } else {
      // 新建模式，设置默认开始时间为当前时间
      this.todoForm.startTime = dayjs().format('YYYY-MM-DD HH:mm')
      this.titleFocus = true
    }
    
    // 设置导航栏标题
    uni.setNavigationBarTitle({
      title: this.isEdit ? '编辑待办' : '新建待办'
    })
  },
  
  methods: {
    // 加载待办详情（编辑模式）
    async loadTodoDetail(id) {
      try {
        const response = await todoAPI.getDetail(id)
        const todo = response.data
        
        this.todoForm = {
          title: todo.title,
          content: todo.content || '',
          priority: todo.priority,
          startTime: todo.startTime ? dayjs(todo.startTime).format('YYYY-MM-DD HH:mm') : '',
          endTime: todo.endTime ? dayjs(todo.endTime).format('YYYY-MM-DD HH:mm') : '',
          reminderEnabled: !!todo.reminderMinutes,
          reminderMinutes: todo.reminderMinutes || 30
        }
        
        // 设置提醒选项索引
        const reminderIndex = this.reminderOptions.findIndex(
          option => option.value === this.todoForm.reminderMinutes
        )
        this.reminderIndex = reminderIndex >= 0 ? reminderIndex : 2
        
      } catch (error) {
        console.error('加载待办详情失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },
    
    // 选择优先级
    selectPriority(priority) {
      this.todoForm.priority = priority
    },
    
    // 开始时间改变
    onStartTimeChange(e) {
      this.todoForm.startTime = e.detail.value
    },
    
    // 截止时间改变
    onEndTimeChange(e) {
      this.todoForm.endTime = e.detail.value
    },
    
    // 提醒开关切换
    onReminderToggle(e) {
      this.todoForm.reminderEnabled = e.detail.value
    },
    
    // 提醒时间改变
    onReminderChange(e) {
      this.reminderIndex = e.detail.value
      this.todoForm.reminderMinutes = this.reminderOptions[e.detail.value].value
    },
    
    // 表单验证
    validateForm() {
      if (!this.todoForm.title.trim()) {
        uni.showToast({
          title: '请输入待办标题',
          icon: 'none'
        })
        return false
      }
      
      if (this.todoForm.startTime && this.todoForm.endTime) {
        const start = dayjs(this.todoForm.startTime)
        const end = dayjs(this.todoForm.endTime)
        
        if (end.isBefore(start)) {
          uni.showToast({
            title: '截止时间不能早于开始时间',
            icon: 'none'
          })
          return false
        }
      }
      
      return true
    },
    
    // 取消操作
    handleCancel() {
      uni.showModal({
        title: '确认取消',
        content: '确定要取消编辑吗？未保存的内容将丢失。',
        success: (res) => {
          if (res.confirm) {
            uni.navigateBack()
          }
        }
      })
    },
    
    // 提交表单
    async handleSubmit() {
      if (!this.canSubmit || !this.validateForm()) return
      
      try {
        uni.showLoading({ title: '保存中...' })
        
        const formData = {
          title: this.todoForm.title.trim(),
          content: this.todoForm.content.trim(),
          priority: this.todoForm.priority,
          startTime: this.todoForm.startTime ? `${this.todoForm.startTime}:00` : null,
          endTime: this.todoForm.endTime ? `${this.todoForm.endTime}:00` : null,
          reminderMinutes: this.todoForm.reminderEnabled ? this.todoForm.reminderMinutes : null
        }
        
        if (this.isEdit) {
          await todoAPI.update(this.editId, formData)
          uni.showToast({
            title: '更新成功',
            icon: 'success'
          })
        } else {
          await todoAPI.create(formData)
          uni.showToast({
            title: '创建成功',
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
    },
    
    // 格式化日期时间
    formatDateTime(datetime) {
      return dayjs(datetime).format('MM-DD HH:mm')
    }
  }
}
</script>

<style lang="scss" scoped>
.add-todo-container {
  background: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.form-content {
  padding: 32rpx;
}

.form-section {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 24rpx;
  }
}

.input-wrapper {
  position: relative;
  
  .title-input {
    width: 100%;
    font-size: 32rpx;
    color: #333333;
    padding: 24rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
    
    &:focus {
      border-color: #007AFF;
      background: #ffffff;
    }
  }
  
  .char-count {
    position: absolute;
    right: 16rpx;
    bottom: 8rpx;
    font-size: 20rpx;
    color: #999999;
  }
}

.textarea-wrapper {
  position: relative;
  
  .content-textarea {
    width: 100%;
    min-height: 200rpx;
    font-size: 28rpx;
    color: #333333;
    padding: 24rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
    box-sizing: border-box;
    
    &:focus {
      border-color: #007AFF;
      background: #ffffff;
    }
  }
  
  .char-count {
    position: absolute;
    right: 16rpx;
    bottom: 8rpx;
    font-size: 20rpx;
    color: #999999;
  }
}

.priority-options {
  display: flex;
  gap: 24rpx;
  
  .priority-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24rpx 16rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    transition: all 0.3s ease;
    
    &.active {
      background: rgba(0, 122, 255, 0.1);
      
      .priority-text {
        color: #007AFF;
        font-weight: bold;
      }
    }
    
    .priority-icon {
      width: 64rpx;
      height: 64rpx;
      border-radius: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12rpx;
      
      .iconfont {
        font-size: 32rpx;
      }
      
      &.priority-0 {
        background: rgba(40, 167, 69, 0.2);
      }
      
      &.priority-1 {
        background: rgba(255, 193, 7, 0.2);
      }
      
      &.priority-2 {
        background: rgba(220, 53, 69, 0.2);
      }
    }
    
    .priority-text {
      font-size: 24rpx;
      color: #666666;
    }
  }
}

.time-settings {
  .time-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .time-label {
      font-size: 28rpx;
      color: #333333;
    }
    
    .time-picker {
      font-size: 28rpx;
      color: #007AFF;
      padding: 16rpx 24rpx;
      background: rgba(0, 122, 255, 0.1);
      border-radius: 8rpx;
    }
  }
}

.reminder-options {
  .reminder-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .reminder-label {
      font-size: 28rpx;
      color: #333333;
    }
    
    .reminder-picker {
      font-size: 28rpx;
      color: #007AFF;
      padding: 16rpx 24rpx;
      background: rgba(0, 122, 255, 0.1);
      border-radius: 8rpx;
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  gap: 24rpx;
  
  .action-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.cancel {
      background: #f8f9fa;
      color: #666666;
    }
    
    &.confirm {
      background: linear-gradient(135deg, #007AFF, #5856D6);
      color: #ffffff;
      
      &.disabled {
        opacity: 0.6;
        background: #cccccc;
      }
    }
  }
}

/* 图标字体样式 */
.iconfont {
  font-family: 'iconfont';
}
</style>
