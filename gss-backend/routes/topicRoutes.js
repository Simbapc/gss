const express = require("express");
const router = express.Router();
const topicController = require("../controllers/topicController");
const {
  protect,
  isTeacher,
  isStudent,
} = require("../middleware/authMiddleware");

// 这个路由需要学生权限
router.get(
  "/available",
  protect,
  isStudent,
  topicController.fetchAllOpenTopics
);

// 所有课题相关的路由都需要登录，并且是教师角色

router.post("/", protect, isTeacher, topicController.createTopic); // 创建课题
router.get("/my-topics", protect, isTeacher, topicController.getTeacherTopics); // 获取我的课题
router.put("/:id", protect, isTeacher, topicController.updateTopic); // 更新课题
router.delete("/:id", protect, isTeacher, topicController.deleteTopic); // 删除课题

module.exports = router;
