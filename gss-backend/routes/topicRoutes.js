const express = require("express");
const router = express.Router();
const topicController = require("../controllers/topicController");
const cacheMiddleware = require("../middleware/cache"); // <-- 导入缓存中间件
// const invalidateCacheMiddleware = require("../middleware/invalidateCache"); // <-- 导入失效中间件

// const invalidateTopicsCache = invalidateCacheMiddleware("cache:"); // 创建一个专门用于 topics 的失效实例

const {
  protect,
  isTeacher,
  isStudent,
} = require("../middleware/authMiddleware");

// 这个路由需要学生权限
router.get(
  "/available",
  protect,
  cacheMiddleware,
  isStudent,
  topicController.fetchAllOpenTopics
);

// 所有课题相关的路由都需要登录，并且是教师角色

router.post(
  "/",
  protect,
  isTeacher,
  // invalidateTopicsCache,
  topicController.createTopic
); // 创建课题

router.get("/my-topics", protect, isTeacher, topicController.getTeacherTopics); // 获取我的课题

router.put(
  "/:id",
  protect,
  isTeacher,
  // invalidateTopicsCache,
  topicController.updateTopic
); // 更新课题

router.delete(
  "/:id",
  protect,
  isTeacher,
  // invalidateTopicsCache,
  topicController.deleteTopic
); // 删除课题

// 批量新增课题
router.post(
  "/batch-create",
  protect,
  isTeacher,
  // invalidateTopicsCache,
  topicController.batchCreateTopics
);

// 批量更新课题
router.post(
  "/batch-update",
  protect,
  isTeacher,
  // invalidateTopicsCache,
  topicController.batchUpdateTopics
);

module.exports = router;
