// gss-backend/config/redisClient.js

const { createClient } = require("redis");

// 创建 Redis 客户端实例
const redisClient = createClient({
  // url: 'redis://username:password@host:port' // 如果您的 Redis 有密码或不在本地，请使用此格式
  // 默认连接本地的 redis://127.0.0.1:6379
});

// 错误处理
redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

// 使用立即执行的异步函数来连接，因为 connect() 是一个 Promise
(async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      console.log("已成功连接到 Redis 服务器。");
    } catch (err) {
      console.error("无法连接到 Redis:", err);
    }
  }
})();

module.exports = redisClient;
