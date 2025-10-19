// gss-backend/middleware/cache.js

const redisClient = require("../config/redisClient");

const CACHE_EXPIRATION_SECONDS = 600; // 缓存过期时间：10分钟

// 动态缓存过期时间配置
const CACHE_CONFIG = {
  // 课题列表缓存 - 高并发场景下缩短缓存时间
  '/topics/available': 30, // 30秒，因为课题列表变化频繁
  // 其他API保持默认缓存时间
  default: 600
};

const cacheMiddleware = async (req, res, next) => {
  // 我们只缓存 GET 请求
  if (req.method !== "GET") {
    return next();
  }

  // 使用请求的原始 URL 作为缓存的 key
  const key = `cache:${req.originalUrl}`;

  // 根据URL路径获取对应的缓存过期时间
  const getCacheExpiration = (url) => {
    for (const [path, expiration] of Object.entries(CACHE_CONFIG)) {
      if (url.includes(path)) {
        return expiration;
      }
    }
    return CACHE_CONFIG.default;
  };

  const expirationSeconds = getCacheExpiration(req.originalUrl);

  try {
    const cachedData = await redisClient.get(key);

    if (cachedData) {
      // 命中缓存 (Cache Hit)
      console.log(`[Cache] HIT for key: ${key} (expires in ${expirationSeconds}s)`);
      res.setHeader("X-Cache", "HIT"); // 设置一个自定义响应头，方便调试
      return res.json(JSON.parse(cachedData));
    } else {
      // 未命中缓存 (Cache Miss)
      console.log(`[Cache] MISS for key: ${key} (will cache for ${expirationSeconds}s)`);
      res.setHeader("X-Cache", "MISS");

      // 这是关键部分：我们"重写" res.json 方法
      const originalJson = res.json.bind(res);

      res.json = (body) => {
        // 1. 将数据存入 Redis 缓存，并设置过期时间
        redisClient.setEx(key, expirationSeconds, JSON.stringify(body));
        console.log(`[Cache] SET for key: ${key} (expires in ${expirationSeconds}s)`);

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
