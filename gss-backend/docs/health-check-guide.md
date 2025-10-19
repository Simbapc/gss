# 系统健康检查端点使用指南

## 概述

本系统提供了完整的健康检查端点，用于监控系统状态、数据库连接、Redis连接以及系统资源使用情况。

## 健康检查端点

### 1. 基础健康检查
**端点**: `GET /api/health/health`

**功能**: 检查系统整体健康状态，包括数据库和Redis连接

**响应示例**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-19T10:30:00.000Z",
  "services": {
    "database": {
      "status": "healthy",
      "message": "Database connection successful"
    },
    "redis": {
      "status": "healthy",
      "message": "Redis connection successful"
    },
    "system": {
      "status": "healthy",
      "memory": {
        "usage": { ... },
        "rss": "45MB"
      },
      "uptime": "3600s"
    }
  }
}
```

### 2. 系统统计信息
**端点**: `GET /api/health/stats`

**功能**: 获取详细的系统统计信息

**响应示例**:
```json
{
  "timestamp": "2025-10-19T10:30:00.000Z",
  "system": {
    "uptime": 3600,
    "memory": {
      "rss": 47185920,
      "heapTotal": 36700160,
      "heapUsed": 23456789
    },
    "nodeVersion": "v18.17.0",
    "platform": "win32"
  },
  "database": {
    "pool": {
      "max": 5,
      "min": 0,
      "acquire": 30000,
      "idle": 10000
    }
  },
  "redis": {
    "connected": true
  }
}
```

## 调用方法

### 1. 使用curl命令
```bash
# 基础健康检查
curl http://localhost:3000/api/health/health

# 系统统计信息
curl http://localhost:3000/api/health/stats
```

### 2. 使用Node.js脚本
```javascript
const axios = require('axios');

// 基础健康检查
async function checkHealth() {
  try {
    const response = await axios.get('http://localhost:3000/api/health/health');
    console.log('系统状态:', response.data.status);
    return response.data;
  } catch (error) {
    console.error('健康检查失败:', error.message);
  }
}

// 系统统计
async function getStats() {
  try {
    const response = await axios.get('http://localhost:3000/api/health/stats');
    console.log('系统运行时间:', response.data.system.uptime, '秒');
    return response.data;
  } catch (error) {
    console.error('获取统计失败:', error.message);
  }
}
```

### 3. 使用提供的示例脚本
```bash
# 基础健康检查
cd gss-backend
node scripts/health-check-examples.js health

# 系统统计信息
node scripts/health-check-examples.js stats

# 完整监控检查
node scripts/health-check-examples.js monitor

# 启动定时监控（30秒间隔）
node scripts/health-check-examples.js daemon
```

### 4. 测试端点可用性
```bash
cd gss-backend
node scripts/test-health-endpoints.js
```

## 监控集成

### 1. 容器编排系统（Docker/K8s）
在Dockerfile或Kubernetes配置中使用健康检查：
```yaml
# Kubernetes示例
livenessProbe:
  httpGet:
    path: /api/health/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health/health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### 2. 监控系统（Prometheus/Grafana）
可以定期调用健康检查端点，将状态数据推送到监控系统。

### 3. 告警系统
当健康检查返回`status: "unhealthy"`或HTTP状态码为503时，触发告警。

## 状态码说明

- **200**: 系统健康
- **503**: 系统不健康（数据库或Redis连接失败）
- **其他**: 服务器错误

## 最佳实践

### 1. 定期监控
建议每1-5分钟执行一次健康检查，及时发现系统问题。

### 2. 告警配置
配置以下情况的告警：
- 健康检查返回503状态码
- 数据库连接失败
- Redis连接失败
- 系统内存使用过高

### 3. 负载均衡器健康检查
如果使用负载均衡器，可以配置健康检查端点：
```
健康检查URL: /api/health/health
期望状态码: 200
检查间隔: 30秒
超时时间: 5秒
```

### 4. 自动化部署
在CI/CD流水线中集成健康检查，确保新版本部署后系统正常运行。

## 故障排除

### 1. 连接被拒绝
如果健康检查失败并显示"ECONNREFUSED"，请检查：
- 后端服务是否正在运行
- 端口3000是否被占用
- 防火墙设置

### 2. 数据库连接失败
如果数据库服务状态为"unhealthy"，请检查：
- 数据库服务是否运行
- 数据库连接配置是否正确
- 数据库网络连接是否正常

### 3. Redis连接失败
如果Redis服务状态为"unhealthy"，请检查：
- Redis服务是否运行
- Redis连接配置是否正确
- Redis网络连接是否正常

## 扩展健康检查

可以根据需要扩展健康检查控制器，添加更多检查项：
- 外部API连通性检查
- 文件系统空间检查
- 第三方服务状态检查
- 业务逻辑健康检查

---

**注意**: 确保在生产环境中保护健康检查端点，避免敏感信息泄露。
