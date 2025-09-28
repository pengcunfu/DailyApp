<template>
  <view class="add-friend-page">
    <!-- 导航栏 -->
    <van-nav-bar
      :title="isEdit ? '编辑朋友' : '添加朋友'"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <!-- 表单内容 -->
    <view class="form-container">
      <van-form @submit="onSubmit">
        <!-- 头像上传 -->
        <van-field name="avatar" label="头像">
          <template #input>
            <van-uploader
              v-model="avatarList"
              :max-count="1"
              :after-read="afterAvatarRead"
              upload-text="上传头像"
            />
          </template>
        </van-field>

        <!-- 姓名 -->
        <van-field
          v-model="formData.name"
          name="name"
          label="姓名"
          placeholder="请输入朋友姓名"
          :rules="[{ required: true, message: '请输入朋友姓名' }]"
        />

        <!-- 昵称 -->
        <van-field
          v-model="formData.nickname"
          name="nickname"
          label="昵称"
          placeholder="请输入昵称"
        />

        <!-- 性别 -->
        <van-field
          v-model="formData.gender"
          name="gender"
          label="性别"
          placeholder="选择性别"
          readonly
          is-link
          @click="showGenderPicker = true"
        />

        <!-- 生日 -->
        <van-field
          v-model="formData.birthday"
          name="birthday"
          label="生日"
          placeholder="选择生日日期"
          readonly
          is-link
          @click="showBirthdayPicker = true"
          :rules="[{ required: true, message: '请选择生日日期' }]"
        />

        <!-- 关系 -->
        <van-field
          v-model="formData.relationship"
          name="relationship"
          label="关系"
          placeholder="选择关系类型"
          readonly
          is-link
          @click="showRelationshipPicker = true"
        />

        <!-- 联系方式 -->
        <van-cell-group title="联系方式">
          <van-field
            v-model="formData.phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            type="tel"
          />
          <van-field
            v-model="formData.email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱"
            type="email"
          />
          <van-field
            v-model="formData.wechat"
            name="wechat"
            label="微信号"
            placeholder="请输入微信号"
          />
          <van-field
            v-model="formData.qq"
            name="qq"
            label="QQ号"
            placeholder="请输入QQ号"
            type="number"
          />
        </van-cell-group>

        <!-- 职业信息 -->
        <van-cell-group title="职业信息">
          <van-field
            v-model="formData.occupation"
            name="occupation"
            label="职业"
            placeholder="请输入职业"
          />
          <van-field
            v-model="formData.company"
            name="company"
            label="公司"
            placeholder="请输入公司名称"
          />
        </van-cell-group>

        <!-- 地址信息 -->
        <van-field
          v-model="formData.address"
          name="address"
          label="地址"
          placeholder="请输入地址"
        />

        <!-- 兴趣爱好 -->
        <van-field name="hobbies" label="兴趣爱好">
          <template #input>
            <view class="hobbies-container">
              <van-tag
                v-for="(hobby, index) in formData.hobbies"
                :key="index"
                closeable
                type="primary"
                size="medium"
                @close="removeHobby(index)"
                style="margin-right: 8px; margin-bottom: 8px;"
              >
                {{ hobby }}
              </van-tag>
              <van-button
                size="small"
                type="default"
                @click="showHobbyInput = true"
                style="margin-bottom: 8px;"
              >
                + 添加爱好
              </van-button>
            </view>
          </template>
        </van-field>

        <!-- 重要程度 -->
        <van-field name="importance" label="重要程度">
          <template #input>
            <van-rate v-model="formData.importance" :count="5" />
            <text style="margin-left: 10px;">{{ getImportanceText(formData.importance) }}</text>
          </template>
        </van-field>

        <!-- 认识时间 -->
        <van-field
          v-model="formData.metDate"
          name="metDate"
          label="认识时间"
          placeholder="选择认识时间"
          readonly
          is-link
          @click="showMetDatePicker = true"
        />

        <!-- 认识地点 -->
        <van-field
          v-model="formData.metPlace"
          name="metPlace"
          label="认识地点"
          placeholder="请输入认识地点"
        />

        <!-- 备注 -->
        <van-field
          v-model="formData.notes"
          name="notes"
          label="备注"
          type="textarea"
          placeholder="记录一些关于这个朋友的特别信息..."
          rows="3"
          autosize
        />

        <!-- 提交按钮 -->
        <view class="submit-container">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="submitting"
          >
            {{ isEdit ? '更新' : '保存' }}
          </van-button>
        </view>
      </van-form>
    </view>

    <!-- 性别选择器 -->
    <van-popup v-model:show="showGenderPicker" position="bottom">
      <van-picker
        :columns="genderColumns"
        title="选择性别"
        @confirm="onGenderConfirm"
        @cancel="showGenderPicker = false"
      />
    </van-popup>

    <!-- 生日选择器 -->
    <van-popup v-model:show="showBirthdayPicker" position="bottom">
      <van-date-picker
        v-model="currentBirthday"
        title="选择生日"
        :min-date="new Date(1900, 0, 1)"
        :max-date="new Date()"
        @confirm="onBirthdayConfirm"
        @cancel="showBirthdayPicker = false"
      />
    </van-popup>

    <!-- 关系选择器 -->
    <van-popup v-model:show="showRelationshipPicker" position="bottom">
      <van-picker
        :columns="relationshipColumns"
        title="选择关系"
        @confirm="onRelationshipConfirm"
        @cancel="showRelationshipPicker = false"
      />
    </van-popup>

    <!-- 认识时间选择器 -->
    <van-popup v-model:show="showMetDatePicker" position="bottom">
      <van-date-picker
        v-model="currentMetDate"
        title="选择认识时间"
        :min-date="new Date(1990, 0, 1)"
        :max-date="new Date()"
        @confirm="onMetDateConfirm"
        @cancel="showMetDatePicker = false"
      />
    </van-popup>

    <!-- 爱好输入对话框 -->
    <van-dialog
      v-model:show="showHobbyInput"
      title="添加兴趣爱好"
      show-cancel-button
      @confirm="addHobby"
      @cancel="newHobby = ''"
    >
      <van-field
        v-model="newHobby"
        placeholder="请输入兴趣爱好"
        style="margin: 16px 0;"
      />
    </van-dialog>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { friendAPI } from '@/api'
