// gss-backend/middleware/cache.js

const redisClient = require("../config/redisClient");

const CACHE_EXPIRATION_SECONDS = 600; // 缓存过期时间：10分钟

const cacheMiddleware = async (req, res, next) => {
  // 我们只缓存 GET 请求
  if (req.method !== "GET") {
    return next();
  }

  // 使用请求的原始 URL 作为缓存的 key
  const key = `cache:${req.originalUrl}`;

  try {
    const cachedData = await redisClient.get(key);

    if (cachedData) {
      // 命中缓存 (Cache Hit)
      console.log(`[Cache] HIT for key: ${key}`);
      res.setHeader("X-Cache", "HIT"); // 设置一个自定义响应头，方便调试
      return res.json(JSON.parse(cachedData));
    } else {
      // 未命中缓存 (Cache Miss)
      console.log(`[Cache] MISS for key: ${key}`);
      res.setHeader("X-Cache", "MISS");

      // 这是关键部分：我们“重写” res.json 方法
      const originalJson = res.json.bind(res);

      res.json = (body) => {
        // 1. 将数据存入 Redis 缓存，并设置过期时间
        redisClient.setEx(key, CACHE_EXPIRATION_SECONDS, JSON.stringify(body));
        console.log(`[Cache] SET for key: ${key}`);

        // 2. 调用原始的 res.json 方法，将数据发送给客户端
        return originalJson(body);
      };

      next(); // 执行控制器中的业务逻辑
    }
  } catch (error) {
    console.error("缓存中间件出错:", error);
    next(); // 即使缓存出错，也要保证业务逻辑能继续执行
  }
};

module.exports = cacheMiddleware;
