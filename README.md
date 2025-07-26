# 日常助手 App

本项目是一个多端日常生活管理助手，包含移动端（Expo）、Web端（Next.js）和后端（Flask），帮助用户高效管理日常事务，如账单、日记、饮食、待办、笔记和朋友信息等。


1、移除敏感信息
2、

---

## 目录结构

```
daily-app/
├── apps/
│   ├── mobile/   # 移动端（Expo，React Native）
│   ├── web/      # Web端（Next.js）
│   └── server/   # 后端（Flask）
├── configs/      # 配置文件
├── database/     # 数据库相关
├── scripts/      # 辅助脚本
└── package.json  # 项目管理
```

---

## 各端功能与技术栈

### 移动端（apps/mobile）
- **技术栈**：Expo、React Native、TypeScript
- **主要功能**：
  - 用户注册/登录
  - 账单、日记、饮食、待办、笔记、朋友管理
  - 与后端 API 通信

### Web端（apps/web）
- **技术栈**：Next.js、React、TypeScript
- **主要功能**：
  - 用户注册/登录
  - 账单、日记、饮食、待办、笔记、朋友管理
  - 响应式界面，适配多端
  - 与后端 API 通信

### 后端（apps/server）
- **技术栈**：Flask、SQLAlchemy、Flask-Login、Flask-WTF、SQLite
- **主要功能**：
  - 用户、账单、日记、饮食、待办、笔记、朋友等数据管理
  - RESTful API 提供给前端/移动端
  - 数据统计与分析

---

## 快速开始

### 1. 克隆项目
```bash
git clone <你的仓库地址>
cd daily-app
```

### 2. 安装依赖

#### 移动端（Expo）
```bash
cd apps/mobile
npm install
```

#### Web端（Next.js）
```bash
cd apps/web
npm install
```

#### 后端（Flask）
```bash
cd apps/server
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
pip install -r requirements.txt
```

### 3. 启动项目

#### 启动移动端
```bash
cd apps/mobile
npm start
```

#### 启动 Web 端
```bash
cd apps/web
npm run dev
```

#### 启动后端
```bash
cd apps/server
python app.py
```

"# daily-app" 
