// Daily App API
import service from "./request.js";

// Auth APIs
export const authAPI = {
  // 用户登录
  login(data) {
    return service({
      method: "POST",
      url: "/auth/login",
      data
    });
  },
  
  // 用户注册
  register(data) {
    return service({
      method: "POST",
      url: "/auth/register",
      data
    });
  },
  
  // 获取用户信息
  getProfile() {
    return service({
      method: "GET",
      url: "/auth/profile"
    });
  },
  
  // 更新用户信息
  updateProfile(data) {
    return service({
      method: "PUT",
      url: "/auth/profile",
      data
    });
  },
  
  // 修改密码
  changePassword(data) {
    return service({
      method: "PUT",
      url: "/auth/change-password",
      data
    });
  },
  
  // 登出
  logout() {
    return service({
      method: "POST",
      url: "/auth/logout"
    });
  }
};

// Bills APIs
export const billAPI = {
  // 获取账单列表
  getBills(params) {
    return service({
      method: "GET",
      url: "/bills",
      params
    });
  },
  
  // 获取单个账单
  getBill(id) {
    return service({
      method: "GET",
      url: `/bills/${id}`
    });
  },
  
  // 创建账单
  createBill(data) {
    return service({
      method: "POST",
      url: "/bills",
      data
    });
  },
  
  // 更新账单
  updateBill(id, data) {
    return service({
      method: "PUT",
      url: `/bills/${id}`,
      data
    });
  },
  
  // 删除账单
  deleteBill(id) {
    return service({
      method: "DELETE",
      url: `/bills/${id}`
    });
  },
  
  // 获取消费统计
  getStats(params) {
    return service({
      method: "GET",
      url: "/bills/stats",
      params
    });
  },
  
  // 获取账单分类
  getCategories() {
    return service({
      method: "GET",
      url: "/bills/categories"
    });
  },
  
  // 创建账单分类
  createCategory(data) {
    return service({
      method: "POST",
      url: "/bills/categories",
      data
    });
  }
};

// Todos APIs
export const todoAPI = {
  // 获取待办列表
  getTodos(params) {
    return service({
      method: "GET",
      url: "/todos",
      params
    });
  },
  
  // 获取单个待办
  getTodo(id) {
    return service({
      method: "GET",
      url: `/todos/${id}`
    });
  },
  
  // 创建待办
  createTodo(data) {
    return service({
      method: "POST",
      url: "/todos",
      data
    });
  },
  
  // 更新待办
  updateTodo(id, data) {
    return service({
      method: "PUT",
      url: `/todos/${id}`,
      data
    });
  },
  
  // 切换待办状态
  toggleTodo(id) {
    return service({
      method: "PATCH",
      url: `/todos/${id}/toggle`
    });
  },
  
  // 删除待办
  deleteTodo(id) {
    return service({
      method: "DELETE",
      url: `/todos/${id}`
    });
  },
  
  // 获取待办统计
  getStats() {
    return service({
      method: "GET",
      url: "/todos/stats"
    });
  }
};

// Notes APIs
export const noteAPI = {
  // 获取笔记列表
  getNotes(params) {
    return service({
      method: "GET",
      url: "/notes",
      params
    });
  },
  
  // 获取单个笔记
  getNote(id) {
    return service({
      method: "GET",
      url: `/notes/${id}`
    });
  },
  
  // 创建笔记
  createNote(data) {
    return service({
      method: "POST",
      url: "/notes",
      data
    });
  },
  
  // 更新笔记
  updateNote(id, data) {
    return service({
      method: "PUT",
      url: `/notes/${id}`,
      data
    });
  },
  
  // 删除笔记
  deleteNote(id) {
    return service({
      method: "DELETE",
      url: `/notes/${id}`
    });
  },
  
  // 获取笔记统计
  getStats() {
    return service({
      method: "GET",
      url: "/notes/stats"
    });
  },
  
  // 获取笔记类型
  getTypes() {
    return service({
      method: "GET",
      url: "/notes/types"
    });
  },
  
  // 创建笔记类型
  createType(data) {
    return service({
      method: "POST",
      url: "/notes/types",
      data
    });
  }
};

