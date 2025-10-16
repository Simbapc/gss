// gss-backend/middleware/invalidateCache.js
const redisClient = require("../config/redisClient");

const invalidateCacheMiddleware =
  (prefix = "cache:") =>
  async (req, res, next) => {
    // 我们在操作成功后，清除所有相关的缓存
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      // 通过前缀清除所有与 topics 相关的缓存
      const pattern = `${prefix}/api/topics*`;
      console.log(`[Cache] Invalidating cache with pattern: ${pattern}`);

      // 使用 scan 而不是 keys 来避免阻塞
      (async () => {
        for await (const key of redisClient.scanIterator({ MATCH: pattern })) {
          await redisClient.del(key);
          console.log(`[Cache] DELETED key: ${key}`);
        }
      })();

      return originalJson(body);
    };
    next();
  };

module.exports = invalidateCacheMiddleware;
