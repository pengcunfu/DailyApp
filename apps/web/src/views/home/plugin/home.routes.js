import homeIndex from "../index.vue";

const route = [
  {
    path: "/home",
    name: "home",
    component: homeIndex,
    meta: {
      requiresAuth: true,
      name: "首页",
    },
  }
]

export default route