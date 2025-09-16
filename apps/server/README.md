# Daily App Express Server

Express.js + MongoDB 后端服务，为日常助手应用提供 RESTful API。

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
创建 `.env` 文件：
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/daily_app
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8080
```

### 3. 初始化数据
```bash
npm run seed
```

### 4. 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## API 接口

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息
- `POST /api/auth/logout` - 用户登出

### 账单管理
- `GET /api/bills` - 获取账单列表
- `POST /api/bills` - 创建账单
- `GET /api/bills/:id` - 获取单个账单
- `PUT /api/bills/:id` - 更新账单
- `DELETE /api/bills/:id` - 删除账单
- `GET /api/bills/stats` - 获取消费统计

### 待办事项
- `GET /api/todos` - 获取待办列表
- `POST /api/todos` - 创建待办
- `PATCH /api/todos/:id/toggle` - 切换完成状态

### 笔记管理
- `GET /api/notes` - 获取笔记列表
- `POST /api/notes` - 创建笔记
- `GET /api/notes/types` - 获取笔记类型

### 美食记录
- `GET /api/foods` - 获取美食记录
- `POST /api/foods` - 创建美食记录
- `GET /api/foods/daily-nutrition` - 获取每日营养

### 朋友管理
- `GET /api/friends` - 获取朋友列表
- `POST /api/friends` - 添加朋友
- `GET /api/friends/birthdays` - 获取生日提醒

## 数据模型

### User（用户）
- username：用户名
- email：邮箱
- password：密码（加密）
- profile：用户资料

### Bill（账单）
- amount：金额
- categoryId：分类ID
- orderName：订单名称
- spendingTime：消费时间

### Todo（待办）
- title：标题
- content：内容
- priority：优先级（0-2）
- status：状态（0未完成，1已完成）

### Note（笔记）
- title：标题
- content：内容
- typeId：类型ID
- tags：标签

### Food（美食）
- name：食物名称
- mealType：餐次类型
- nutrition：营养信息
- rating：评分

### Friend（朋友）
- name：姓名
- relationship：关系类型
- contacts：联系方式
- birthDate：生日

## 项目结构

```
server_express/
├── config/          # 配置文件
│   ├── database.js  # 数据库连接
│   └── jwt.js      # JWT 配置
├── controllers/     # 控制器
├── middleware/      # 中间件
├── models/         # 数据模型
├── routes/         # 路由定义
├── scripts/        # 脚本文件
└── app.js         # 应用入口
```

## 开发指南

### 添加新模块

1. 创建模型文件 `models/NewModel.js`
2. 创建控制器 `controllers/newController.js`
3. 创建路由 `routes/new.js`
4. 在 `routes/index.js` 中注册路由

### 安全特性

- JWT Token 认证
- 密码 bcrypt 加密
- 请求速率限制
- CORS 跨域保护
- 数据验证

### 测试

```bash
npm test
```

## 环境部署

### Docker 部署

```bash
docker build -t daily-app-server .
docker run -p 3000:3000 daily-app-server
```

### 生产环境

1. 设置 `NODE_ENV=production`
2. 配置强密码的 `JWT_SECRET`
3. 设置 MongoDB 连接
4. 配置 HTTPS
5. 设置反向代理