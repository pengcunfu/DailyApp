import noteIndex from "../index.vue";
import noteCreate from "../create.vue";
import noteCategory from "../category.vue";

const route = [
  {
    path: "/note",
    name: "note",
    component: noteIndex,
    meta: {
      requiresAuth: true,
      name: "笔记管理",
    },
  },
  {
    path: "/note/index",
    name: "noteIndex",
    component: noteIndex,
    meta: {
      requiresAuth: true,
      name: "笔记列表",
    },
  },
  {
    path: "/note/create",
    name: "noteCreate",
    component: noteCreate,
    meta: {
      requiresAuth: true,
      name: "创建笔记",
    },
  },
  {
    path: "/note/category",
    name: "noteCategory",
    component: noteCategory,
    meta: {
      requiresAuth: true,
      name: "笔记分类管理",
    },
  }
]

export default route
