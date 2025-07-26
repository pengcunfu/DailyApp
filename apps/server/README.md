# 熔岩日常助手 (Daily App)

一个基于 Flask 的日常生活管理助手，帮助用户管理日常生活中的各种事务，包括账单管理、日记记录、饮食管理等功能。

## 功能特性

### 1. 用户管理
- 用户注册和登录
- 个人信息管理
- 密码修改和重置

### 2. 账单管理
- 收入和支出记录
- 账单分类管理
- 收支统计和分析
- 按日期、类别筛选
- 数据可视化展示

### 3. 日记管理
- 日记撰写和编辑
- 日记分类和标签
- 日记搜索和归档
- 心情记录

### 4. 饮食管理
- 饮食记录
- 营养分析
- 饮食建议
- 食谱管理

### 5. 待办事项
- 任务创建和管理
- 任务优先级设置
- 任务完成状态跟踪
- 任务提醒

### 6. 笔记管理
- 笔记创建和编辑
- 笔记分类
- 笔记搜索
- Markdown 支持

### 7. 朋友管理
- 朋友信息记录
- 生日提醒
- 联系方式管理
- 关系维护记录

## 技术栈

### 后端
- Python 3.8+
- Flask 2.0+
- SQLAlchemy
- Flask-Login
- Flask-WTF

### 前端
- Layui
- jQuery
- HTML5/CSS3
- JavaScript

### 数据库
- SQLite

## 安装说明

1. 克隆项目
```bash
git clone https://github.com/yourusername/daily-app.git
cd daily-app/daily-app-flask
```

2. 创建虚拟环境
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. 安装依赖
```bash
pip install -r requirements.txt
```

4. 初始化数据库
```bash
flask db init
flask db migrate
flask db upgrade
```

5. 运行应用
```bash
python app.py
```

## 项目结构

```
daily-app-flask/
├── app.py              # 应用入口
├── requirements.txt    # 项目依赖
├── models/            # 数据模型
│   ├── user.py
│   ├── bill.py
│   ├── diary.py
│   ├── diet.py
│   └── ...
├── controllers/       # 控制器
│   ├── auth.py
│   ├── bill.py
│   ├── diary.py
│   ├── diet.py
│   └── ...
├── forms/            # 表单
│   ├── auth.py
│   ├── bill.py
│   ├── diary.py
│   └── ...
├── templates/        # 模板
│   ├── base.html
│   ├── auth/
│   ├── bill/
│   ├── diary/
│   └── ...
└── static/          # 静态文件
    ├── css/
    ├── js/
    └── uploads/
```

## 使用说明

### 1. 用户注册和登录
- 访问首页，点击"注册"按钮创建新账号
- 填写用户名、邮箱和密码
- 使用注册的账号登录系统

### 2. 账单管理
- 在导航栏点击"账单管理"
- 点击"添加账单"记录新的收支
- 使用筛选功能查看特定时间段的账单
- 查看统计卡片了解收支概况

### 3. 日记管理
- 在导航栏点击"日记"
- 点击"写日记"创建新的日记
- 使用标签和分类组织日记
- 通过搜索功能查找历史日记

### 4. 饮食管理
- 在导航栏点击"饮食"
- 记录每日饮食情况
- 查看营养分析报告
- 获取个性化饮食建议

### 5. 待办事项
- 在导航栏点击"待办"
- 创建新的待办任务
- 设置任务优先级和截止日期
- 标记任务完成状态

## API 文档

### 账单管理 API

#### 获取账单列表
```
GET /api/bills
参数：
- page: 页码
- limit: 每页数量
- start_date: 开始日期
- end_date: 结束日期
- category: 类别
- type: 类型（income/expense）
```

#### 创建账单
```
POST /api/bills
参数：
- amount: 金额
- category: 类别
- description: 描述
- date: 日期
- type: 类型
```

#### 更新账单
```
PUT /api/bills/<id>
参数：
- amount: 金额
- category: 类别
- description: 描述
- date: 日期
- type: 类型
```

#### 删除账单
```
DELETE /api/bills/<id>
```

#### 获取账单统计
```
GET /api/bills/statistics
参数：
- days: 统计天数
```

## 开发指南

### 添加新功能
1. 在 `models` 目录下创建数据模型
2. 在 `forms` 目录下创建表单类
3. 在 `controllers` 目录下创建控制器
4. 在 `templates` 目录下创建模板文件
5. 在 `app.py` 中注册新的蓝图

### 代码规范
- 遵循 PEP 8 编码规范
- 使用有意义的变量和函数名
- 添加适当的注释
- 编写单元测试

### 数据库迁移
```bash
flask db migrate -m "迁移说明"
flask db upgrade
```

## 部署说明

### 开发环境
```bash
python app.py
```

### 生产环境
1. 配置生产环境变量
2. 使用 Gunicorn 作为 WSGI 服务器
3. 配置 Nginx 作为反向代理
4. 设置 SSL 证书
5. 配置数据库备份

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

- 作者：Your Name
- 邮箱：your.email@example.com
- GitHub：https://github.com/yourusername "# daily-app-flask" 
