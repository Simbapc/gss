// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/auth";
console.log("--- router/index.js 开始执行 ---");
const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/teacher",
    component: () => import("../views/teacher/Layout.vue"),
    meta: { requiresAuth: true, role: "teacher" },
    children: [
      {
        path: "topics",
        name: "TopicManagement",
        component: () => import("../views/teacher/TopicManagement.vue"),
      },
      // --- 新增：教师的选题管理页面 ---
      {
        path: "selections",
        name: "SelectionManagement",
        component: () => import("../views/teacher/SelectionManagement.vue"),
      },
    ],
  },
  // --- 新增：管理员路由 ---
  {
    path: "/admin",
    component: () => import("../views/admin/Layout.vue"),
    meta: { requiresAuth: true, role: "admin" },
    children: [
      {
        path: "users",
        name: "UserManagement",
        component: () => import("../views/admin/UserManagement.vue"),
      },
      {
        path: "topics",
        name: "AdminTopicList",
        component: () => import("../views/admin/TopicList.vue"),
      },
      {
        path: "selections",
        name: "AdminSelectionList",
        component: () => import("../views/admin/SelectionList.vue"),
      },
      // 如果管理员直接访问 /admin，重定向到用户管理页
      {
        path: "",
        redirect: "users",
      },
    ],
  },
  {
    path: "/student",
    component: () => import("../views/student/Layout.vue"),
    meta: { requiresAuth: true, role: "student" },
    children: [
      {
        path: "topic-list",
        name: "StudentTopicList",
        component: () => import("../views/student/TopicList.vue"),
      },
      {
        path: "my-selection",
        name: "MySelection",
        component: () => import("../views/student/MySelection.vue"),
      },
      // 如果学生直接访问 /student，重定向到课题列表
      {
        path: "",
        redirect: "topic-list",
      },
    ],
  },
  // 根路径重定向
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // --- 加入诊断日志，这是我们的“监视器” ---
  console.log("--- 路由守卫触发 ---");
  console.log("尝试跳转到:", to.path);
  console.log("是否需要认证:", to.meta.requiresAuth);
  console.log("Pinia中用户是否登录:", authStore.isAuthenticated);
  console.log("Pinia中的用户信息:", JSON.parse(JSON.stringify(authStore.user))); // 使用JSON方法确保能看到完整对象

  if (authStore.user) {
    console.log("Pinia中的用户角色:", authStore.user.role);
    console.log("目标页面要求角色:", to.meta.role);
    console.log("角色是否匹配:", authStore.user.role === to.meta.role);
  }
  console.log("----------------------");
  // --- 日志结束 ---

  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.user?.role;

  // 目标页面需要认证
  if (to.meta.requiresAuth) {
    // 用户未登录 -> 跳转到登录页
    if (!isAuthenticated) {
      next({ name: "Login", query: { redirect: to.fullPath } }); // 推荐加上 redirect query
    }
    // 用户已登录，但角色不匹配
    else if (to.meta.role && userRole !== to.meta.role) {
      // 可以跳转到 403 页面或首页，这里简单处理为登录页
      next({ name: "Login" });
    }
    // 验证通过
    else {
      next();
    }
  }
  // 目标页面是登录页，但用户已经登录了
  else if (to.name === "Login" && isAuthenticated) {
    // 根据角色跳转到对应的首页，避免重复登录
    if (userRole === "teacher") {
      next({ path: "/teacher/topics" });
    } else {
      next({ path: "/" }); // 或其他默认页
    }
  }
  // 其他情况（访问无需认证的页面）
  else {
    next();
  }
});

export default router;
