# 日常应用数据库文档 v2

## 数据库概览

**数据库名称:** `daily_app`  
**ORM框架:** SQLAlchemy (Flask-SQLAlchemy)  
**字符集:** UTF-8  

## 表结构

### 用户管理

#### `sys_user` (User)
存储用户账户信息。

| 列名 | 类型 | 约束 | 描述 |
|--------|------|-------------|-------------|
| id | Integer | 主键 | 用户ID |
| username | String(80) | 非空，唯一 | 用户登录名 |
| email | String(120) | 非空，唯一 | 用户邮箱 |
| password_hash | String(128) | | 加密后的密码 |
| created_at | DateTime | 默认当前时间 | 账户创建时间 |
| updated_at | DateTime | 默认当前时间，自动更新 | 最后更新时间 |
| is_active | Boolean | 默认True | 账户是否激活 |

**关联关系:**
- 一对一关系：`UserProfile`（用户详细信息）
- 一对多关系：`Bill`（账单）、`Friend`（好友）、`Note`（笔记）、`Todo`（待办事项）

#### `sys_user_detail` (UserProfile)
用户详细信息。

| 列名 | 类型 | 约束 | 描述 |
|--------|------|-------------|-------------|
| id | Integer | 主键 | 记录ID |
| user_id | Integer | 外键(sys_user.id)，非空 | 关联用户ID |
| avatar | String(200) | | 头像URL |
| phone | String(20) | | 电话号码 |
| address | String(200) | | 地址 |
| bio | Text | | 个人简介 |
| created_at | DateTime | 默认当前时间 | 创建时间 |
| updated_at | DateTime | 默认当前时间，自动更新 | 更新时间 |

### 好友管理

#### `app_friend` (Friend)
存储好友信息。

| 列名 | 类型 | 约束 | 描述 |
|--------|------|-------------|-------------|
| id | Integer | 主键 | 好友ID |
| user_id | Integer | 外键(sys_user.id)，非空 | 所属用户ID |
| name | String(50) | 非空 | 好友姓名 |
| sex | Integer | | 性别（1:男，2:女） |
| birth_date | DateTime | | 出生日期 |
| birth_type | Integer | | 生日类型（1:农历，2:公历） |
| avatar | String(200) | | 头像URL |
| phone | String(20) | | 主要电话号码 |
| qq | String(20) | | 主要QQ号 |
| wechat | String(50) | | 主要微信号 |
| email | String(100) | | 主要邮箱 |
| live_address | String(200) | | 当前居住地址 |
| address | String(200) | | 家庭住址 |
| school | String(100) | | 教育信息 |
| disposition | String(200) | | 性格特点 |
| remark | Text | | 备注 |
| advantage | Text | | 优点 |
| disadvantage | Text | | 缺点 |
| created_at | DateTime | 默认当前时间 | 创建时间 |
| updated_at | DateTime | 默认当前时间，自动更新 | 更新时间 |
| is_deleted | Boolean | 默认False | 是否删除 |

**关联关系:**
- 一对多关系：`FriendPhone`（电话）、`FriendQQ`（QQ）、`FriendWechat`（微信）、`FriendEmail`（邮箱）

#### `app_friend_phone` (FriendPhone)
好友的额外电话号码。

| 列名 | 类型 | 约束 | 描述 |
|--------|------|-------------|-------------|
| id | Integer | 主键 | 记录ID |
| friend_id | Integer | 外键(app_friend.id)，非空 | 关联好友ID |
| phone | String(20) | 非空 | 电话号码 |

#### `app_friend_qq` (FriendQQ)
好友的额外QQ账号。

| 列名 | 类型 | 约束 | 描述 |
|--------|------|-------------|-------------|
| id | Integer | 主键 | 记录ID |
| friend_id | Integer | 外键(app_friend.id)，非空 | 关联好友ID |
| qq | String(20) | 非空 | QQ号码 |
| nickname | String(50) | | QQ昵称 |
| avatar | String(200) | | QQ头像URL |

#### `app_friend_wechat` (FriendWechat)
好友的额外微信账号。

| 列名 | 类型 | 约束 | 描述 |
|--------|------|-------------|-------------|
| id | Integer | 主键 | 记录ID |
| friend_id | Integer | 外键(app_friend.id)，非空 | 关联好友ID |
| wechat | String(50) | 非空 | 微信ID |
| nickname | String(50) | | 微信昵称 |
| avatar | String(200) | | 微信头像URL |

#### `app_friend_email` (FriendEmail)
好友的额外电子邮件地址。

| 列名 | 类型 | 约束 | 描述 |
|--------|------|-------------|-------------|
| id | Integer | 主键 | 记录ID |
| friend_id | Integer | 外键(app_friend.id)，非空 | 关联好友ID |
| email | String(100) | 非空 | 电子邮件地址 |

### 笔记管理

#### `app_note` (Note)
用户笔记。

| 列名 | 类型 | 约束 | 描述 |
|--------|------|-------------|-------------|
| id | Integer | 主键 | 笔记ID |
| user_id | Integer | 外键(sys_user.id)，非空 | 所属用户ID |
| type_id | Integer | 外键(app_note_type.id) | 笔记类型ID |
| title | String(200) | 非空 | 笔记标题 |
| content | Text | | 笔记内容 |
| created_at | DateTime | 默认当前时间 | 创建时间 |
| updated_at | DateTime | 默认当前时间，自动更新 | 更新时间 |
| is_deleted | Boolean | 默认False | 是否删除 |

**关联关系:**
- 多对一关系：`NoteType`（笔记类型）
- 一对多关系：`NoteAttr`（笔记属性）

#### `app_note_type` (NoteType)
笔记类型。

