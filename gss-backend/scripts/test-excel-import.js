// gss-backend/scripts/test-excel-import.js
// 测试Excel导入功能

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api';
const ADMIN_TOKEN = 'your-admin-token-here'; // 需要替换为实际的admin token

// 模拟Excel数据
const testStudents = [
  { username: '20230001', name: '张三', password: '20230001', role: 'student' },
  { username: '20230002', name: '李四', password: '20230002', role: 'student' },
  { username: '20230003', name: '王五', password: '20230003', role: 'student' }
];

async function testExcelImport() {
  console.log('=== 测试Excel批量导入功能 ===\n');
  
  try {
    // 1. 测试单个用户创建（验证后端API）
    console.log('1. 测试单个用户创建:');
    const testUser = testStudents[0];
    try {
      const response = await axios.post(`${BASE_URL}/admin/users`, testUser, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      });
      console.log('   ✅ 单个用户创建成功:', response.data.username);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('已存在')) {
        console.log('   ⚠️ 用户已存在（正常情况）');
      } else {
        console.log('   ❌ 单个用户创建失败:', error.response?.data?.message || error.message);
      }
    }

    // 2. 测试批量导入逻辑
    console.log('\n2. 测试批量导入逻辑:');
    const promises = testStudents.map(student => 
      axios.post(`${BASE_URL}/admin/users`, student, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      }).catch(error => {
        return { error: true, message: error.response?.data?.message || '创建失败', username: student.username };
      })
    );

    const results = await Promise.all(promises);
    
    const successCount = results.filter(result => !result?.error).length;
    const errorCount = results.filter(result => result?.error).length;
    
    console.log(`   成功: ${successCount} 个`);
    console.log(`   失败: ${errorCount} 个`);
    
    if (errorCount > 0) {
      const errorUsers = results.filter(result => result?.error).map(r => r.username);
      console.log(`   失败用户: ${errorUsers.join(', ')}`);
    }

    // 3. 验证用户列表
    console.log('\n3. 验证用户列表:');
    try {
      const response = await axios.get(`${BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      });
      const studentUsers = response.data.filter(user => user.role === 'student');
      console.log(`   当前学生用户数量: ${studentUsers.length}`);
      
      // 检查测试用户是否在列表中
      const testUsernames = testStudents.map(s => s.username);
      const foundUsers = studentUsers.filter(user => testUsernames.includes(user.username));
      console.log(`   找到测试用户: ${foundUsers.length} 个`);
      
    } catch (error) {
      console.log('   ❌ 获取用户列表失败:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Excel导入功能测试完成！');
    console.log('\n📋 使用说明:');
    console.log('1. 登录管理员账户');
    console.log('2. 进入"用户管理"页面');
    console.log('3. 点击"批量导入学生"按钮');
    console.log('4. 下载Excel模板并填写学生信息');
    console.log('5. 上传Excel文件并确认导入');

  } catch (error) {
    console.error('测试过程中出错:', error.message);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  console.log('注意：需要先启动后端服务并获取管理员token');
  console.log('请将脚本中的 ADMIN_TOKEN 替换为实际的token');
  testExcelImport();
}

module.exports = testExcelImport;
