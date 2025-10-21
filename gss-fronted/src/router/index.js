// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/auth";
import NProgress from "nprogress"; // 【阶段五 优化】 1. 引入 NProgress
import "nprogress/nprogress.css"; // 【阶段五 优化】 2. 引入 NProgress 的样式

// 【阶段五 优化】 3. 配置 NProgress，可自定义（例如，去掉右上角的加载“圈”）
NProgress.configure({ showSpinner: false });

// 导入组件
import Login from "../views/Login.vue";

// 学生相关
import StudentLayout from "../views/student/Layout.vue";
import StudentTopicList from "../views/student/TopicList.vue";
import MySelection from "../views/student/MySelection.vue";

// 教师相关
import TeacherLayout from "../views/teacher/Layout.vue";
import TeacherTopicManagement from "../views/teacher/TopicManagement.vue";
import TeacherSelectionManagement from "../views/teacher/SelectionManagement.vue";

// 管理员相关
import AdminLayout from "../views/admin/Layout.vue";
import UserManagement from "../views/admin/UserManagement.vue";
import TopicList from "../views/admin/TopicList.vue";
import SelectionList from "../views/admin/SelectionList.vue";

// console.log("--- router/index.js 开始执行 ---");
const routes = [
  { path: "/", redirect: "/login" }, // 登录页

  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { isPublic: true },
  },
  {
    path: "/teacher",
    component: TeacherLayout,
    meta: { requiresAuth: true, role: "teacher" },
    children: [
      { path: "", redirect: "topics" }, // 默认重定向到课题管理
      {
        path: "topics",
        name: "TopicManagement",
        component: TeacherTopicManagement,
      },
      // --- 新增：教师的选题管理页面 ---
      {
        path: "selections",
        name: "SelectionManagement",
        component: TeacherSelectionManagement,
      },
    ],
  },
  // --- 新增：管理员路由 ---
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, role: "admin" },
    children: [
      { path: "", redirect: "users" }, // 默认重定向到用户管理
      {
        path: "users",
        name: "UserManagement",
        component: UserManagement,
      },
      {
        path: "topics",
        name: "AdminTopicList",
        component: TopicList,
      },
      {
        path: "selections",
        name: "AdminSelectionList",
        component: SelectionList,
      },
    ],
  },
  {
    path: "/student",
    component: StudentLayout,
    meta: { requiresAuth: true, role: "student" },
    children: [
      { path: "", redirect: "topic-list" },
      {
        path: "topic-list",
        name: "StudentTopicList",
        component: StudentTopicList,
      },
      {
        path: "my-selection",
        name: "MySelection",
        component: MySelection,
      },
      // 如果学生直接访问 /student，重定向到课题列表
      {
        path: "",
        redirect: "topic-list",
      },
    ],
  },
  // 404 页面，重定向到首页或登录页
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
  NProgress.start(); // 【阶段五 优化】 4. 在路由开始跳转前启动进度条
  const authStore = useAuthStore();

  // --- 加入诊断日志，这是我们的“监视器” ---
  // console.log("--- 路由守卫触发 ---");
  // console.log("尝试跳转到:", to.path);
  // console.log("是否需要认证:", to.meta.requiresAuth);
  // console.log("Pinia中用户是否登录:", authStore.isAuthenticated);
  // console.log("Pinia中的用户信息:", JSON.parse(JSON.stringify(authStore.user))); // 使用JSON方法确保能看到完整对象

  // if (authStore.user) {
  //   console.log("Pinia中的用户角色:", authStore.user.role);
  //   console.log("目标页面要求角色:", to.meta.role);
  //   console.log("角色是否匹配:", authStore.user.role === to.meta.role);
  // }
  // console.log("----------------------");
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

// 【阶段五 优化】 5. 在路由跳转结束后关闭进度条
router.afterEach(() => {
  NProgress.done();
});

export default router;
