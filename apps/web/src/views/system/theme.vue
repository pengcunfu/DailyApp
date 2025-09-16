<template>
  <div class="theme-container">
    <div class="page-header">
      <h2>主题设置</h2>
      <el-button @click="resetToDefault">
        <el-icon><Refresh /></el-icon>
        恢复默认
      </el-button>
    </div>

    <div class="theme-content">
      <!-- 主题选择 -->
      <el-card class="theme-card">
        <template #header>
          <div class="card-header">
            <span>主题模式</span>
          </div>
        </template>
        
        <div class="theme-modes">
          <div 
            v-for="mode in themeModes" 
            :key="mode.value"
            class="theme-mode-item"
            :class="{ 'active': currentTheme.mode === mode.value }"
            @click="changeThemeMode(mode.value)"
          >
            <div class="mode-preview" :class="mode.value">
              <div class="preview-header"></div>
              <div class="preview-sidebar"></div>
              <div class="preview-content"></div>
            </div>
            <div class="mode-info">
              <h4>{{ mode.name }}</h4>
              <p>{{ mode.description }}</p>
            </div>
            <div class="mode-check" v-if="currentTheme.mode === mode.value">
              <el-icon><Check /></el-icon>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 颜色配置 -->
      <el-card class="color-card">
        <template #header>
          <div class="card-header">
            <span>颜色配置</span>
          </div>
        </template>
        
        <div class="color-settings">
          <div class="color-section">
            <h4>主色调</h4>
            <div class="color-options">
              <div 
                v-for="color in primaryColors" 
                :key="color.name"
                class="color-option"
                :class="{ 'active': currentTheme.primaryColor === color.value }"
                @click="changePrimaryColor(color.value)"
              >
                <div class="color-circle" :style="{ backgroundColor: color.value }"></div>
                <span class="color-name">{{ color.name }}</span>
              </div>
            </div>
            <div class="custom-color">
              <span>自定义颜色：</span>
              <el-color-picker 
                v-model="customPrimaryColor" 
                @change="changePrimaryColor(customPrimaryColor)"
              />
            </div>
          </div>
          
          <div class="color-section">
            <h4>成功色</h4>
            <div class="color-options">
              <div 
                v-for="color in successColors" 
                :key="color.name"
                class="color-option"
                :class="{ 'active': currentTheme.successColor === color.value }"
                @click="changeSuccessColor(color.value)"
              >
                <div class="color-circle" :style="{ backgroundColor: color.value }"></div>
                <span class="color-name">{{ color.name }}</span>
              </div>
            </div>
          </div>
          
          <div class="color-section">
            <h4>警告色</h4>
            <div class="color-options">
              <div 
                v-for="color in warningColors" 
                :key="color.name"
                class="color-option"
                :class="{ 'active': currentTheme.warningColor === color.value }"
                @click="changeWarningColor(color.value)"
              >
                <div class="color-circle" :style="{ backgroundColor: color.value }"></div>
                <span class="color-name">{{ color.name }}</span>
              </div>
            </div>
          </div>
          
          <div class="color-section">
            <h4>危险色</h4>
            <div class="color-options">
              <div 
                v-for="color in dangerColors" 
                :key="color.name"
                class="color-option"
                :class="{ 'active': currentTheme.dangerColor === color.value }"
                @click="changeDangerColor(color.value)"
              >
                <div class="color-circle" :style="{ backgroundColor: color.value }"></div>
                <span class="color-name">{{ color.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 布局配置 -->
      <el-card class="layout-card">
        <template #header>
          <div class="card-header">
            <span>布局配置</span>
          </div>
        </template>
        
        <div class="layout-settings">
          <div class="setting-group">
            <h4>侧边栏</h4>
            <div class="setting-options">
              <div class="setting-item">
                <span>侧边栏宽度</span>
                <el-slider 
                  v-model="currentTheme.sidebarWidth" 
                  :min="200" 
                  :max="300" 
                  :step="10"
                  show-input
                  @change="applySidebarWidth"
                />
              </div>
              <div class="setting-item">
                <span>固定侧边栏</span>
                <el-switch v-model="currentTheme.fixedSidebar" @change="applyFixedSidebar" />
              </div>
              <div class="setting-item">
                <span>侧边栏折叠</span>
                <el-switch v-model="currentTheme.collapseSidebar" @change="applyCollapseSidebar" />
              </div>
            </div>
          </div>
          
          <div class="setting-group">
            <h4>头部</h4>
            <div class="setting-options">
              <div class="setting-item">
                <span>固定头部</span>
                <el-switch v-model="currentTheme.fixedHeader" @change="applyFixedHeader" />
              </div>
              <div class="setting-item">
                <span>显示面包屑</span>
                <el-switch v-model="currentTheme.showBreadcrumb" @change="applyShowBreadcrumb" />
              </div>
              <div class="setting-item">
                <span>显示标签页</span>
                <el-switch v-model="currentTheme.showTabs" @change="applyShowTabs" />
              </div>
            </div>
          </div>
          
          <div class="setting-group">
            <h4>内容区域</h4>
            <div class="setting-options">
              <div class="setting-item">
                <span>内容区域圆角</span>
                <el-slider 
                  v-model="currentTheme.contentRadius" 
                  :min="0" 
                  :max="20" 
                  :step="2"
                  show-input
                  @change="applyContentRadius"
                />
              </div>
              <div class="setting-item">
                <span>内容区域间距</span>
                <el-slider 
                  v-model="currentTheme.contentPadding" 
                  :min="10" 
                  :max="40" 
                  :step="5"
                  show-input
                  @change="applyContentPadding"
                />
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 字体配置 -->
      <el-card class="font-card">
        <template #header>
          <div class="card-header">
            <span>字体配置</span>
          </div>
        </template>
        
        <div class="font-settings">
          <div class="setting-item">
            <span>字体大小</span>
            <el-select v-model="currentTheme.fontSize" @change="applyFontSize">
              <el-option label="小 (12px)" value="small" />
              <el-option label="中 (14px)" value="medium" />
              <el-option label="大 (16px)" value="large" />
            </el-select>
          </div>
          
          <div class="setting-item">
            <span>字体族</span>
            <el-select v-model="currentTheme.fontFamily" @change="applyFontFamily">
              <el-option label="系统默认" value="system" />
              <el-option label="苹方" value="PingFang SC" />
              <el-option label="微软雅黑" value="Microsoft YaHei" />
              <el-option label="思源黑体" value="Source Han Sans CN" />
            </el-select>
          </div>
          
          <div class="setting-item">
            <span>行高</span>
            <el-slider 
              v-model="currentTheme.lineHeight" 
              :min="1.2" 
              :max="2.0" 
              :step="0.1"
              show-input
              @change="applyLineHeight"
            />
          </div>
        </div>
      </el-card>

      <!-- 动画配置 -->
      <el-card class="animation-card">
        <template #header>
          <div class="card-header">
            <span>动画配置</span>
          </div>
        </template>
        
        <div class="animation-settings">
          <div class="setting-item">
            <span>启用动画</span>
            <el-switch v-model="currentTheme.enableAnimation" @change="applyEnableAnimation" />
          </div>
          
          <div class="setting-item" v-if="currentTheme.enableAnimation">
            <span>动画速度</span>
            <el-select v-model="currentTheme.animationSpeed" @change="applyAnimationSpeed">
              <el-option label="慢速" value="slow" />
              <el-option label="正常" value="normal" />
              <el-option label="快速" value="fast" />
            </el-select>
          </div>
          
          <div class="setting-item" v-if="currentTheme.enableAnimation">
            <span>页面切换动画</span>
            <el-select v-model="currentTheme.pageTransition" @change="applyPageTransition">
              <el-option label="淡入淡出" value="fade" />
              <el-option label="滑动" value="slide" />
              <el-option label="缩放" value="zoom" />
              <el-option label="无" value="none" />
            </el-select>
          </div>
        </div>
      </el-card>

      <!-- 预览区域 -->
      <el-card class="preview-card">
        <template #header>
          <div class="card-header">
            <span>实时预览</span>
          </div>
        </template>
        
        <div class="theme-preview">
          <div class="preview-demo">
            <div class="demo-header" :style="headerStyle">
              <div class="demo-logo">Logo</div>
              <div class="demo-nav">
                <span>首页</span>
                <span>管理</span>
                <span>设置</span>
              </div>
            </div>
            <div class="demo-body">
              <div class="demo-sidebar" :style="sidebarStyle">
                <div class="demo-menu-item active">菜单项 1</div>
                <div class="demo-menu-item">菜单项 2</div>
                <div class="demo-menu-item">菜单项 3</div>
              </div>
              <div class="demo-content" :style="contentStyle">
                <div class="demo-card">
                  <h4>示例卡片</h4>
                  <p>这是一个示例内容区域，用于预览当前主题效果。</p>
                  <div class="demo-buttons">
                    <button class="demo-btn primary" :style="{ backgroundColor: currentTheme.primaryColor }">
                      主要按钮
                    </button>
                    <button class="demo-btn success" :style="{ backgroundColor: currentTheme.successColor }">
                      成功按钮
                    </button>
                    <button class="demo-btn warning" :style="{ backgroundColor: currentTheme.warningColor }">
                      警告按钮
                    </button>
                    <button class="demo-btn danger" :style="{ backgroundColor: currentTheme.dangerColor }">
                      危险按钮
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Check } from '@element-plus/icons-vue'

// 主题模式
const themeModes = ref([
  {
    name: '浅色模式',
    value: 'light',
    description: '适合白天使用，界面清爽明亮'
  },
  {
    name: '深色模式',
    value: 'dark',
    description: '适合夜间使用，保护视力'
  },
  {
    name: '自动模式',
    value: 'auto',
    description: '根据系统时间自动切换'
  }
])

// 颜色选项
const primaryColors = ref([
  { name: '默认蓝', value: '#409eff' },
  { name: '科技蓝', value: '#1890ff' },
  { name: '深邃蓝', value: '#2f54eb' },
  { name: '活力橙', value: '#fa8c16' },
  { name: '温暖红', value: '#f5222d' },
  { name: '自然绿', value: '#52c41a' },
  { name: '优雅紫', value: '#722ed1' },
  { name: '现代灰', value: '#8c8c8c' }
])

const successColors = ref([
  { name: '标准绿', value: '#67c23a' },
  { name: '森林绿', value: '#52c41a' },
  { name: '薄荷绿', value: '#00d084' }
])

const warningColors = ref([
  { name: '标准橙', value: '#e6a23c' },
  { name: '活力橙', value: '#fa8c16' },
  { name: '金色', value: '#faad14' }
])

const dangerColors = ref([
  { name: '标准红', value: '#f56c6c' },
  { name: '鲜艳红', value: '#f5222d' },
  { name: '深红', value: '#cf1322' }
])

// 当前主题配置
const currentTheme = reactive({
  mode: 'light',
  primaryColor: '#409eff',
  successColor: '#67c23a',
  warningColor: '#e6a23c',
  dangerColor: '#f56c6c',
  sidebarWidth: 240,
  fixedSidebar: true,
  collapseSidebar: false,
  fixedHeader: true,
  showBreadcrumb: true,
  showTabs: true,
  contentRadius: 8,
  contentPadding: 20,
  fontSize: 'medium',
  fontFamily: 'system',
  lineHeight: 1.6,
  enableAnimation: true,
  animationSpeed: 'normal',
  pageTransition: 'fade'
})

// 自定义颜色
const customPrimaryColor = ref('#409eff')

// 计算样式
const headerStyle = computed(() => ({
  backgroundColor: currentTheme.mode === 'dark' ? '#2c3e50' : '#ffffff',
  color: currentTheme.mode === 'dark' ? '#ffffff' : '#333333',
  borderBottom: `1px solid ${currentTheme.mode === 'dark' ? '#34495e' : '#e4e7ed'}`
}))

const sidebarStyle = computed(() => ({
  width: `${currentTheme.sidebarWidth}px`,
  backgroundColor: currentTheme.mode === 'dark' ? '#34495e' : '#f8f9fa',
  color: currentTheme.mode === 'dark' ? '#ffffff' : '#333333'
}))

const contentStyle = computed(() => ({
  padding: `${currentTheme.contentPadding}px`,
  borderRadius: `${currentTheme.contentRadius}px`,
  backgroundColor: currentTheme.mode === 'dark' ? '#2c3e50' : '#ffffff',
  color: currentTheme.mode === 'dark' ? '#ffffff' : '#333333'
}))

// 主题模式切换
const changeThemeMode = (mode) => {
  currentTheme.mode = mode
  applyThemeMode()
}

// 颜色切换
const changePrimaryColor = (color) => {
  currentTheme.primaryColor = color
  applyPrimaryColor()
}

const changeSuccessColor = (color) => {
  currentTheme.successColor = color
  applySuccessColor()
}

const changeWarningColor = (color) => {
  currentTheme.warningColor = color
  applyWarningColor()
}

const changeDangerColor = (color) => {
  currentTheme.dangerColor = color
  applyDangerColor()
}

// 应用主题
const applyThemeMode = () => {
  document.documentElement.setAttribute('data-theme', currentTheme.mode)
  saveThemeSettings()
}

const applyPrimaryColor = () => {
  document.documentElement.style.setProperty('--el-color-primary', currentTheme.primaryColor)
  saveThemeSettings()
}

const applySuccessColor = () => {
  document.documentElement.style.setProperty('--el-color-success', currentTheme.successColor)
  saveThemeSettings()
}

const applyWarningColor = () => {
  document.documentElement.style.setProperty('--el-color-warning', currentTheme.warningColor)
  saveThemeSettings()
}

const applyDangerColor = () => {
  document.documentElement.style.setProperty('--el-color-danger', currentTheme.dangerColor)
  saveThemeSettings()
}

const applySidebarWidth = () => {
  document.documentElement.style.setProperty('--sidebar-width', `${currentTheme.sidebarWidth}px`)
  saveThemeSettings()
}

const applyFixedSidebar = () => {
  document.documentElement.setAttribute('data-fixed-sidebar', currentTheme.fixedSidebar.toString())
  saveThemeSettings()
}

const applyCollapseSidebar = () => {
  document.documentElement.setAttribute('data-collapse-sidebar', currentTheme.collapseSidebar.toString())
  saveThemeSettings()
}

const applyFixedHeader = () => {
  document.documentElement.setAttribute('data-fixed-header', currentTheme.fixedHeader.toString())
  saveThemeSettings()
}

const applyShowBreadcrumb = () => {
  document.documentElement.setAttribute('data-show-breadcrumb', currentTheme.showBreadcrumb.toString())
  saveThemeSettings()
}

const applyShowTabs = () => {
  document.documentElement.setAttribute('data-show-tabs', currentTheme.showTabs.toString())
  saveThemeSettings()
}

const applyContentRadius = () => {
  document.documentElement.style.setProperty('--content-radius', `${currentTheme.contentRadius}px`)
  saveThemeSettings()
}

const applyContentPadding = () => {
  document.documentElement.style.setProperty('--content-padding', `${currentTheme.contentPadding}px`)
  saveThemeSettings()
}

const applyFontSize = () => {
  const sizeMap = {
    small: '12px',
    medium: '14px',
    large: '16px'
  }
  document.documentElement.style.setProperty('--font-size-base', sizeMap[currentTheme.fontSize])
  saveThemeSettings()
}

const applyFontFamily = () => {
  const fontMap = {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'PingFang SC': '"PingFang SC", "Hiragino Sans GB", sans-serif',
    'Microsoft YaHei': '"Microsoft YaHei", sans-serif',
    'Source Han Sans CN': '"Source Han Sans CN", sans-serif'
  }
  document.documentElement.style.setProperty('--font-family-base', fontMap[currentTheme.fontFamily])
  saveThemeSettings()
}

const applyLineHeight = () => {
  document.documentElement.style.setProperty('--line-height-base', currentTheme.lineHeight.toString())
  saveThemeSettings()
}

const applyEnableAnimation = () => {
  document.documentElement.setAttribute('data-enable-animation', currentTheme.enableAnimation.toString())
  saveThemeSettings()
}

const applyAnimationSpeed = () => {
  const speedMap = {
    slow: '0.5s',
    normal: '0.3s',
    fast: '0.15s'
  }
  document.documentElement.style.setProperty('--animation-duration', speedMap[currentTheme.animationSpeed])
  saveThemeSettings()
}

const applyPageTransition = () => {
  document.documentElement.setAttribute('data-page-transition', currentTheme.pageTransition)
  saveThemeSettings()
}

// 保存主题设置
const saveThemeSettings = () => {
  localStorage.setItem('theme-settings', JSON.stringify(currentTheme))
}

// 加载主题设置
const loadThemeSettings = () => {
  const saved = localStorage.getItem('theme-settings')
  if (saved) {
    Object.assign(currentTheme, JSON.parse(saved))
    applyAllThemeSettings()
  }
}

// 应用所有主题设置
const applyAllThemeSettings = () => {
  applyThemeMode()
  applyPrimaryColor()
  applySuccessColor()
  applyWarningColor()
  applyDangerColor()
  applySidebarWidth()
  applyFixedSidebar()
  applyCollapseSidebar()
  applyFixedHeader()
  applyShowBreadcrumb()
  applyShowTabs()
  applyContentRadius()
  applyContentPadding()
  applyFontSize()
  applyFontFamily()
  applyLineHeight()
  applyEnableAnimation()
  applyAnimationSpeed()
  applyPageTransition()
}

// 恢复默认设置
const resetToDefault = () => {
  Object.assign(currentTheme, {
    mode: 'light',
    primaryColor: '#409eff',
    successColor: '#67c23a',
    warningColor: '#e6a23c',
    dangerColor: '#f56c6c',
    sidebarWidth: 240,
    fixedSidebar: true,
    collapseSidebar: false,
    fixedHeader: true,
    showBreadcrumb: true,
    showTabs: true,
    contentRadius: 8,
    contentPadding: 20,
    fontSize: 'medium',
    fontFamily: 'system',
    lineHeight: 1.6,
    enableAnimation: true,
    animationSpeed: 'normal',
    pageTransition: 'fade'
  })
  
  customPrimaryColor.value = '#409eff'
  applyAllThemeSettings()
  ElMessage.success('已恢复默认主题设置')
}

// 组件挂载时加载设置
onMounted(() => {
  loadThemeSettings()
})
</script>

<style scoped>
.theme-container {
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

.theme-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  font-weight: bold;
  color: #333;
}

/* 主题模式 */
.theme-modes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.theme-mode-item {
  position: relative;
  padding: 20px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.theme-mode-item:hover {
  border-color: #409eff;
}

.theme-mode-item.active {
  border-color: #409eff;
  background: #f0f9ff;
}

.mode-preview {
  width: 100%;
  height: 80px;
  border-radius: 4px;
  position: relative;
  margin-bottom: 15px;
  overflow: hidden;
}

.mode-preview.light {
  background: #ffffff;
  border: 1px solid #e4e7ed;
}

.mode-preview.dark {
  background: #2c3e50;
}

.mode-preview.auto {
  background: linear-gradient(90deg, #ffffff 50%, #2c3e50 50%);
  border: 1px solid #e4e7ed;
}

.preview-header {
  height: 20px;
  background: #409eff;
  opacity: 0.8;
}

.preview-sidebar {
  position: absolute;
  left: 0;
  top: 20px;
  width: 30%;
  height: 60px;
  background: rgba(0, 0, 0, 0.1);
}

.preview-content {
  position: absolute;
  right: 0;
  top: 20px;
  width: 70%;
  height: 60px;
  background: rgba(0, 0, 0, 0.05);
}

.mode-info h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.mode-info p {
  margin: 0;
  color: #666;
  font-size: 12px;
}

.mode-check {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #409eff;
  font-size: 20px;
}

/* 颜色设置 */
.color-settings {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.color-section h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.color-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s;
}

.color-option:hover {
  background: #f5f7fa;
}

.color-option.active {
  background: #f0f9ff;
}

.color-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-bottom: 5px;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-name {
  font-size: 12px;
  color: #666;
}

.custom-color {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #666;
}

/* 布局和其他设置 */
.layout-settings,
.font-settings,
.animation-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-group h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.setting-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.setting-item span {
  color: #666;
  font-size: 14px;
}

/* 预览区域 */
.theme-preview {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.preview-demo {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}

.demo-header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.demo-logo {
  font-weight: bold;
  font-size: 18px;
}

.demo-nav {
  display: flex;
  gap: 20px;
}

.demo-nav span {
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background 0.3s;
}

.demo-nav span:hover {
  background: rgba(0, 0, 0, 0.1);
}

.demo-body {
  display: flex;
  height: 200px;
}

.demo-sidebar {
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.demo-menu-item {
  padding: 10px 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.demo-menu-item:hover {
  background: rgba(0, 0, 0, 0.1);
}

.demo-menu-item.active {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  border-right: 2px solid #409eff;
}

.demo-content {
  flex: 1;
  padding: 20px;
}

.demo-card {
  background: rgba(0, 0, 0, 0.02);
  padding: 20px;
  border-radius: 6px;
}

.demo-card h4 {
  margin: 0 0 10px 0;
}

.demo-card p {
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.6;
}

.demo-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.demo-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.3s;
}

.demo-btn:hover {
  opacity: 0.8;
}

:deep(.el-slider) {
  width: 200px;
}

:deep(.el-select) {
  width: 150px;
}
</style>
