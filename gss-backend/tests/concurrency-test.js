// gss-backend/tests/concurrency-test.js

const axios = require("axios");
const User = require("../models/User");
const Topic = require("../models/Topic");
const Selection = require("../models/Selection");
const sequelize = require("../config/database");

// --- 测试配置 ---
const BASE_URL = "http://localhost:3000/api";
const NUM_CONCURRENT_USERS = 200; // 模拟200个学生同时抢课
const TARGET_TOPIC_ID = 1; // 他们要抢的课题ID
const TEACHER_USERNAME = "teacher1"; // 创建该课题的教师
// -----------------

// 生成测试用户的凭证
const generateUsers = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    username: `teststudent${i + 1}`,
    password: "password123",
    name: `并发测试员${i + 1}`,
    role: "student",
  }));
};

// 1. 准备测试环境：创建测试用户和课题
const setupEnvironment = async (users) => {
  console.log("--- 准备测试环境 ---");

  // 确保数据库连接
  await sequelize.authenticate();

  // 清理旧的测试数据
  await Selection.destroy({ where: { topicId: TARGET_TOPIC_ID } });
  console.log("已清理旧的选题记录。");

  // 创建或找到教师
  const [teacher] = await User.findOrCreate({
    where: { username: TEACHER_USERNAME },
    defaults: { name: "张老师", password: "teacher123", role: "teacher" },
  });

  // 创建或找到目标课题
  const [topic] = await Topic.findOrCreate({
    where: { id: TARGET_TOPIC_ID },
    defaults: {
      title: "【热门】基于微服务的分布式系统性能研究",
      description: "一个非常抢手的课题",
      teacherId: teacher.id,
      status: "open",
    },
  });
  console.log(`目标课题 (ID: ${topic.id}) 已准备就绪。`);

  // 创建测试学生用户
  for (const user of users) {
    await User.findOrCreate({
      where: { username: user.username },
      defaults: user,
    });
  }
  console.log(`${users.length} 个测试学生用户已准备就绪。`);
  console.log("--------------------\n");
};

// 2. 模拟用户登录并获取Token
const loginAndGetToken = async (username, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username,
      password,
    });
    // 提取纯token，去掉"Bearer "前缀
    const fullToken = response.data.token;
    const pureToken = fullToken.replace("Bearer ", "");
    return pureToken;
  } catch (error) {
    console.error(
      `用户 ${username} 登录失败:`,
      error.response?.data?.message || error.message
    );
    return null;
  }
};

// 3. 模拟学生选课
const selectTopic = async (token, topicId, username) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/selections/select/${topicId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // 返回成功信息 - API现在返回message和selection数据
    return {
      username,
      success: true,
      message: response.data.message,
      selection: response.data.selection,
    };
  } catch (error) {
    // 返回失败信息
    return {
      username,
      success: false,
      message: error.response?.data?.message || "请求失败",
    };
  }
};

// --- 主测试函数 ---
const runTest = async () => {
  const testUsers = generateUsers(NUM_CONCURRENT_USERS);
  await setupEnvironment(testUsers);

  console.log(">>> 第一阶段: 所有用户同时登录...");
  const loginPromises = testUsers.map((user) =>
    loginAndGetToken(user.username, user.password)
  );
  const tokens = await Promise.all(loginPromises);

  const validTokens = tokens.filter((t) => t !== null);
  if (validTokens.length !== NUM_CONCURRENT_USERS) {
    console.error("部分用户登录失败，测试中止！");
    return;
  }
  console.log(`所有 ${validTokens.length} 个用户登录成功，已获取Token。\n`);

  console.log(
    `>>> 第二阶段: ${NUM_CONCURRENT_USERS} 个用户并发抢选课题 (ID: ${TARGET_TOPIC_ID})...`
  );
  console.log(">>> GO!\n");

  // 记录开始时间
  console.time("并发请求耗时");

  const selectionPromises = validTokens.map((token, i) =>
    selectTopic(token, TARGET_TOPIC_ID, testUsers[i].username)
  );

  // Promise.all 会同时发起所有请求
  const results = await Promise.all(selectionPromises);

  // 记录结束时间
  console.timeEnd("并发请求耗时");

  // 4. 分析并报告结果
  console.log("\n--- 测试结果分析 ---");
  let successCount = 0;
  let failureCount = 0;
  let winner = null;

  results.forEach((result) => {
    if (result.success) {
      successCount++;
      winner = result.username;
      console.log(`✅ [成功] 用户 ${result.username}: ${result.message}`);
    } else {
      failureCount++;
      console.log(`❌ [失败] 用户 ${result.username}: ${result.message}`);
    }
  });

  console.log("\n--- 最终报告 ---");
  console.log(`总请求数: ${results.length}`);
  console.log(`成功数: ${successCount}`);
  console.log(`失败数: ${failureCount}`);

  if (successCount === 1) {
    console.log(`\n🎉🎉🎉 测试通过！🎉🎉🎉`);
    console.log(`系统正确地处理了并发请求，只有唯一的获胜者: ${winner}`);
    console.log("这证明了数据库事务或应用逻辑成功防止了“超卖”问题。");
  } else {
    console.error(`\n🔥🔥🔥 测试失败！🔥🔥🔥`);
    console.error(`预期只有 1 个成功请求，但实际有 ${successCount} 个！`);
    console.error(
      "这表明存在严重的竞态条件(Race Condition)漏洞，请立即检查后端逻辑！"
    );
  }
};

// 运行测试
runTest()
  .catch(console.error)
  .finally(() => sequelize.close());
