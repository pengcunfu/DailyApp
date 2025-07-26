# 日常应用数据库文档

## 数据库概览

**数据库名称:** `daily_app`  
**字符集:** UTF-8  
**排序规则:** utf8_unicode_ci

## 表结构

### 用户管理

#### `sys_user`
存储用户账户信息。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | 主键，自增 |
| username | varchar(50) | 用户登录名 |
| password | varchar(50) | 用户密码 |
| nickname | varchar(50) | 用户显示名称 |
| sex | int(11) | 性别 |
| create_time | datetime | 账户创建时间 |
| avatar | varchar(50) | 头像URL |
| update_time | datetime | 最后更新时间 |
| delete_time | datetime | 软删除时间戳 |
| status | int(11) | 账户状态 |
| role_id | int(11) | 角色ID引用 |
| is_delete | varchar(255) | 删除标志 |
| is_super | varchar(255) | 超级管理员权限标志 |

#### `sys_user_detail`
扩展用户信息。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | 主键 |

#### `sys_role`
用户角色，用于权限管理。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | 角色ID |
| name | int(11) | 角色名称 |

### 好友管理

#### `app_friend`
存储好友信息。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | 主键，自增 |
| name | varchar(50) | 好友姓名 |
| sex | int(11) | 性别 |
| birth_date | datetime | 出生日期 |
| create_time | datetime | 记录创建时间 |
| update_time | datetime | 最后更新时间 |
| delete_time | datetime | 软删除时间戳 |
| birth_type | int(11) | 生日类型（1=农历，2=公历） |
| status | int(11) | 好友状态 |
| avatar | varchar(50) | 头像URL |
| user_id | int(11) | 所属用户ID |
| phone | varchar(255) | 主要电话号码 |
| qq | varchar(255) | 主要QQ号 |
| wechat | varchar(255) | 主要微信号 |
| email | varchar(255) | 主要邮箱 |
| live_address | varchar(255) | 当前居住地址 |
| address | varchar(255) | 家庭住址 |
| school | varchar(255) | 教育信息 |
| disposition | varchar(255) | 性格特点 |
| remark | varchar(255) | 备注 |
| advantage | varchar(255) | 优点 |
| disadvantage | varchar(255) | 缺点 |

#### `app_friend_phone`
好友的额外电话号码。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | 主键 |
| friend_id | int(11) | 关联到app_friend |
| phone | varchar(255) | 电话号码 |

#### `app_friend_qq`
好友的额外QQ账号。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | 主键 |
| friend_id | int(11) | 关联到app_friend |
| qq | varchar(255) | QQ号码 |
| nickname | varchar(255) | QQ昵称 |
| avatar | varchar(255) | QQ头像URL |

#### `app_friend_wechat`
好友的额外微信账号。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | 主键 |
| friend_id | int(11) | 关联到app_friend |
| wechat | varchar(255) | 微信ID |
| nickname | varchar(255) | 微信昵称 |
| avatar | varchar(255) | 微信头像URL |

#### `app_friend_email`
好友的额外电子邮件地址。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | varchar(255) | ID |
| email | varchar(255) | 电子邮件地址 |
| friend_id | int(11) | 关联到app_friend |

#### `app_friend_detail`
扩展好友信息。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | varchar(255) | ID |

#### `app_friend_analyse`
好友分析数据。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | 主键 |
| friend_id | int(11) | 关联到app_friend |

### 生日管理

#### `app_birth`
存储生日信息。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | 主键，自增 |
| user_id | int(11) | 所属用户ID |
| name | varchar(50) | 人员姓名 |
| sex | int(11) | 性别 |
| birth_date | datetime | 出生日期 |
| birth_type | varchar(255) | 生日类型（1=农历，2=公历） |
| phone | varchar(50) | 电话号码 |
| email | varchar(50) | 电子邮件地址 |
| qq | varchar(255) | QQ号码 |
| wechat | varchar(255) | 微信ID |
| friend_id | varchar(255) | 关联到app_friend |

### 账单管理

#### `app_bill`
存储消费记录。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | ID |
| user_id | int(11) | 所属用户ID |
| create_time | datetime | 记录创建时间 |
| update_time | datetime | 最后更新时间 |
| delete_time | datetime | 软删除时间戳 |
| spending_time | datetime | 消费时间 |
| id_delete | datetime | 删除标志（可能是拼写错误，应为is_delete） |
| amount | decimal(10,2) | 消费金额 |
| order_name | varchar(255) | 购买描述 |

#### `app_bill_category`
账单分类，用于消费分类。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | 主键 |
| name | int(11) | 分类名称 |
| parent_id | int(11) | 父分类ID，用于层级结构 |

### 食物管理

#### `app_food`
食物项目。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | ID |
| user_id | int(11) | 所属用户ID |
| category_id | int(11) | 食物分类ID |
| name | varchar(255) | 食物名称 |

