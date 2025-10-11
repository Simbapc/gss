// src/api/modules/admin.js
import api from "../index";

// 用户管理
export const fetchAllUsers = () => api.get("/admin/users");
export const createUser = (userData) => api.post("/admin/users", userData);
export const updateUser = (userId, userData) =>
  api.put(`/admin/users/${userId}`, userData);
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);

// 课题管理
export const fetchAllTopics = () => api.get("/admin/topics");

// 选题管理
export const fetchAllSelections = () => api.get("/admin/selections");
