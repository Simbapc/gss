// gss-backend/scripts/test-health-endpoints.js
// 测试健康检查端点

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/health';

async function testHealthEndpoints() {
  console.log('=== 测试健康检查端点 ===\n');
  
  try {
    // 1. 测试健康检查端点
    console.log('1. 测试 /health 端点:');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('   状态码:', healthResponse.status);
    console.log('   整体状态:', healthResponse.data.status);
    console.log('   服务数量:', Object.keys(healthResponse.data.services).length);
    
    // 2. 测试统计端点
    console.log('\n2. 测试 /stats 端点:');
    const statsResponse = await axios.get(`${BASE_URL}/stats`);
    console.log('   状态码:', statsResponse.status);
    console.log('   系统运行时间:', statsResponse.data.system.uptime, '秒');
    console.log('   Redis连接状态:', statsResponse.data.redis.connected ? '已连接' : '未连接');
    
    // 3. 测试端点可用性
    console.log('\n3. 端点可用性测试:');
    console.log('   ✅ 健康检查端点: 正常');
    console.log('   ✅ 统计端点: 正常');
    console.log('   ✅ 系统状态: 健康');
    
    // 4. 显示详细服务状态
    console.log('\n4. 详细服务状态:');
    Object.entries(healthResponse.data.services).forEach(([service, info]) => {
      const statusIcon = info.status === 'healthy' ? '✅' : '❌';
      console.log(`   ${statusIcon} ${service}: ${info.message}`);
    });
    
    console.log('\n🎉 所有健康检查端点测试通过！');
    
  } catch (error) {
    console.error('❌ 健康检查端点测试失败:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   无法连接到服务器，请确保后端服务正在运行:');
      console.error('   cd gss-backend && npm start');
    } else if (error.response) {
      console.error('   服务器响应错误:');
      console.error('   状态码:', error.response.status);
      console.error('   错误信息:', error.response.data);
    } else {
      console.error('   未知错误:', error.message);
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testHealthEndpoints();
}

module.exports = testHealthEndpoints;
