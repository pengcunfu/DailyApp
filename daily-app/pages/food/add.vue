<template>
  <view class="add-food-page">
    <!-- 导航栏 -->
    <van-nav-bar
      :title="isEdit ? '编辑美食' : '添加美食'"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <!-- 表单内容 -->
    <view class="form-container">
      <van-form @submit="onSubmit">
        <!-- 美食名称 -->
        <van-field
          v-model="formData.name"
          name="name"
          label="美食名称"
          placeholder="请输入美食名称"
          :rules="[{ required: true, message: '请输入美食名称' }]"
        />

        <!-- 美食图片 -->
        <van-field name="image" label="美食图片">
          <template #input>
            <van-uploader
              v-model="imageList"
              :max-count="1"
              :after-read="afterRead"
              upload-text="上传图片"
            />
          </template>
        </van-field>

        <!-- 用餐时间 -->
        <van-field
          v-model="formData.mealTime"
          name="mealTime"
          label="用餐时间"
          placeholder="选择用餐时间"
          readonly
          is-link
          @click="showMealTimePicker = true"
          :rules="[{ required: true, message: '请选择用餐时间' }]"
        />

        <!-- 餐次类型 -->
        <van-field
          v-model="formData.mealType"
          name="mealType"
          label="餐次类型"
          placeholder="选择餐次"
          readonly
          is-link
          @click="showMealTypePicker = true"
          :rules="[{ required: true, message: '请选择餐次类型' }]"
        />

        <!-- 美食分类 -->
        <van-field
          v-model="formData.category"
          name="category"
          label="美食分类"
          placeholder="选择分类"
          readonly
          is-link
          @click="showCategoryPicker = true"
        />

        <!-- 价格 -->
        <van-field
          v-model="formData.price"
          name="price"
          label="价格 (¥)"
          placeholder="请输入价格"
          type="digit"
        />

        <!-- 地点 -->
        <van-field
          v-model="formData.location"
          name="location"
          label="用餐地点"
          placeholder="请输入用餐地点"
        />

        <!-- 评分 -->
        <van-field name="rating" label="评分">
          <template #input>
            <van-rate v-model="formData.rating" :count="5" allow-half />
            <text style="margin-left: 10px;">{{ formData.rating }}分</text>
          </template>
        </van-field>

        <!-- 热量 -->
        <van-field
          v-model="formData.calories"
          name="calories"
          label="热量 (kcal)"
          placeholder="请输入热量"
          type="number"
        />

        <!-- 营养成分 -->
        <van-cell-group title="营养成分 (克)">
          <van-field
            v-model="formData.nutrition.protein"
            name="protein"
            label="蛋白质"
            placeholder="请输入蛋白质含量"
            type="digit"
          />
          <van-field
            v-model="formData.nutrition.carbs"
            name="carbs"
            label="碳水化合物"
            placeholder="请输入碳水化合物含量"
            type="digit"
          />
          <van-field
            v-model="formData.nutrition.fat"
            name="fat"
            label="脂肪"
            placeholder="请输入脂肪含量"
            type="digit"
          />
          <van-field
            v-model="formData.nutrition.fiber"
            name="fiber"
            label="膳食纤维"
            placeholder="请输入膳食纤维含量"
            type="digit"
          />
        </van-cell-group>

        <!-- 标签 -->
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

        <!-- 备注 -->
        <van-field
          v-model="formData.notes"
          name="notes"
          label="备注"
          type="textarea"
          placeholder="记录一下对这道美食的感想..."
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

    <!-- 用餐时间选择器 -->
    <van-popup v-model:show="showMealTimePicker" position="bottom">
      <van-datetime-picker
        v-model="currentMealTime"
        type="datetime"
        title="选择用餐时间"
        @confirm="onMealTimeConfirm"
        @cancel="showMealTimePicker = false"
      />
    </van-popup>

    <!-- 餐次类型选择器 -->
    <van-popup v-model:show="showMealTypePicker" position="bottom">
      <van-picker
        :columns="mealTypeColumns"
        title="选择餐次"
        @confirm="onMealTypeConfirm"
        @cancel="showMealTypePicker = false"
      />
    </van-popup>

    <!-- 分类选择器 -->
    <van-popup v-model:show="showCategoryPicker" position="bottom">
      <van-picker
        :columns="categoryColumns"
        title="选择分类"
        @confirm="onCategoryConfirm"
        @cancel="showCategoryPicker = false"
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
import { foodAPI } from '@/api'
import { showToast, showConfirmDialog } from 'vant'

