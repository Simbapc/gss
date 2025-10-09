// src/api/index.js
import axios from 'axios';
import { useAuthStore } from '../store/auth';
import { ElMessage } from 'element-plus';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // 你的后端API地址
  timeout: 10000,
});

// 请求拦截器：自动附加Token
api.interceptors.request.use(
  config => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = authStore.token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理401等错误
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        const authStore = useAuthStore();
        authStore.logout();
        window.location.href = '/login'; // 跳转到登录页
      }
      ElMessage.error(error.response.data.message || '请求失败');
    }
    return Promise.reject(error);
  }
);

export default api;