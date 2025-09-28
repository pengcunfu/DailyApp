export default [
  {
    path: "/diary",
    name: "DiaryManagement",
    component: () => import("../index.vue"),
    meta: {
      title: "日记管理",
      icon: "Document",
      roles: ["admin", "user"]
    }
  }
];