// Foods APIs
export const foodAPI = {
  // 获取美食记录列表
  getFoods(params) {
    return service({
      method: "GET",
      url: "/foods",
      params
    });
  },
  
  // 获取单个美食记录
  getFood(id) {
    return service({
      method: "GET",
      url: `/foods/${id}`
    });
  },
  
  // 创建美食记录
  createFood(data) {
    return service({
      method: "POST",
      url: "/foods",
      data
    });
  },
  
  // 更新美食记录
  updateFood(id, data) {
    return service({
      method: "PUT",
      url: `/foods/${id}`,
      data
    });
  },
  
  // 删除美食记录
  deleteFood(id) {
    return service({
      method: "DELETE",
      url: `/foods/${id}`
    });
  },
  
  // 获取每日营养
  getDailyNutrition(params) {
    return service({
      method: "GET",
      url: "/foods/daily-nutrition",
      params
    });
  },
  
  // 获取按餐次分类的营养
  getNutritionByMeal(params) {
    return service({
      method: "GET",
      url: "/foods/nutrition-by-meal",
      params
    });
  },
  
  // 获取喜爱的食物
  getFavorites(params) {
    return service({
      method: "GET",
      url: "/foods/favorites",
      params
    });
  },
  
  // 获取美食分类
  getCategories() {
    return service({
      method: "GET",
      url: "/foods/categories"
    });
  },
  
  // 创建美食分类
  createCategory(data) {
    return service({
      method: "POST",
      url: "/foods/categories",
      data
    });
  }
};

// Friends APIs
export const friendAPI = {
  // 获取朋友列表
  getFriends(params) {
    return service({
      method: "GET",
      url: "/friends",
      params
    });
  },
  
  // 获取单个朋友信息
  getFriend(id) {
    return service({
      method: "GET",
      url: `/friends/${id}`
    });
  },
  
  // 创建朋友
  createFriend(data) {
    return service({
      method: "POST",
      url: "/friends",
      data
    });
  },
  
  // 更新朋友信息
  updateFriend(id, data) {
    return service({
      method: "PUT",
      url: `/friends/${id}`,
      data
    });
  },
  
  // 删除朋友
  deleteFriend(id) {
    return service({
      method: "DELETE",
      url: `/friends/${id}`
    });
  },
  
  // 获取即将到来的生日
  getUpcomingBirthdays(params) {
    return service({
      method: "GET",
      url: "/friends/birthdays",
      params
    });
  },
  
  // 获取朋友统计
  getStats() {
    return service({
      method: "GET",
      url: "/friends/stats"
    });
  },
  
  // 更新最后联系时间
  updateLastContact(id) {
    return service({
      method: "PATCH",
      url: `/friends/${id}/contact`
    });
  },
  
  // 添加联系方式
  addContact(id, data) {
    return service({
      method: "POST",
      url: `/friends/${id}/contacts`,
      data
    });
  },
  
  // 删除联系方式
  removeContact(id, contactId) {
    return service({
      method: "DELETE",
      url: `/friends/${id}/contacts/${contactId}`
    });
  }
};

// Legacy compatibility - keep the old function names
export function LoginInfo(query) {
  return authAPI.login(query);
}

