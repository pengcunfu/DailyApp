import axios from "axios";
import { ElMessage } from "element-plus";
import { getToken, removeToken } from "../utils/cookies";
import router from "../router";

const service = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : '/api',
  timeout: 10000,
  withCredentials: true
});

// Request interceptors
service.interceptors.request.use(
  (config) => {
    // Add auth token to headers
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptors
service.interceptors.response.use(
  (response) => {
    const { data } = response;
    
    // Handle API response format
    if (data.success === false) {
      ElMessage({
        type: "error",
        message: data.message || "请求失败",
      });
      return Promise.reject(new Error(data.message || 'Request failed'));
    }
    
    return data;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          ElMessage({
            type: "error",
            message: "登录已过期，请重新登录",
          });
          removeToken();
          router.push('/login');
          break;
        case 403:
          ElMessage({
            type: "error",
            message: "没有权限访问该资源",
          });
          break;
        case 404:
          ElMessage({
            type: "error",
            message: "请求的资源不存在",
          });
          break;
        case 429:
          ElMessage({
            type: "error",
            message: "请求过于频繁，请稍后再试",
          });
          break;
        case 500:
          ElMessage({
            type: "error",
            message: "服务器内部错误",
          });
          break;
        default:
          ElMessage({
            type: "error",
            message: data?.message || "网络错误，请稍后再试",
          });
      }
    } else if (error.request) {
      ElMessage({
        type: "error",
        message: "网络连接失败，请检查网络",
      });
    } else {
      ElMessage({
        type: "error",
        message: error.message || "请求失败",
      });
    }
    
    return Promise.reject(error);
  }
);

export default service;