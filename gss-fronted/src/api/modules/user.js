// src/api/modules/user.js
import api from "../index";

export const getProfile = () => api.get("/users/profile");
export const updateProfile = (profileData) =>
  api.put("/users/profile", profileData);
