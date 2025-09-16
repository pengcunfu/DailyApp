import todoIndex from "../index.vue";
import todoCreate from "../create.vue";

const route = [
  {
    path: "/todo",
    name: "todo",
    component: todoIndex,
    meta: {
      requiresAuth: true,
      name: "待办事项",
    },
  },
  {
    path: "/todo/index",
    name: "todoIndex",
    component: todoIndex,
    meta: {
      requiresAuth: true,
      name: "待办列表",
    },
  },
  {
    path: "/todo/create",
    name: "todoCreate",
    component: todoCreate,
    meta: {
      requiresAuth: true,
      name: "创建待办",
    },
  }
]

export default route