| 列名 | 类型 | 约束 | 描述 |
|--------|------|-------------|-------------|
| id | Integer | 主键 | 类型ID |
| name | String(50) | 非空 | 类型名称 |
| created_at | DateTime | 默认当前时间 | 创建时间 |

#### `app_note_attr` (NoteAttr)
笔记属性，用于存储笔记的额外信息。

| 列名 | 类型 | 约束 | 描述 |
|--------|------|-------------|-------------|
| id | Integer | 主键 | 属性ID |
| note_id | Integer | 外键(app_note.id)，非空 | 关联笔记ID |
| key | String(50) | 非空 | 属性键 |
| value | Text | | 属性值 |

### 待办事项管理

#### `app_todo` (Todo)
待办事项。

| 列名 | 类型 | 约束 | 描述 |
|--------|------|-------------|-------------|
| id | Integer | 主键 | 待办事项ID |
| user_id | Integer | 外键(sys_user.id)，非空 | 所属用户ID |
| title | String(200) | 非空 | 待办事项标题 |
| content | Text | | 待办事项内容 |
| start_time | DateTime | | 开始时间 |
| end_time | DateTime | | 结束时间 |
| status | Integer | 默认0 | 状态（0:未完成，1:已完成） |
| priority | Integer | 默认0 | 优先级（0:普通，1:重要，2:紧急） |
| created_at | DateTime | 默认当前时间 | 创建时间 |
| updated_at | DateTime | 默认当前时间，自动更新 | 更新时间 |
| is_deleted | Boolean | 默认False | 是否删除 |

**关联关系:**
- 一对多关系：`TodoDetail`（待办事项详情）

#### `app_todo_detail` (TodoDetail)
待办事项子任务。

| 列名 | 类型 | 约束 | 描述 |
|--------|------|-------------|-------------|
| id | Integer | 主键 | 子任务ID |
| todo_id | Integer | 外键(app_todo.id)，非空 | 关联待办事项ID |
| content | Text | 非空 | 子任务内容 |
| status | Integer | 默认0 | 状态（0:未完成，1:已完成） |
| created_at | DateTime | 默认当前时间 | 创建时间 |
| updated_at | DateTime | 默认当前时间，自动更新 | 更新时间 |

### 账单管理

#### `app_bill_category` (BillCategory)
账单分类。

| 列名 | 类型 | 约束 | 描述 |
|--------|------|-------------|-------------|
| id | Integer | 主键 | 分类ID |
| name | String(50) | 非空 | 分类名称 |
| parent_id | Integer | 外键(app_bill_category.id) | 父分类ID |
| created_at | DateTime | 默认当前时间 | 创建时间 |

**关联关系:**
- 自关联：父分类-子分类关系
- 一对多关系：`Bill`（账单）

#### `app_bill` (Bill)
账单记录。

| 列名 | 类型 | 约束 | 描述 |
|--------|------|-------------|-------------|
| id | Integer | 主键 | 账单ID |
| user_id | Integer | 外键(sys_user.id)，非空 | 所属用户ID |
| category_id | Integer | 外键(app_bill_category.id)，非空 | 账单分类ID |
| amount | Float | 非空 | 金额 |
| order_name | String(200) | | 订单名称/描述 |
| spending_time | DateTime | 非空，默认当前时间 | 消费时间 |
| created_at | DateTime | 非空，默认当前时间 | 创建时间 |
| updated_at | DateTime | 非空，默认当前时间，自动更新 | 更新时间 |
| is_deleted | Boolean | 默认False | 是否删除 |

**关联关系:**
- 多对一关系：`BillCategory`（账单分类）

## 数据库关系图

```
sys_user (用户)
  ├── sys_user_detail (用户详情) [一对一]
  ├── app_friend (好友) [一对多]
  │     ├── app_friend_phone (好友电话) [一对多]
  │     ├── app_friend_qq (好友QQ) [一对多]
  │     ├── app_friend_wechat (好友微信) [一对多]
  │     └── app_friend_email (好友邮箱) [一对多]
  ├── app_note (笔记) [一对多]
  │     ├── app_note_type (笔记类型) [多对一]
  │     └── app_note_attr (笔记属性) [一对多]
  ├── app_todo (待办事项) [一对多]
  │     └── app_todo_detail (待办事项详情) [一对多]
  └── app_bill (账单) [一对多]
        └── app_bill_category (账单分类) [多对一]
            └── app_bill_category (子分类) [一对多]
```

## 数据库设计特点

1. **用户中心设计**：以用户(`sys_user`)为核心，关联各种功能模块
2. **软删除机制**：大多数表使用`is_deleted`字段实现软删除，而不是物理删除数据
3. **时间跟踪**：几乎所有表都包含`created_at`和`updated_at`字段，跟踪记录的创建和更新时间
4. **层级结构**：账单分类(`app_bill_category`)使用自关联实现层级分类结构
5. **扩展属性**：笔记使用属性表(`app_note_attr`)存储键值对形式的扩展属性
6. **多联系方式**：好友信息支持存储多个联系方式（电话、QQ、微信、邮箱）
7. **子任务支持**：待办事项支持子任务管理

## 与v1版本的主要区别

1. **数据类型更准确**：修正了v1版本中的数据类型问题（如笔记内容从INT改为TEXT）
2. **字段更完整**：增加了多个在v1版本中缺失的字段（如笔记标题、待办事项优先级等）
3. **关系更清晰**：明确定义了各表之间的关联关系
4. **字段约束更明确**：添加了非空、唯一等约束条件
5. **新增字段**：增加了许多在v1版本中不存在的字段（如用户邮箱、待办事项时间等）
6. **规范化命名**：统一使用created_at、updated_at等命名规范
