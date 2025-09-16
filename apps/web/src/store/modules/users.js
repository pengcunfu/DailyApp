import {
  authAPI
} from "../../api/apis.js";
import router from "../../router/router.js";
import {
  mix
} from "../../utils/color.js";
import {
  ElMessage
} from "element-plus";
import { setToken, getToken, removeToken } from "../../utils/cookies.js";

export default {
  namespaced: true,
  state: {
    UserInfo: JSON.parse(localStorage.getItem("UserInfo") || "{}"),
    token: getToken() || "",
    isCollapse: true,
    themeConfig: {
      primary: "#4060c7",
      tabColor: "#FFFFFF",
      footColor: "#606266",
      backgroundColor: "#FFFFFF",
      textColor: "#00000099",
      istags: true,
    },
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
      if (token) {
        setToken(token);
      } else {
        removeToken();
      }
    },
    SET_USER_INFO(state, userinfo) {
      state.UserInfo = userinfo;
      localStorage.setItem("UserInfo", JSON.stringify(userinfo));
    },
    CLEAR_USER_DATA(state) {
      state.UserInfo = {};
      state.token = "";
      removeToken();
      localStorage.removeItem("UserInfo");
    },
    SetIsCollapse(state, isCollapse) {
      state.isCollapse = isCollapse;
    },
    setThemeConfig(state, primary) {
      state.themeConfig.primary = primary;
    },
    setThemeConfigTbaColor(state, primary) {
      state.themeConfig.tabColor = primary;
      if (primary == "#FFFFFF") {
        state.themeConfig.footColor = "#606266";
      } else {
        state.themeConfig.footColor = "#ffffff";
      }
    },
    setThemeConfigMenuColor(state, primary) {
      if (primary) {
        state.themeConfig.backgroundColor = "#FFFFFF";
        state.themeConfig.textColor = "#00000099";
      } else {
        state.themeConfig.backgroundColor = "#1d2129";
        state.themeConfig.textColor = "#bdbdc0";
      }
    },
    setThemeConfigchangeTags(state, primary) {
      if (primary) {
        state.themeConfig.istags = true
      } else {
        state.themeConfig.istags = false
      }
    },
    // Legacy mutations for backward compatibility
    setToken(state, token) {
      this.commit('user/SET_TOKEN', token);
    },
    setUserInfo(state, userinfo) {
      this.commit('user/SET_USER_INFO', userinfo);
    },
  },

  actions: {
    // New login action using the new API
    async login({ commit }, userInfo) {
      try {
        const response = await authAPI.login(userInfo);
        
        if (response.success) {
          commit("SET_TOKEN", response.data.token);
          commit("SET_USER_INFO", response.data.user);
          
          ElMessage({
            message: "登录成功",
            type: "success",
          });
          
          return response;
        } else {
          throw new Error(response.message || "登录失败");
        }
      } catch (error) {
        ElMessage({
          message: error.message || "登录失败",
          type: "error",
        });
        throw error;
      }
    },

    // Get user profile
    async getUserProfile({ commit }) {
      try {
        const response = await authAPI.getProfile();
        if (response.success) {
          commit("SET_USER_INFO", response.data.user);
          return response.data.user;
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        // 如果token失效，清除用户数据
        if (error.response && error.response.status === 401) {
          commit("CLEAR_USER_DATA");
          router.push("/login");
        }
        throw error;
      }
    },

    // Logout action
    async logout({ commit }) {
      try {
        await authAPI.logout();
      } catch (error) {
        console.error("登出API调用失败:", error);
      } finally {
        commit("CLEAR_USER_DATA");
        router.push("/login");
        ElMessage({
          message: "已退出登录",
          type: "success",
        });
      }
    },

    // Update user profile
    async updateProfile({ commit }, profileData) {
      try {
        const response = await authAPI.updateProfile(profileData);
        if (response.success) {
          commit("SET_USER_INFO", response.data.user);
          ElMessage({
            message: "更新成功",
            type: "success",
          });
          return response.data.user;
        }
      } catch (error) {
        ElMessage({
          message: error.message || "更新失败",
          type: "error",
        });
        throw error;
      }
    },

    changeIsCollapse({
      commit
    }, str) {
      console.log(str);
      commit("SetIsCollapse", str);
    },

    changeThem({
      commit
    }, str) {
      commit("setThemeConfig", str);
      const pre = "--el-color-primary";
      // 白色混合色
      const mixWhite = "#ffffff";
      // 黑色混合色
      const mixBlack = "#000000";
      const el = document.documentElement;
      el.style.setProperty(pre, str);
      // 这里是覆盖原有颜色的核心代码
      for (let i = 1; i < 10; i += 1) {
        el.style.setProperty(`${pre}-light-${i}`, mix(str, mixWhite, i * 0.1));
      }
      el.style.setProperty("--el-color-primary-dark", mix(str, mixBlack, 0.1));
    },
    changeTabColor({
      commit
    }, val) {
      commit("setThemeConfigTbaColor", val);
    },
    changeMenuColor({
      commit
    }, val) {
      commit("setThemeConfigMenuColor", val);
    },
    changeTags({
      commit
    }, val) {
      commit("setThemeConfigchangeTags", val);
    },
  },

  getters: {
    isLoggedIn: (state) => !!state.token,
    userInfo: (state) => state.UserInfo,
    userName: (state) => state.UserInfo.username || "",
    userEmail: (state) => state.UserInfo.email || "",
  }
};