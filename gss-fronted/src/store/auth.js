// src/store/auth.js
import { defineStore } from "pinia";
import { loginRequest } from "../api/modules/auth";
import router from "../router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isTeacher: (state) => state.user?.role === "teacher",
  },
  actions: {
    async login(credentials) {
      try {
        const response = await loginRequest(credentials);
        // --- 加入诊断日志 ---
        console.log("从后端收到的原始响应:", response.data);
        const { token, user } = response.data;
        console.log("解析出的Token:", token);
        console.log("解析出的User对象:", user);
        // --- 日志结束 ---
        this.token = token;
        this.user = user;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // 根据角色跳转
        if (user && user.role) {
          switch (user.role) {
            case "teacher":
              await router.push("/teacher/topics");
              break;
            case "student":
              // 学生登录后跳转到课题列表页
              await router.push("/student/topic-list");
              break;
            default:
              await router.push("/");
          }
        }
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    },
  },
});
