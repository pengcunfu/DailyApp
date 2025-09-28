<template>
  <div class="note-create-container">
    <div class="page-header">
      <h2>创建笔记</h2>
      <div class="header-actions">
        <el-button @click="saveDraft" :loading="savingDraft">
          <el-icon><DocumentCopy /></el-icon>
          保存草稿
        </el-button>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
      </div>
    </div>

    <el-card class="form-card">
      <el-form 
        ref="noteFormRef" 
        :model="noteForm" 
        :rules="noteRules"
        label-width="100px"
        size="large"
      >
        <el-form-item label="笔记标题" prop="title">
          <el-input 
            v-model="noteForm.title" 
            placeholder="请输入笔记标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="笔记分类" prop="noteType">
          <el-select 
            v-model="noteForm.noteType" 
            placeholder="请选择笔记分类"
            style="width: 100%"
          >
            <el-option
              v-for="type in noteTypes"
              :key="type._id"
              :label="type.name"
              :value="type._id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="笔记内容" prop="content">
          <div class="editor-container">
            <div class="editor-toolbar">
              <el-button-group>
                <el-button 
                  size="small" 
                  @click="insertFormat('**', '**')"
                  title="加粗"
                >
                  <strong>B</strong>
                </el-button>
                <el-button 
                  size="small" 
                  @click="insertFormat('*', '*')"
                  title="斜体"
                >
                  <em>I</em>
                </el-button>
                <el-button 
                  size="small" 
                  @click="insertFormat('`', '`')"
                  title="代码"
                >
                  Code
                </el-button>
                <el-button 
                  size="small" 
                  @click="insertFormat('# ', '')"
                  title="标题"
                >
                  H1
                </el-button>
                <el-button 
                  size="small" 
                  @click="insertFormat('- ', '')"
                  title="列表"
                >
                  List
                </el-button>
              </el-button-group>
            </div>
            <el-input 
              ref="contentInputRef"
              v-model="noteForm.content" 
              type="textarea" 
              placeholder="请输入笔记内容，支持 Markdown 格式"
              :rows="15"
              maxlength="10000"
              show-word-limit
            />
          </div>
        </el-form-item>

        <el-form-item label="标签">
          <el-select
            v-model="noteForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入标签（可选）"
            style="width: 100%"
          >
            <el-option
              v-for="tag in predefinedTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="是否公开">
          <el-switch 
            v-model="noteForm.isPublic"
            active-text="公开"
            inactive-text="私有"
          />
          <div class="form-tip">
            公开的笔记可以被其他用户查看
          </div>
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button @click="resetForm">重置</el-button>
            <el-button type="primary" @click="submitNote" :loading="submitting">
              发布笔记
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 预览区域 -->
    <el-card v-if="noteForm.content" class="preview-card">
      <template #header>
        <div class="card-header">
          <span>预览</span>
          <el-button size="small" @click="showPreview = !showPreview">
            {{ showPreview ? '隐藏预览' : '显示预览' }}
          </el-button>
        </div>
      </template>
      <div v-if="showPreview" class="preview-content" v-html="renderedContent"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, DocumentCopy } from '@element-plus/icons-vue'
import { noteAPI } from '@/api/apis'

const router = useRouter()

// 响应式数据
const noteFormRef = ref()
const contentInputRef = ref()
const submitting = ref(false)
const savingDraft = ref(false)
const showPreview = ref(false)
const noteTypes = ref([])

// 表单数据
const noteForm = reactive({
  title: '',
  noteType: '',
  content: '',
  tags: [],
  isPublic: false
})

// 预定义标签
const predefinedTags = ref([
  '学习', '工作', '生活', '技术', '思考', '总结', '计划', '想法'
])

// 表单验证规则
const noteRules = {
  title: [
    { required: true, message: '请输入笔记标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  noteType: [
    { required: true, message: '请选择笔记分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入笔记内容', trigger: 'blur' },
    { min: 1, max: 10000, message: '内容长度在 1 到 10000 个字符', trigger: 'blur' }
  ]
}

// 简单的 Markdown 渲染
const renderedContent = computed(() => {
  let html = noteForm.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/\n/g, '<br>')
  
  // 简单处理列表
  html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
  
  return html
})

// 获取笔记分类
const fetchNoteTypes = async () => {
  try {
    const response = await noteAPI.getTypes()
    noteTypes.value = response.data || []
  } catch (error) {
    console.error('获取笔记分类失败:', error)
    ElMessage.error('获取笔记分类失败')
  }
}

// 插入格式化文本
const insertFormat = (prefix, suffix) => {
  const textarea = contentInputRef.value?.$refs?.textarea
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = noteForm.content.substring(start, end)
  
  const beforeText = noteForm.content.substring(0, start)
  const afterText = noteForm.content.substring(end)
  
  noteForm.content = beforeText + prefix + selectedText + suffix + afterText
  
  // 重新设置光标位置
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(
      start + prefix.length,
      start + prefix.length + selectedText.length
    )
  }, 0)
}

// 保存草稿
const saveDraft = async () => {
  if (!noteForm.title || !noteForm.content) {
    ElMessage.warning('请至少输入标题和内容')
    return
  }
  
  try {
    savingDraft.value = true
    
    const draftData = {
      ...noteForm,
      isDraft: true
    }
    
    await noteAPI.create(draftData)
    ElMessage.success('草稿保存成功')
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('保存草稿失败')
  } finally {
    savingDraft.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (noteFormRef.value) {
    noteFormRef.value.resetFields()
  }
  noteForm.title = ''
  noteForm.noteType = ''
  noteForm.content = ''
  noteForm.tags = []
  noteForm.isPublic = false
}

// 提交笔记
const submitNote = async () => {
  if (!noteFormRef.value) return
  
  try {
    await noteFormRef.value.validate()
    
    submitting.value = true
    
    const noteData = {
      ...noteForm,
      isDraft: false
    }
    
    await noteAPI.create(noteData)
    ElMessage.success('笔记发布成功')
    
    // 跳转到列表页面
    router.push('/note')
  } catch (error) {
    console.error('发布笔记失败:', error)
    ElMessage.error('发布笔记失败')
  } finally {
    submitting.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/note')
}

// 组件挂载时获取数据
onMounted(() => {
  fetchNoteTypes()
})
</script>

<style scoped>
.note-create-container {
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
  gap: 10px;
}

.form-card {
  margin-bottom: 20px;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  background: #f5f7fa;
  padding: 8px 12px;
  border-bottom: 1px solid #dcdfe6;
}

.editor-toolbar .el-button-group {
  margin: 0;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.preview-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #333;
}

.preview-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 15px;
  background: #fafafa;
  border-radius: 4px;
  line-height: 1.6;
}

.preview-content :deep(h1) {
  font-size: 24px;
  margin: 20px 0 10px 0;
  color: #333;
}

.preview-content :deep(h2) {
  font-size: 20px;
  margin: 18px 0 8px 0;
  color: #333;
}

.preview-content :deep(h3) {
  font-size: 16px;
  margin: 16px 0 6px 0;
  color: #333;
}

.preview-content :deep(strong) {
  font-weight: bold;
  color: #333;
}

.preview-content :deep(em) {
  font-style: italic;
  color: #666;
}

.preview-content :deep(code) {
  background: #f1f1f1;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  color: #e96900;
}

.preview-content :deep(ul) {
  margin: 10px 0;
  padding-left: 20px;
}

.preview-content :deep(li) {
  margin: 5px 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-textarea__inner) {
  border-top: none;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
