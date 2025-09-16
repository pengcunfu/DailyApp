import appearanceIndex from "../index.vue";

const route = [
  {
    path: "/appearance",
    name: "appearance",
    component: appearanceIndex,
    meta: {
      requiresAuth: true,
      name: "形象管理",
    },
  },
  {
    path: "/appearance/index",
    name: "appearanceIndex",
    component: appearanceIndex,
    meta: {
      requiresAuth: true,
      name: "形象记录",
    },
  }
]

export default route
