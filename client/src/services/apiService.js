import axios from 'axios';
import store from '../store';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const { auth } = store.getState();
    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // 处理HTTP错误状态码
      const { status } = error.response;
      if (status === 401) {
        // 处理未授权错误
        console.error('未授权，请重新登录');
      } else if (status === 403) {
        // 处理禁止访问错误
        console.error('没有权限访问此资源');
      } else if (status >= 500) {
        // 处理服务器错误
        console.error('服务器错误');
      }
    }
    return Promise.reject(error);
  }
);

// AI服务相关API
export const generateContent = (data) => {
  return api.post('/ai/generate', data);
};

export const optimizeContent = (contentId, feedback) => {
  return api.post('/ai/optimize', { contentId, feedback });
};

export const getAISuggestions = (topic) => {
  return api.post('/ai/suggest', { topic });
};

export const getAIProviders = () => {
  return api.get('/ai/providers');
};

// 内容相关API
export const fetchContents = (params) => {
  return api.get('/content', { params });
};

export const fetchContent = (id) => {
  return api.get(`/content/${id}`);
};

export const createContent = (data) => {
  return api.post('/content', data);
};

export const updateContent = (id, data) => {
  return api.put(`/content/${id}`, data);
};

export const deleteContent = (id) => {
  return api.delete(`/content/${id}`);
};

// 认证相关API
export const registerUser = (data) => {
  return api.post('/auth/register', data);
};

export const loginUser = (data) => {
  return api.post('/auth/login', data);
};

export const getCurrentUser = () => {
  return api.get('/auth/me');
};

export default api;