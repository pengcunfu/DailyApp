import systemIndex from "../index.vue";
import systemProfile from "../profile.vue";
import systemTheme from "../theme.vue";

const route = [
  {
    path: "/system",
    name: "system",
    component: systemIndex,
    meta: {
      requiresAuth: true,
      name: "系统管理",
    },
  },
  {
    path: "/system/index",
    name: "systemIndex",
    component: systemIndex,
    meta: {
      requiresAuth: true,
      name: "系统设置",
    },
  },
  {
    path: "/system/profile",
    name: "systemProfile",
    component: systemProfile,
    meta: {
      requiresAuth: true,
      name: "个人资料",
    },
  },
  {
    path: "/system/theme",
    name: "systemTheme",
    component: systemTheme,
    meta: {
      requiresAuth: true,
      name: "主题设置",
    },
  }
]

export default route
