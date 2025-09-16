import {
  createRouter,
  createWebHistory
} from "vue-router";
import Layout from "../layout/index.vue";

const files = import.meta.globEager("@/views/**/plugin/**.routes.js")
let AllPics = Object.values(files).map((v) => v.default);
const addRoutes = []
AllPics.forEach(e => {
  if (window.top !== window) { // 如果不是内嵌在别的项目下面，就用自己框架的layout
    e.forEach(ele => { ele.meta.type = 'frameOut' })
  }
  e && addRoutes.push(...e)
})
/**
 * 在主框架内显示
 */
const frameIn = [
  {
    path: '/',
    component: Layout,
    name: "container",
    redirect: "/home",
    meta: {
      requiresAuth: true, //有一些页面是否登录才能进去
      name: "首页",
    },
    children: [
      ...addRoutes.filter(e => e.meta?.type !== 'frameOut')
    ],
  }
]


/**
 * 在主框架之外显示
 */
const frameOut = [
  ...addRoutes.filter(e => e.meta?.type === 'frameOut')
]

let routes = [
  ...frameIn,
  ...frameOut
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;