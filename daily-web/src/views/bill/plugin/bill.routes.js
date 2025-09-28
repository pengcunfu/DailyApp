import billIndex from "../index.vue";
import billStatistics from "../statistics.vue";
import billCategory from "../category.vue";

const route = [
  {
    path: "/bill",
    name: "bill",
    component: billIndex,
    meta: {
      requiresAuth: true,
      name: "账单管理",
    },
  },
  {
    path: "/bill/index",
    name: "billIndex",
    component: billIndex,
    meta: {
      requiresAuth: true,
      name: "账单列表",
    },
  },
  {
    path: "/bill/statistics",
    name: "billStatistics", 
    component: billStatistics,
    meta: {
      requiresAuth: true,
      name: "消费统计",
    },
  },
  {
    path: "/bill/category",
    name: "billCategory",
    component: billCategory,
    meta: {
      requiresAuth: true,
      name: "账单分类管理",
    },
  }
]

export default route
