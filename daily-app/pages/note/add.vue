<template>
  <view class="add-note-page">
    <!-- 导航栏 -->
    <van-nav-bar
      :title="isEdit ? '编辑笔记' : '新建笔记'"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    >
      <template #right>
        <van-button
          type="primary"
          size="small"
          @click="onSubmit"
          :loading="submitting"
        >
          {{ isEdit ? '更新' : '保存' }}
        </van-button>
      </template>
    </van-nav-bar>

    <!-- 表单内容 -->
    <view class="form-container">
      <van-form ref="formRef" @submit="onSubmit">
        <!-- 笔记标题 -->
        <van-field
          v-model="formData.title"
          name="title"
          label="标题"
          placeholder="请输入笔记标题"
          :rules="[{ required: true, message: '请输入笔记标题' }]"
        />

        <!-- 笔记分类 -->
        <van-field
          v-model="formData.category"
          name="category"
          label="分类"
          placeholder="选择分类"
          readonly
          is-link
          @click="showCategoryPicker = true"
        />

        <!-- 笔记标签 -->
        <van-field name="tags" label="标签">
          <template #input>
            <view class="tags-container">
              <van-tag
                v-for="(tag, index) in formData.tags"
                :key="index"
                closeable
                type="primary"
                size="medium"
                @close="removeTag(index)"
                style="margin-right: 8px; margin-bottom: 8px;"
              >
                {{ tag }}
              </van-tag>
              <van-button
                size="small"
                type="default"
                @click="showTagInput = true"
                style="margin-bottom: 8px;"
              >
                + 添加标签
              </van-button>
            </view>
          </template>
        </van-field>

        <!-- 重要程度 -->
        <van-field name="priority" label="重要程度">
          <template #input>
            <van-rate v-model="formData.priority" :count="5" />
            <text style="margin-left: 10px;">{{ getPriorityText(formData.priority) }}</text>
          </template>
        </van-field>

        <!-- 笔记内容 -->
        <van-field
          v-model="formData.content"
          name="content"
          label="内容"
          type="textarea"
          placeholder="在这里记录你的想法..."
          rows="8"
          autosize
          :rules="[{ required: true, message: '请输入笔记内容' }]"
        />

        <!-- 附件上传 -->
        <van-field name="attachments" label="附件">
          <template #input>
            <van-uploader
              v-model="attachmentList"
              :max-count="5"
              :after-read="afterAttachmentRead"
              upload-text="添加附件"
              multiple
            />
          </template>
        </van-field>

        <!-- 提醒设置 -->
        <van-cell-group title="提醒设置">
          <van-field name="reminder" label="设置提醒">
            <template #input>
              <van-switch v-model="formData.hasReminder" @change="onReminderChange" />
            </template>
          </van-field>
          
          <van-field
            v-if="formData.hasReminder"
            v-model="formData.reminderTime"
            name="reminderTime"
            label="提醒时间"
            placeholder="选择提醒时间"
            readonly
            is-link
            @click="showReminderPicker = true"
          />
        </van-cell-group>

        <!-- 位置信息 -->
        <van-field name="location" label="位置信息">
          <template #input>
            <van-button
              size="small"
              type="default"
              @click="getCurrentLocation"
              :loading="gettingLocation"
            >
              {{ formData.location ? '重新获取' : '获取当前位置' }}
            </van-button>
            <text v-if="formData.location" style="margin-left: 10px; font-size: 12px; color: #666;">
              {{ formData.location }}
            </text>
          </template>
        </van-field>

        <!-- 心情记录 -->
        <van-field name="mood" label="当前心情">
          <template #input>
            <view class="mood-selector">
              <view
                v-for="mood in moodOptions"
                :key="mood.value"
                class="mood-item"
                :class="{ active: formData.mood === mood.value }"
                @click="formData.mood = mood.value"
              >
                <text class="mood-emoji">{{ mood.emoji }}</text>
                <text class="mood-label">{{ mood.label }}</text>
              </view>
            </view>
          </template>
        </van-field>
      </van-form>
    </view>

    <!-- 分类选择器 -->
    <van-popup v-model:show="showCategoryPicker" position="bottom">
      <van-picker
        :columns="categoryColumns"
        title="选择分类"
        @confirm="onCategoryConfirm"
        @cancel="showCategoryPicker = false"
      />
    </van-popup>

    <!-- 提醒时间选择器 -->
    <van-popup v-model:show="showReminderPicker" position="bottom">
      <van-datetime-picker
        v-model="currentReminderTime"
        type="datetime"
        title="选择提醒时间"
        :min-date="new Date()"
        @confirm="onReminderTimeConfirm"
        @cancel="showReminderPicker = false"
      />
    </van-popup>

    <!-- 标签输入对话框 -->
    <van-dialog
      v-model:show="showTagInput"
      title="添加标签"
      show-cancel-button
      @confirm="addTag"
      @cancel="newTag = ''"
    >
      <van-field
        v-model="newTag"
        placeholder="请输入标签名称"
        style="margin: 16px 0;"
      />
    </van-dialog>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { noteAPI } from '@/api'
import { showToast, showConfirmDialog } from 'vant'

