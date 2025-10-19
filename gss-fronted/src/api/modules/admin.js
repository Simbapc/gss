// src/api/modules/admin.js
import api from "../index";

// 用户管理
export const fetchAllUsers = (params = {}) => api.get("/admin/users", { params });
export const createUser = (userData) => api.post("/admin/users", userData);
export const updateUser = (userId, userData) =>
  api.put(`/admin/users/${userId}`, userData);
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);

// 课题管理
export const fetchAllTopics = (params = {}) => api.get("/admin/topics", { params });
export const adminBatchCreateTopics = (data) => api.post("/admin/topics/batch-create", data);
export const adminBatchUpdateTopics = (topics) => api.put("/admin/topics/batch-update", { topics });
export const adminDeleteTopic = (topicId) => api.delete(`/admin/topics/${topicId}`);

// 选题管理
export const fetchAllSelections = (params = {}) => api.get("/admin/selections", { params });