export function getMenuList() {
  // 日常助手应用的完整菜单配置
  const menuData = {
    data: {
      menuList: [
        {
          id: 1,
          name: "首页",
          path: "/home",
          icon: "House",
          children: []
        },
        {
          id: 2,
          name: "账单管理",
          path: "/bill",
          icon: "Money",
          children: [
            {
              id: 21,
              name: "账单列表",
              path: "/bill/index",
              icon: "List"
            },
            {
              id: 22,
              name: "消费统计",
              path: "/bill/statistics",
              icon: "TrendCharts"
            },
            {
              id: 23,
              name: "分类管理",
              path: "/bill/category",
              icon: "Grid"
            }
          ]
        },
        {
          id: 3,
          name: "待办事项",
          path: "/todo",
          icon: "Calendar",
          children: [
            {
              id: 31,
              name: "待办列表",
              path: "/todo/index",
              icon: "List"
            },
            {
              id: 32,
              name: "添加待办",
              path: "/todo/create",
              icon: "Plus"
            }
          ]
        },
        {
          id: 4,
          name: "笔记管理",
          path: "/note",
          icon: "Document",
          children: [
            {
              id: 41,
              name: "笔记列表",
              path: "/note/index",
              icon: "List"
            },
            {
              id: 42,
              name: "新建笔记",
              path: "/note/create",
              icon: "EditPen"
            },
            {
              id: 43,
              name: "笔记分类",
              path: "/note/category",
              icon: "Folder"
            }
          ]
        },
        {
          id: 5,
          name: "美食记录",
          path: "/food",
          icon: "Food",
          children: [
            {
              id: 51,
              name: "美食日记",
              path: "/food/index",
              icon: "List"
            },
            {
              id: 52,
              name: "营养统计",
              path: "/food/nutrition",
              icon: "PieChart"
            },
            {
              id: 53,
              name: "美食分类",
              path: "/food/category",
              icon: "Grid"
            }
          ]
        },
        {
          id: 6,
          name: "朋友管理",
          path: "/friend",
          icon: "User",
          children: [
            {
              id: 61,
              name: "朋友列表",
              path: "/friend/index",
              icon: "List"
            },
            {
              id: 62,
              name: "添加朋友",
              path: "/friend/create",
              icon: "UserFilled"
            },
            {
              id: 63,
              name: "生日提醒",
              path: "/friend/birthday",
              icon: "Present"
            }
          ]
        },
        {
          id: 7,
          name: "形象管理",
          path: "/appearance",
          icon: "Camera",
          children: [
            {
              id: 71,
              name: "形象记录",
              path: "/appearance"
            }
          ]
        },
        {
          id: 9,
          name: "日记管理",
          path: "/diary",
          icon: "Document",
          children: [
            {
              id: 91,
              name: "我的日记",
              path: "/diary"
            }
          ]
        },
        {
          id: 8,
          name: "系统管理",
          path: "/system",
          icon: "Setting",
          children: [
            {
              id: 81,
              name: "个人设置",
              path: "/system/profile",
              icon: "User"
            },
            {
              id: 82,
              name: "主题设置",
              path: "/system/theme",
              icon: "Brush"
            }
          ]
        }
      ]
    }
  };
  
  return Promise.resolve(menuData);
}

export function getUserList() {
  return Promise.resolve({ data: [] });
}

export function addUserList(query) {
  return authAPI.register(query);
}

export function listUpdate(query) {
  return authAPI.updateProfile(query);
}

export function homeList() {
  return Promise.resolve({ data: [] });
}

export function noticeLists() {
  return Promise.resolve({ data: [] });
}

// 形象管理 API
export const appearanceAPI = {
  // 获取形象记录列表
  getList(params) {
    return service({
      method: "GET",
      url: "/appearances",
      params
    });
  },
  
  // 获取单个形象记录
  getById(id) {
    return service({
      method: "GET",
      url: `/appearances/${id}`
    });
  },
  
  // 创建形象记录
  create(data) {
    return service({
      method: "POST",
      url: "/appearances",
      data
    });
  },
  
  // 更新形象记录
  update(id, data) {
    return service({
      method: "PUT",
      url: `/appearances/${id}`,
      data
    });
  },
  
  // 删除形象记录
  delete(id) {
    return service({
      method: "DELETE",
      url: `/appearances/${id}`
    });
  },
  
  // 获取形象统计数据
  getStats() {
    return service({
      method: "GET",
      url: "/appearances/stats"
    });
  }
};

// 日记管理 API
export const diaryAPI = {
  // 获取日记列表
  getList(params) {
    return service({
      method: "GET",
      url: "/diaries",
      params
    });
  },
  
  // 获取单个日记
  getById(id) {
    return service({
      method: "GET",
      url: `/diaries/${id}`
    });
  },
  
  // 创建日记
  create(data) {
    return service({
      method: "POST",
      url: "/diaries",
      data
    });
  },
  
  // 更新日记
  update(id, data) {
    return service({
      method: "PUT",
      url: `/diaries/${id}`,
      data
    });
  },
  
  // 删除日记
  delete(id) {
    return service({
      method: "DELETE",
      url: `/diaries/${id}`
    });
  },
  
  // 获取日记统计数据
  getStats() {
    return service({
      method: "GET",
      url: "/diaries/stats"
    });
  }
};