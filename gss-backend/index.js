// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors"); // 引入cors
const sequelize = require("./config/database");
const createInitialData = require("./seeders/initialData"); // 【修复】 导入创建初始数据的函数

// 引入路由
const authRoutes = require("./routes/authRoutes");
const topicRoutes = require("./routes/topicRoutes"); // 引入topic路由
const selectionRoutes = require("./routes/selectionRoutes"); // 引入selection路由
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes"); // <-- 1. 引入新路由
const healthRoutes = require("./routes/healthRoutes"); // 健康检查路由

// 引入模型以同步关联关系
require("./models/User");
require("./models/Topic");
require("./models/Selection"); // 引入Selection模型

// 引入中间件
const performanceMonitor = require("./middleware/performanceMonitor");

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// 中间件
app.use(cors({ exposedHeaders: ["X-Cache"], credentials: true })); // 启用CORS
app.use(express.json()); // 解析JSON请求体
app.use(performanceMonitor); // 性能监控

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes); // 注册topic路由
app.use("/api/selections", selectionRoutes); // 注册selection路由
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/health", healthRoutes); // 健康检查路由

// 测试数据库连接并启动服务器
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("数据库连接成功.");

    // 同步所有模型 (在开发中可以使用，生产环境建议使用迁移)
    await sequelize.sync().then(() => {
      console.log("数据库已同步，表结构已重置");
      // 在同步后创建初始数据
      createInitialData();
      app.listen(PORT, () => {
        console.log(`服务器正在 http://localhost:${PORT} 上运行`);
      });
    });
  } catch (error) {
    console.error("无法连接到数据库:", error);
  }
}

startServer();
