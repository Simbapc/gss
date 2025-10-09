// src/api/modules/auth.js
import api from "../index";

export const loginRequest = (credentials) => {
  return api.post("/auth/login", credentials);
};
