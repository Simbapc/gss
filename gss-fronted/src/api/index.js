// 增强API错误处理和用户反馈
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '../store/auth';
import router from '../router';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000, // 增加超时时间到30秒
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = authStore.token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 对成功响应进行全局处理
    if (response.data && response.data.message) {
      ElMessage.success(response.data.message);
    }
    return response;
  },
  (error) => {
    // 对错误响应进行全局处理
    if (error.response) {
      // 服务器返回错误状态码
      switch (error.response.status) {
        case 401:
          // 未认证，强制登出
          ElMessageBox.alert('您的登录已过期，请重新登录', '登录过期', {
            confirmButtonText: '确定',
            callback: () => {
              const authStore = useAuthStore();
              authStore.logout();
              router.push('/login');
            }
          });
          break;
        case 403:
          ElMessage.error('您没有权限执行此操作');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 409:
          ElMessage.error(error.response.data.message || '操作冲突，请重试');
          break;
        case 500:
          ElMessage.error(error.response.data.message || '服务器内部错误，请稍后重试');
          break;
        default:
          ElMessage.error(error.response.data.message || '请求失败');
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      ElMessage.error('网络连接失败，请检查您的网络设置');
    } else {
      // 请求配置出错
      ElMessage.error('请求配置错误');
    }
    return Promise.reject(error);
  }
);

export default api;