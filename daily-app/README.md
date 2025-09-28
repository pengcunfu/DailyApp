# 日常助手 - 移动端应用

基于 UniApp + Vue 3 + Pinia 开发的移动端日常管理应用。

## 功能特性

### 📱 核心功能
- **用户认证** - 登录/注册，个人资料管理
- **账单管理** - 收支记录，分类统计，消费分析
- **待办事项** - 任务管理，优先级设置，完成状态
- **笔记管理** - 富文本笔记，分类管理
- **美食记录** - 饮食记录，营养统计
- **朋友管理** - 联系人管理，生日提醒
- **形象管理** - 外观记录，体重管理
- **个人中心** - 设置，统计，个人资料

### 🎨 界面特点
- 现代化 UI 设计
- 响应式布局
- 流畅的交互动画
- 直观的操作体验

## 技术栈

- **框架**: UniApp + Vue 3
- **状态管理**: Pinia
- **UI组件**: 自定义组件 + UniUI
- **网络请求**: 封装的 request 工具
- **日期处理**: dayjs
- **构建工具**: Vite

## 项目结构

```
apps/app/
├── pages/                    # 页面文件
│   ├── index/               # 首页
│   ├── login/               # 登录页
│   ├── bill/                # 账单管理
│   │   ├── index.vue        # 账单列表
│   │   └── add.vue          # 添加/编辑账单
│   ├── todo/                # 待办事项
│   │   └── index.vue        # 待办列表
│   ├── note/                # 笔记管理
│   ├── food/                # 美食记录
│   ├── friend/              # 朋友管理
│   ├── appearance/          # 形象管理
│   └── profile/             # 个人中心
├── api/                     # API接口
├── stores/                  # Pinia状态管理
├── utils/                   # 工具函数
├── static/                  # 静态资源
├── pages.json              # 页面配置
├── manifest.json           # 应用配置
└── main.js                 # 入口文件
```

## 开发指南

### 安装依赖
```bash
npm install
```

### 开发运行
```bash
# H5端
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# APP端
npm run dev:app
```

### 构建打包
```bash
# H5端
npm run build:h5

# 微信小程序
npm run build:mp-weixin

# APP端
npm run build:app
```

## API 配置

在 `utils/request.js` 中配置后端API地址：
```javascript
const BASE_URL = 'http://localhost:3000/api'
```

## 主要页面功能

### 🏠 首页 (pages/index/index.vue)
- 用户信息展示
- 快捷操作入口
- 今日数据统计
- 最近活动记录
- 紧急待办提醒

### 💰 账单管理 (pages/bill/)
- 账单列表展示
- 收入/支出分类
- 月度统计数据
- 分类筛选功能
- 添加/编辑账单
- 自定义数字键盘

### ✅ 待办事项 (pages/todo/)
- 待办列表管理
- 优先级设置
- 完成状态切换
- 统计数据展示
- 筛选功能

### 👤 个人中心 (pages/profile/)
- 用户信息展示
- 个人资料编辑
- 密码修改
- 数据统计
- 功能设置入口

## 状态管理

使用 Pinia 进行状态管理，主要包括：

### 用户状态 (stores/user.js)
- 用户信息
- 登录状态
- Token管理
- 认证相关操作

## 特色功能

### 🎨 美观的UI设计
- 渐变色背景
- 卡片式布局
- 圆角设计
- 阴影效果

### 📱 移动端优化
- 触摸友好的交互
- 合适的字体大小
- 响应式布局
- 手势操作支持

### 🚀 性能优化
- 组件懒加载
- 图片压缩
- 请求缓存
- 本地存储

## 开发规范

### 代码风格
- 使用 Vue 3 Composition API
- 统一的命名规范
- 组件化开发
- 注释规范

### 文件命名
- 页面文件：kebab-case
- 组件文件：PascalCase
- 工具文件：camelCase

## 部署说明

### H5端部署
1. 执行 `npm run build:h5`
2. 将 `dist/build/h5` 目录部署到web服务器

### 小程序部署
1. 执行 `npm run build:mp-weixin`
2. 使用微信开发者工具打开 `dist/build/mp-weixin` 目录
3. 上传代码到微信小程序平台

### APP部署
1. 执行 `npm run build:app`
2. 使用 HBuilderX 打开项目
3. 发行为原生APP

## 注意事项

1. **API接口**: 确保后端API服务正常运行
2. **网络配置**: 在真机调试时注意网络IP配置
3. **权限申请**: APP端需要申请相应的设备权限
4. **平台差异**: 不同平台可能存在API差异，需要条件编译

## 更新日志

### v1.0.0
- 完成基础功能开发
- 实现用户认证
- 完成账单管理
- 完成待办事项
- 完成个人中心

## 联系方式

如有问题或建议，请联系开发团队。
