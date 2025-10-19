// gss-backend/middleware/performanceMonitor.js

const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  // 记录请求开始时间
  req._startTime = startTime;
  
  // 监听响应完成事件
  res.on('finish', () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // 记录性能指标
    console.log(`[Performance] ${req.method} ${req.originalUrl} - ${duration}ms - ${res.statusCode}`);
    
    // 记录慢请求（超过1秒）
    if (duration > 1000) {
      console.warn(`[Performance Warning] Slow request detected: ${req.method} ${req.originalUrl} - ${duration}ms`);
    }
    
    // 记录高并发场景下的性能
    if (req.originalUrl.includes('/selections/select/')) {
      console.log(`[Selection Performance] Topic selection completed in ${duration}ms`);
    }
  });
  
  next();
};

module.exports = performanceMonitor;
