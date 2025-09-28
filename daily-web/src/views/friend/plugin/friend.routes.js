import friendIndex from "../index.vue";
import friendCreate from "../create.vue";
import friendBirthday from "../birthday.vue";

const route = [
  {
    path: "/friend",
    name: "friend",
    component: friendIndex,
    meta: {
      requiresAuth: true,
      name: "朋友管理",
    },
  },
  {
    path: "/friend/index",
    name: "friendIndex",
    component: friendIndex,
    meta: {
      requiresAuth: true,
      name: "朋友列表",
    },
  },
  {
    path: "/friend/create",
    name: "friendCreate",
    component: friendCreate,
    meta: {
      requiresAuth: true,
      name: "添加朋友",
    },
  },
  {
    path: "/friend/birthday",
    name: "friendBirthday",
    component: friendBirthday,
    meta: {
      requiresAuth: true,
      name: "生日管理",
    },
  }
]

export default route
