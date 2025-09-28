import { get, post, put, del } from '@/utils/request'

// 用户认证相关接口
export const authAPI = {
  // 用户登录
  login: (data) => post('/auth/login', data),
  // 用户注册
  register: (data) => post('/auth/register', data),
  // 获取用户信息
  getProfile: () => get('/auth/profile'),
  // 更新用户信息
  updateProfile: (data) => put('/auth/profile', data),
  // 修改密码
  changePassword: (data) => put('/auth/change-password', data),
  // 退出登录
  logout: () => post('/auth/logout')
}

// 账单相关接口
export const billAPI = {
  // 获取账单列表
  getList: (params) => get('/bills', params),
  // 创建账单
  create: (data) => post('/bills', data),
  // 获取账单详情
  getDetail: (id) => get(`/bills/${id}`),
  // 更新账单
  update: (id, data) => put(`/bills/${id}`, data),
  // 删除账单
  delete: (id) => del(`/bills/${id}`),
  // 获取账单统计
  getStats: (params) => get('/bills/stats', params),
  // 获取账单分类
  getCategories: () => get('/bills/categories'),
  // 创建账单分类
  createCategory: (data) => post('/bills/categories', data),
  // 更新账单分类
  updateCategory: (id, data) => put(`/bills/categories/${id}`, data),
  // 删除账单分类
  deleteCategory: (id) => del(`/bills/categories/${id}`)
}

// 待办事项相关接口
export const todoAPI = {
  // 获取待办列表
  getList: (params) => get('/todos', params),
  // 创建待办
  create: (data) => post('/todos', data),
  // 获取待办详情
  getDetail: (id) => get(`/todos/${id}`),
  // 更新待办
  update: (id, data) => put(`/todos/${id}`, data),
  // 删除待办
  delete: (id) => del(`/todos/${id}`),
  // 获取待办统计
  getStats: () => get('/todos/stats')
}

// 笔记相关接口
export const noteAPI = {
  // 获取笔记列表
  getList: (params) => get('/notes', params),
  // 创建笔记
  create: (data) => post('/notes', data),
  // 获取笔记详情
  getDetail: (id) => get(`/notes/${id}`),
  // 更新笔记
  update: (id, data) => put(`/notes/${id}`, data),
  // 删除笔记
  delete: (id) => del(`/notes/${id}`),
  // 获取笔记统计
  getStats: () => get('/notes/stats'),
  // 获取笔记分类
  getTypes: () => get('/notes/types'),
  // 创建笔记分类
  createType: (data) => post('/notes/types', data),
  // 更新笔记分类
  updateType: (id, data) => put(`/notes/types/${id}`, data),
  // 删除笔记分类
  deleteType: (id) => del(`/notes/types/${id}`)
}

// 美食相关接口
export const foodAPI = {
  // 获取美食列表
  getList: (params) => get('/foods', params),
  // 创建美食记录
  create: (data) => post('/foods', data),
  // 获取美食详情
  getDetail: (id) => get(`/foods/${id}`),
  // 更新美食记录
  update: (id, data) => put(`/foods/${id}`, data),
  // 删除美食记录
  delete: (id) => del(`/foods/${id}`),
  // 获取营养统计
  getNutritionStats: (params) => get('/foods/nutrition-stats', params),
  // 获取美食分类
  getCategories: () => get('/foods/categories'),
  // 创建美食分类
  createCategory: (data) => post('/foods/categories', data),
  // 更新美食分类
  updateCategory: (id, data) => put(`/foods/categories/${id}`, data),
  // 删除美食分类
  deleteCategory: (id) => del(`/foods/categories/${id}`)
}

// 朋友相关接口
export const friendAPI = {
  // 获取朋友列表
  getList: (params) => get('/friends', params),
  // 创建朋友
  create: (data) => post('/friends', data),
  // 获取朋友详情
  getDetail: (id) => get(`/friends/${id}`),
  // 更新朋友信息
  update: (id, data) => put(`/friends/${id}`, data),
  // 删除朋友
  delete: (id) => del(`/friends/${id}`),
  // 获取生日提醒
  getBirthdays: (params) => get('/friends/birthdays', params),
  // 获取朋友统计
  getStats: () => get('/friends/stats')
}

// 形象管理相关接口
export const appearanceAPI = {
  // 获取形象记录列表
  getList: (params) => get('/appearances', params),
  // 创建形象记录
  create: (data) => post('/appearances', data),
  // 获取形象记录详情
  getDetail: (id) => get(`/appearances/${id}`),
  // 更新形象记录
  update: (id, data) => put(`/appearances/${id}`, data),
  // 删除形象记录
  delete: (id) => del(`/appearances/${id}`),
  // 获取形象统计
  getStats: () => get('/appearances/stats')
}

// 日记相关接口
export const diaryAPI = {
  // 获取日记列表
  getList: (params) => get('/diaries', params),
  // 创建日记
  create: (data) => post('/diaries', data),
  // 获取日记详情
  getDetail: (id) => get(`/diaries/${id}`),
  // 更新日记
  update: (id, data) => put(`/diaries/${id}`, data),
  // 删除日记
  delete: (id) => del(`/diaries/${id}`),
  // 获取日记统计
  getStats: () => get('/diaries/stats')
}