#### `app_food_category`
食物分类。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | 主键 |
| name | varchar(255) | 分类名称 |
| parent_id | int(11) | 父分类ID，用于层级结构 |

#### `app_food_detail`
扩展食物信息。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | 主键 |

#### `app_food_analyse`
食物分析数据。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | 主键 |

#### `app_food_resource`
与食物项目相关的资源（如图像）。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | varchar(255) | ID |
| food_id | int(11) | 关联到app_food |
| resource_id | int(11) | 资源ID |
| resource_type | varchar(255) | 资源类型 |
| resource_url | varchar(255) | 资源URL |

### 笔记管理

#### `app_note`
用户笔记。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | ID |
| user_id | int(11) | 所属用户ID |
| content | int(11) | 笔记内容（应为text类型） |
| create_time | int(11) | 创建时间戳 |
| update_time | int(11) | 更新时间戳 |
| delete_time | int(11) | 删除时间戳 |

#### `app_note_type`
笔记分类。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| ap | varchar(255) | （可能是拼写错误，应为id和name） |

#### `app_note_attr`
笔记属性。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| app | varchar(255) | （可能是不完整的架构） |

### 待办事项管理

#### `app_todo`
待办事项。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | ID |
| user_id | int(11) | 所属用户ID |

#### `app_todo_detail`
扩展待办事项信息。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | 主键 |

### 社交/心情管理

#### `app_mood`
心情/社交帖子。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | 主键，自增 |
| mood_type | int(11) | 心情类型 |
| is_delete | int(11) | 删除标志 |
| create_time | datetime | 创建时间 |
| update_time | datetime | 更新时间 |
| delete_time | datetime | 删除时间 |
| notes | text | 帖子内容 |

#### `app_mood_type`
心情分类。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | ID |
| name | int(11) | 心情类型名称 |

#### `app_mood_images`
附加到心情帖子的图片。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | ID |
| image_url | varchar(300) | 图片URL |

#### `app_mood_comment`
心情帖子的评论。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | ID |
| content | varchar(50) | 评论内容 |
| mood_id | int(11) | 关联到app_mood |
| user_id | int(11) | 评论者用户ID |
| create_time | datetime | 评论时间 |
| parent_user_id | int(11) | 父评论用户ID，用于回复 |

#### `app_mood_love`
心情帖子的点赞。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | ID |
| user_id | int(11) | 点赞的用户 |

### 系统资源

#### `sys_resource`
系统资源（文件、图像等）。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | ID |
| name | int(11) | 资源名称 |
| user_id | int(11) | 所属用户ID |
| create_time | int(11) | 创建时间戳 |
| update_time | int(11) | 更新时间戳 |
| delete_time | int(11) | 删除时间戳 |
| is_delete | int(11) | 删除标志 |
| resource_url | int(11) | 资源URL（应为varchar类型） |

#### `sys_resource_type`
资源类型分类。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | 主键 |
| name | int(11) | 类型名称 |

#### `sys_task`
系统任务。

| 列名 | 类型 | 描述 |
|--------|------|-------------|
| id | int(11) | ID |
| name | int(11) | 任务名称 |
| user_id | int(11) | 所属用户ID |

## 数据库关系

1. **用户与好友**: `sys_user`和`app_friend`之间的一对多关系
2. **用户与账单**: `sys_user`和`app_bill`之间的一对多关系
3. **用户与笔记**: `sys_user`和`app_note`之间的一对多关系
4. **用户与待办事项**: `sys_user`和`app_todo`之间的一对多关系
5. **用户与心情**: `sys_user`和`app_mood`之间的一对多关系
6. **好友与联系方式**: `app_friend`与联系方式表（`app_friend_phone`，`app_friend_qq`等）之间的一对多关系
7. **账单与分类**: `app_bill`和`app_bill_category`之间的多对一关系
8. **食物与分类**: `app_food`和`app_food_category`之间的多对一关系
9. **心情与评论**: `app_mood`和`app_mood_comment`之间的一对多关系
10. **心情与图片**: `app_mood`和`app_mood_images`之间的一对多关系

## 架构问题和建议

1. 一些列的数据类型似乎不正确：
   - `app_note.content`应为TEXT类型而不是INT
   - `sys_resource.resource_url`应为VARCHAR类型而不是INT
   - 多个name字段被定义为INT但应为VARCHAR

2. 一些表有不完整的架构：
   - `app_note_type`和`app_note_attr`有不寻常的列名
   - `app_todo`结构最小化

3. 时间戳处理不一致：
   - 一些表使用DATETIME类型存储时间戳
   - 其他表使用INT类型存储时间戳

4. `app_bill`中的`id_delete`列似乎是拼写错误，应为`is_delete`

5. 多个表缺少适当的主键定义

## 初始数据

数据库包含以下初始数据：
- `sys_user`表中有5个用户
- `app_birth`表中有4个生日记录
- `app_friend`表中有2个好友记录
