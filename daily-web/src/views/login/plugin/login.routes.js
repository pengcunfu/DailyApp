const route = [
  {
    path: "/login",
    name: 'login',
    component: () => import("../index.vue"),
    meta: {
      type: 'frameOut',
    },
  }
]
export default route
