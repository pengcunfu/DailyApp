import {
  createStore
} from "vuex";
import user from "./modules/users";
import tabs from './modules/tabs'
import getters from "./getters";
import createPersistedState from "vuex-persistedstate";

const files = import.meta.globEager("@/views/**/plugin/**.store.js")

const modules = {}

for (const key in files) {
  modules[key.match(/plugin\/(\S*)\.store\.js$/)[1]] = files[key].default
}

export default createStore({
  getters,
  modules: {
    user,
    tabs,
    ...modules
  },
  plugins: [
    // 默认储存在localstorage
    createPersistedState({
      // 本地储存名
      key: "user",
      // 指定模块
      paths: ["user"],
    }),
  ],
});