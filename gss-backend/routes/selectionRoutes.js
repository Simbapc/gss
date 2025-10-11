const express = require("express");
const router = express.Router();
const selectionController = require("../controllers/selectionController");
const { protect, isStudent, isTeacher } = require("../middleware/authMiddleware");


router.post("/select/:topicId", protect, isStudent,selectionController.selectTopic);
router.get("/my-selection", protect, isStudent, selectionController.getMySelection);
router.delete("/cancel", protect, isStudent, selectionController.cancelSelection);

// 教师路由
router.get('/teacher/pending', protect, isTeacher, selectionController.getSelectionsForMyTopics);
router.put('/teacher/review/:selectionId', protect, isTeacher, selectionController.reviewSelection);

module.exports = router;