import { showToast, showConfirmDialog } from 'vant'

// 页面参数
const props = defineProps({
  id: String
})

// 响应式数据
const formData = reactive({
  name: '',
  nickname: '',
  avatar: '',
  gender: '',
  birthday: '',
  relationship: '',
  phone: '',
  email: '',
  wechat: '',
  qq: '',
  occupation: '',
  company: '',
  address: '',
  hobbies: [],
  importance: 3,
  metDate: '',
  metPlace: '',
  notes: ''
})

const avatarList = ref([])
const submitting = ref(false)
const showGenderPicker = ref(false)
const showBirthdayPicker = ref(false)
const showRelationshipPicker = ref(false)
const showMetDatePicker = ref(false)
const showHobbyInput = ref(false)
const currentBirthday = ref(new Date())
const currentMetDate = ref(new Date())
const newHobby = ref('')

// 计算属性
const isEdit = computed(() => !!props.id)

// 选择器数据
const genderColumns = [
  { text: '男', value: 'male' },
  { text: '女', value: 'female' },
  { text: '其他', value: 'other' }
]

const relationshipColumns = [
  { text: '家人', value: 'family' },
  { text: '朋友', value: 'friend' },
  { text: '同事', value: 'colleague' },
  { text: '同学', value: 'classmate' },
  { text: '邻居', value: 'neighbor' },
  { text: '恋人', value: 'lover' },
  { text: '其他', value: 'other' }
]

// 方法
const loadFriendDetail = async () => {
  if (!props.id) return
  
  try {
    const res = await friendAPI.getDetail(props.id)
    const friend = res.data
    
    Object.assign(formData, {
      name: friend.name || '',
      nickname: friend.nickname || '',
      avatar: friend.avatar || '',
      gender: friend.gender || '',
      birthday: friend.birthday || '',
      relationship: friend.relationship || '',
      phone: friend.phone || '',
      email: friend.email || '',
      wechat: friend.wechat || '',
      qq: friend.qq || '',
      occupation: friend.occupation || '',
      company: friend.company || '',
      address: friend.address || '',
      hobbies: friend.hobbies || [],
      importance: friend.importance || 3,
      metDate: friend.metDate || '',
      metPlace: friend.metPlace || '',
      notes: friend.notes || ''
    })

    if (friend.avatar) {
      avatarList.value = [{ url: friend.avatar }]
    }
    
    if (friend.birthday) {
      currentBirthday.value = new Date(friend.birthday)
    }
    
    if (friend.metDate) {
      currentMetDate.value = new Date(friend.metDate)
    }
  } catch (error) {
    console.error('获取朋友详情失败:', error)
    showToast('获取朋友详情失败')
  }
}

const onBack = () => {
  uni.navigateBack()
}

const afterAvatarRead = (file) => {
  // 这里应该实现头像上传逻辑
  console.log('上传的头像:', file)
  formData.avatar = file.content || file.url
}

const onGenderConfirm = ({ selectedOptions }) => {
  formData.gender = selectedOptions[0]?.text || ''
  showGenderPicker.value = false
}

const onBirthdayConfirm = ({ selectedValues }) => {
  formData.birthday = formatDate(currentBirthday.value)
  showBirthdayPicker.value = false
}

const onRelationshipConfirm = ({ selectedOptions }) => {
  formData.relationship = selectedOptions[0]?.text || ''
  showRelationshipPicker.value = false
}

const onMetDateConfirm = ({ selectedValues }) => {
  formData.metDate = formatDate(currentMetDate.value)
  showMetDatePicker.value = false
}

const addHobby = () => {
  if (newHobby.value.trim() && !formData.hobbies.includes(newHobby.value.trim())) {
    formData.hobbies.push(newHobby.value.trim())
  }
  newHobby.value = ''
  showHobbyInput.value = false
}

const removeHobby = (index) => {
  formData.hobbies.splice(index, 1)
}

const getImportanceText = (importance) => {
  const texts = {
    1: '一般',
    2: '较重要',
    3: '重要',
    4: '很重要',
    5: '非常重要'
  }
  return texts[importance] || '重要'
}

const formatDate = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const onSubmit = async () => {
  try {
    submitting.value = true

    const submitData = {
      ...formData,
      importance: parseInt(formData.importance),
      qq: formData.qq ? parseInt(formData.qq) : undefined
    }

    if (isEdit.value) {
      await friendAPI.update(props.id, submitData)
      showToast('更新成功')
    } else {
      await friendAPI.create(submitData)
      showToast('添加成功')
    }

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('保存失败:', error)
    showToast('保存失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  if (isEdit.value) {
    loadFriendDetail()
  }
})
</script>

<style lang="scss" scoped>
.add-friend-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.form-container {
  padding: 16px;
}

.hobbies-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.submit-container {
  margin-top: 32px;
  padding: 0 16px 32px;
}
</style>
