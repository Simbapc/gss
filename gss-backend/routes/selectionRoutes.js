const express = require("express");
const router = express.Router();
const selectionController = require("../controllers/selectionController");
const { protect, isStudent, isTeacher } = require("../middleware/authMiddleware");

// ------- 学生路由 -------
// 选课 (创建资源，用 POST)
router.post("/select/:topicId", protect, isStudent,selectionController.selectTopic);
// 查看自己的选题 (获取资源，用 GET)
router.get("/my-selection", protect, isStudent, selectionController.getMySelection);
// 撤销选题 (删除资源，用 DELETE)
router.delete("/cancel", protect, isStudent, selectionController.cancelSelection);

// ------- 教师路由 -------
// 获取待审核列表 (获取资源，用 GET)
router.get('/teacher/pending', protect, isTeacher, selectionController.getSelectionsForMyTopics);
// 获取已通过的选题列表 (获取资源，用 GET)
router.get('/teacher/approved', protect, isTeacher, selectionController.getApprovedSelectionsForMyTopics);
// 审核选题 (更新资源，用 PATCH)
router.patch('/teacher/review/:selectionId', protect, isTeacher, selectionController.reviewSelection);

module.exports = router;