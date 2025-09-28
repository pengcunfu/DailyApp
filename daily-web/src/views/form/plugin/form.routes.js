const route = [
  {
    path: "/baseForm",
    name: "baseForm",
    component: () => import("../baseForm.vue"),
    meta: {
      requiresAuth: true, //有一些页面是否登录才能进去
      name: "基础表单",
    },
  },
  {
    path: "/stepFrom",
    name: "stepFrom",
    component: () => import("../stepFrom.vue"),
    meta: {
      requiresAuth: true, //有一些页面是否登录才能进去
      name: "分页表单",
    },
  },
  {
    path: "/advancedForm",
    name: "advancedForm",
    component: () => import("../advancedForm.vue"),
    meta: {
      requiresAuth: true, //有一些页面是否登录才能进去
      name: "高级表单",
    },
  }
]
export default route