// 页面参数
const props = defineProps({
  id: String
})

// 响应式数据
const formData = reactive({
  name: '',
  image: '',
  mealTime: '',
  mealType: '',
  category: '',
  price: '',
  location: '',
  rating: 5,
  calories: '',
  nutrition: {
    protein: '',
    carbs: '',
    fat: '',
    fiber: ''
  },
  tags: [],
  notes: ''
})

const imageList = ref([])
const submitting = ref(false)
const showMealTimePicker = ref(false)
const showMealTypePicker = ref(false)
const showCategoryPicker = ref(false)
const showTagInput = ref(false)
const currentMealTime = ref(new Date())
const newTag = ref('')

// 计算属性
const isEdit = computed(() => !!props.id)

// 选择器数据
const mealTypeColumns = [
  { text: '早餐', value: 'breakfast' },
  { text: '午餐', value: 'lunch' },
  { text: '晚餐', value: 'dinner' },
  { text: '夜宵', value: 'supper' },
  { text: '加餐', value: 'snack' }
]

const categoryColumns = ref([
  { text: '中式菜', value: 'chinese' },
  { text: '西式菜', value: 'western' },
  { text: '日式菜', value: 'japanese' },
  { text: '韩式菜', value: 'korean' },
  { text: '甜点', value: 'dessert' },
  { text: '饮品', value: 'drink' },
  { text: '其他', value: 'other' }
])

// 方法
const loadFoodDetail = async () => {
  if (!props.id) return
  
  try {
    const res = await foodAPI.getDetail(props.id)
    const food = res.data
    
    Object.assign(formData, {
      name: food.name || '',
      image: food.image || '',
      mealTime: food.mealTime || '',
      mealType: food.mealType || '',
      category: food.category || '',
      price: food.price || '',
      location: food.location || '',
      rating: food.rating || 5,
      calories: food.calories || '',
      nutrition: {
        protein: food.nutrition?.protein || '',
        carbs: food.nutrition?.carbs || '',
        fat: food.nutrition?.fat || '',
        fiber: food.nutrition?.fiber || ''
      },
      tags: food.tags || [],
      notes: food.notes || ''
    })

    if (food.image) {
      imageList.value = [{ url: food.image }]
    }
    
    if (food.mealTime) {
      currentMealTime.value = new Date(food.mealTime)
    }
  } catch (error) {
    console.error('获取美食详情失败:', error)
    showToast('获取美食详情失败')
  }
}

const loadCategories = async () => {
  try {
    const res = await foodAPI.getCategories()
    const categories = res.data || []
    categoryColumns.value = categories.map(cat => ({
      text: cat.name,
      value: cat.value || cat.name
    }))
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const onBack = () => {
  uni.navigateBack()
}

const afterRead = (file) => {
  // 这里应该实现图片上传逻辑
  console.log('上传的文件:', file)
  formData.image = file.content || file.url
}

const onMealTimeConfirm = ({ selectedValues }) => {
  formData.mealTime = formatDateTime(currentMealTime.value)
  showMealTimePicker.value = false
}

const onMealTypeConfirm = ({ selectedOptions }) => {
  formData.mealType = selectedOptions[0]?.text || ''
  showMealTypePicker.value = false
}

const onCategoryConfirm = ({ selectedOptions }) => {
  formData.category = selectedOptions[0]?.text || ''
  showCategoryPicker.value = false
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
  try {
    submitting.value = true

    const submitData = {
      ...formData,
      price: formData.price ? parseFloat(formData.price) : undefined,
      calories: formData.calories ? parseInt(formData.calories) : undefined,
      nutrition: {
        protein: formData.nutrition.protein ? parseFloat(formData.nutrition.protein) : undefined,
        carbs: formData.nutrition.carbs ? parseFloat(formData.nutrition.carbs) : undefined,
        fat: formData.nutrition.fat ? parseFloat(formData.nutrition.fat) : undefined,
        fiber: formData.nutrition.fiber ? parseFloat(formData.nutrition.fiber) : undefined
      }
    }

    if (isEdit.value) {
      await foodAPI.update(props.id, submitData)
      showToast('更新成功')
    } else {
      await foodAPI.create(submitData)
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
  loadCategories()
  if (isEdit.value) {
    loadFoodDetail()
  } else {
    // 新增时设置默认用餐时间为当前时间
    formData.mealTime = formatDateTime(new Date())
  }
})
</script>

<style lang="scss" scoped>
.add-food-page {
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

.submit-container {
  margin-top: 32px;
  padding: 0 16px 32px;
}
</style>
