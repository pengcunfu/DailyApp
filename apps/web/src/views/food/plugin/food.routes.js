import foodIndex from "../index.vue";
import foodNutrition from "../nutrition.vue";
import foodCategory from "../category.vue";

const route = [
  {
    path: "/food",
    name: "food",
    component: foodIndex,
    meta: {
      requiresAuth: true,
      name: "美食记录",
    },
  },
  {
    path: "/food/index",
    name: "foodIndex",
    component: foodIndex,
    meta: {
      requiresAuth: true,
      name: "美食列表",
    },
  },
  {
    path: "/food/nutrition",
    name: "foodNutrition",
    component: foodNutrition,
    meta: {
      requiresAuth: true,
      name: "营养信息",
    },
  },
  {
    path: "/food/category",
    name: "foodCategory",
    component: foodCategory,
    meta: {
      requiresAuth: true,
      name: "食物分类管理",
    },
  }
]

export default route
