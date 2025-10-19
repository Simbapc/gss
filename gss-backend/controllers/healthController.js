// gss-backend/controllers/healthController.js

const sequelize = require("../config/database");
const redisClient = require("../config/redisClient");

// 系统健康检查
exports.healthCheck = async (req, res) => {
  const healthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {}
  };

  try {
    // 检查数据库连接
    await sequelize.authenticate();
    healthStatus.services.database = {
      status: "healthy",
      message: "Database connection successful"
    };
  } catch (error) {
    healthStatus.status = "unhealthy";
    healthStatus.services.database = {
      status: "unhealthy",
      message: error.message
    };
  }

  try {
    // 检查Redis连接
    await redisClient.ping();
    healthStatus.services.redis = {
      status: "healthy",
      message: "Redis connection successful"
    };
  } catch (error) {
    healthStatus.status = "unhealthy";
    healthStatus.services.redis = {
      status: "unhealthy",
      message: error.message
    };
  }

  // 检查系统资源
  healthStatus.services.system = {
    status: "healthy",
    memory: {
      usage: process.memoryUsage(),
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`
    },
    uptime: `${Math.round(process.uptime())}s`
  };

  const statusCode = healthStatus.status === "healthy" ? 200 : 503;
  res.status(statusCode).json(healthStatus);
};

// 系统状态统计
exports.systemStats = async (req, res) => {
  try {
    const stats = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      },
      database: {
        // 获取数据库连接池状态
        pool: {
          max: sequelize.config.pool.max,
          min: sequelize.config.pool.min,
          acquire: sequelize.config.pool.acquire,
          idle: sequelize.config.pool.idle
        }
      },
      redis: {
        connected: redisClient.isOpen
      }
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ 
      message: "获取系统统计失败", 
      error: error.message 
    });
  }
};
