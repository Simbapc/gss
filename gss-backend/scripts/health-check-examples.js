// gss-backend/scripts/health-check-examples.js
// 系统健康检查调用示例

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/health';

// 1. 基础健康检查
async function basicHealthCheck() {
  try {
    console.log('=== 基础健康检查 ===');
    const response = await axios.get(`${BASE_URL}/health`);
    
    console.log('状态码:', response.status);
    console.log('整体状态:', response.data.status);
    console.log('时间戳:', response.data.timestamp);
    
    console.log('\n服务状态:');
    Object.entries(response.data.services).forEach(([service, info]) => {
      console.log(`  ${service}: ${info.status} - ${info.message}`);
    });
    
    return response.data;
  } catch (error) {
    console.error('健康检查失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    return null;
  }
}

// 2. 系统统计信息
async function systemStats() {
  try {
    console.log('\n=== 系统统计信息 ===');
    const response = await axios.get(`${BASE_URL}/stats`);
    
    console.log('系统信息:');
    console.log('  - 运行时间:', response.data.system.uptime, '秒');
    console.log('  - Node版本:', response.data.system.nodeVersion);
    console.log('  - 平台:', response.data.system.platform);
    
    console.log('\n内存使用:');
    const memory = response.data.system.memory;
    console.log('  - RSS:', Math.round(memory.rss / 1024 / 1024), 'MB');
    console.log('  - 堆总计:', Math.round(memory.heapTotal / 1024 / 1024), 'MB');
    console.log('  - 堆已用:', Math.round(memory.heapUsed / 1024 / 1024), 'MB');
    
    console.log('\n数据库连接池:');
    const pool = response.data.database.pool;
    console.log('  - 最大连接数:', pool.max);
    console.log('  - 最小连接数:', pool.min);
    console.log('  - 获取超时:', pool.acquire, '毫秒');
    console.log('  - 空闲超时:', pool.idle, '毫秒');
    
    console.log('\nRedis状态:');
    console.log('  - 连接状态:', response.data.redis.connected ? '已连接' : '未连接');
    
    return response.data;
  } catch (error) {
    console.error('获取系统统计失败:', error.message);
    return null;
  }
}

// 3. 监控脚本示例
async function monitorSystem() {
  console.log('=== 系统监控脚本 ===');
  
  // 检查健康状态
  const health = await basicHealthCheck();
  if (!health) {
    console.error('❌ 系统不健康，停止监控');
    return;
  }
  
  // 检查是否有不健康的服务
  const unhealthyServices = Object.entries(health.services)
    .filter(([_, service]) => service.status === 'unhealthy')
    .map(([name, _]) => name);
  
  if (unhealthyServices.length > 0) {
    console.error(`❌ 发现不健康服务: ${unhealthyServices.join(', ')}`);
    // 这里可以添加告警逻辑，如发送邮件、Slack消息等
  } else {
    console.log('✅ 所有服务运行正常');
  }
  
  // 获取详细统计
  await systemStats();
}

// 4. 定时监控示例
async function startPeriodicMonitoring(intervalMs = 60000) { // 默认1分钟
  console.log(`开始定时监控，间隔: ${intervalMs}ms`);
  
  setInterval(async () => {
    console.log(`\n[${new Date().toISOString()}] 执行定时健康检查...`);
    await monitorSystem();
  }, intervalMs);
}

// 5. 命令行调用示例
async function main() {
  const args = process.argv.slice(2);
  
  switch (args[0]) {
    case 'health':
      await basicHealthCheck();
      break;
    case 'stats':
      await systemStats();
      break;
    case 'monitor':
      await monitorSystem();
      break;
    case 'daemon':
      await startPeriodicMonitoring(30000); // 30秒间隔
      break;
    default:
      console.log('使用方法:');
      console.log('  node health-check-examples.js health    - 基础健康检查');
      console.log('  node health-check-examples.js stats     - 系统统计信息');
      console.log('  node health-check-examples.js monitor   - 完整监控检查');
      console.log('  node health-check-examples.js daemon    - 启动定时监控');
      break;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  basicHealthCheck,
  systemStats,
  monitorSystem,
  startPeriodicMonitoring
};
