// config/database.js
require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // 在生产环境中可以关闭日志
    pool: {
      max: 250,           // 最大连接数 - 支持200并发 + 预留50
      min: 10,            // 最小连接数 - 保持一定数量的预热连接
      acquire: 120000,    // 获取连接超时时间(毫秒) - 增加到2分钟
      idle: 30000,        // 连接空闲时间 - 增加到30秒
      evict: 1000,        // 驱逐过期连接的时间间隔
    },
    retry: {
      max: 5,             // 重试次数 - 增加到5次
    }
  }
);

module.exports = sequelize;
