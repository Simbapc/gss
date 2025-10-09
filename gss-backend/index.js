// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors"); // 引入cors
const sequelize = require("./config/database");

// 引入路由
const authRoutes = require("./routes/authRoutes");
const topicRoutes = require("./routes/topicRoutes"); // 引入topic路由

// 引入模型以同步关联关系
require("./models/User");
require("./models/Topic");

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// 中间件
app.use(cors()); // 启用CORS
app.use(express.json()); // 解析JSON请求体

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes); // 注册topic路由

// 测试数据库连接并启动服务器
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("数据库连接成功.");

    // 同步所有模型 (在开发中可以使用，生产环境建议使用迁移)
    await sequelize.sync({ alter: true });
    console.log("所有模型均已成功同步.");

    app.listen(PORT, () => {
      console.log(`服务器正在 http://localhost:${PORT} 上运行`);
    });
  } catch (error) {
    console.error("无法连接到数据库:", error);
  }
}

startServer();
