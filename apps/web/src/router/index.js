import cookies from '@utils/cookies'
import { getToken } from '@utils/cookies'
import router from "./router.js";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import store from "../store";

NProgress.configure({
  ease: "ease",
  speed: 500,
});

const writeNames = ["/login"];

router.beforeEach((to, from, next) => {
  NProgress.start();
  
  // 使用新的 token 管理方式
  const token = getToken();
  
  if (token) {
    // 已登录状态
    if (to.path === "/login") {
      next("/");
    } else {
      next();
    }
  } else {
    // 未登录状态
    if (writeNames.includes(to.path)) {
      next();
    } else {
      next("/login");
    }
  }
});

router.afterEach((transition) => {
  NProgress.done();
});

export default router;