// 页面参数
const props = defineProps({
  id: String
})

// 响应式数据
const formData = reactive({
  title: '',
  category: '',
  tags: [],
  priority: 3,
  content: '',
  attachments: [],
  hasReminder: false,
  reminderTime: '',
  location: '',
  mood: ''
})

const attachmentList = ref([])
const submitting = ref(false)
const showCategoryPicker = ref(false)
const showReminderPicker = ref(false)
const showTagInput = ref(false)
const currentReminderTime = ref(new Date())
const newTag = ref('')
const gettingLocation = ref(false)

// 计算属性
const isEdit = computed(() => !!props.id)

// 选择器数据
const categoryColumns = ref([
  { text: '工作', value: 'work' },
  { text: '学习', value: 'study' },
  { text: '生活', value: 'life' },
  { text: '旅行', value: 'travel' },
  { text: '技术', value: 'tech' },
  { text: '想法', value: 'idea' },
  { text: '其他', value: 'other' }
])

// 心情选项
const moodOptions = [
  { value: 'happy', emoji: '😊', label: '开心' },
  { value: 'sad', emoji: '😢', label: '难过' },
  { value: 'excited', emoji: '🤩', label: '兴奋' },
  { value: 'calm', emoji: '😌', label: '平静' },
  { value: 'anxious', emoji: '😰', label: '焦虑' },
  { value: 'angry', emoji: '😠', label: '愤怒' }
]

// 表单引用
const formRef = ref()

// 方法
const loadNoteDetail = async () => {
  if (!props.id) return
  
  try {
    const res = await noteAPI.getDetail(props.id)
    const note = res.data
    
    Object.assign(formData, {
      title: note.title || '',
      category: note.category || '',
      tags: note.tags || [],
      priority: note.priority || 3,
      content: note.content || '',
      attachments: note.attachments || [],
      hasReminder: !!note.reminderTime,
      reminderTime: note.reminderTime || '',
      location: note.location || '',
      mood: note.mood || ''
    })

    if (note.attachments) {
      attachmentList.value = note.attachments.map(url => ({ url }))
    }
    
    if (note.reminderTime) {
      currentReminderTime.value = new Date(note.reminderTime)
    }
  } catch (error) {
    console.error('获取笔记详情失败:', error)
    showToast('获取笔记详情失败')
  }
}

const loadCategories = async () => {
  try {
    const res = await noteAPI.getTypes()
    const categories = res.data || []
    if (categories.length > 0) {
      categoryColumns.value = categories.map(cat => ({
        text: cat.name,
        value: cat.value || cat.name
      }))
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const onBack = () => {
  uni.navigateBack()
}

const afterAttachmentRead = (file) => {
  // 这里应该实现文件上传逻辑
  console.log('上传的文件:', file)
  if (Array.isArray(file)) {
    file.forEach(f => {
      formData.attachments.push(f.content || f.url)
    })
  } else {
    formData.attachments.push(file.content || file.url)
  }
}

const onCategoryConfirm = ({ selectedOptions }) => {
  formData.category = selectedOptions[0]?.text || ''
  showCategoryPicker.value = false
}

const onReminderChange = (value) => {
  if (!value) {
    formData.reminderTime = ''
  }
}

const onReminderTimeConfirm = ({ selectedValues }) => {
  formData.reminderTime = formatDateTime(currentReminderTime.value)
  showReminderPicker.value = false
}

const addTag = () => {
  if (newTag.value.trim() && !formData.tags.includes(newTag.value.trim())) {
    formData.tags.push(newTag.value.trim())
  }
  newTag.value = ''
  showTagInput.value = false
}

const removeTag = (index) => {
  formData.tags.splice(index, 1)
}

const getCurrentLocation = () => {
  gettingLocation.value = true
  
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      // 这里应该调用地理编码API获取地址信息
      formData.location = `${res.latitude}, ${res.longitude}`
      showToast('位置获取成功')
    },
    fail: (err) => {
      console.error('获取位置失败:', err)
      showToast('获取位置失败')
    },
    complete: () => {
      gettingLocation.value = false
    }
  })
}

const getPriorityText = (priority) => {
  const texts = {
    1: '很低',
    2: '较低',
    3: '普通',
    4: '重要',
    5: '紧急'
  }
  return texts[priority] || '普通'
}

const formatDateTime = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const onSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const submitData = {
      ...formData,
      reminderTime: formData.hasReminder ? formData.reminderTime : undefined
    }

    if (isEdit.value) {
      await noteAPI.update(props.id, submitData)
      showToast('更新成功')
    } else {
      await noteAPI.create(submitData)
      showToast('保存成功')
    }

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    if (error !== false) {
      console.error('保存失败:', error)
      showToast('保存失败，请重试')
    }
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  loadCategories()
  if (isEdit.value) {
    loadNoteDetail()
  }
})
</script>

<style lang="scss" scoped>
.add-note-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.form-container {
  padding: 16px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.mood-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.mood-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s;

  &.active {
    border-color: #1989fa;
    background-color: #f0f8ff;
  }

  .mood-emoji {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .mood-label {
    font-size: 12px;
    color: #666;
  }
}
</style>
