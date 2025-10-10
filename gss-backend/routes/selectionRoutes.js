const express = require("express");
const router = express.Router();
const selectionController = require("../controllers/selectionController");
const { protect, isStudent } = require("../middleware/authMiddleware");

// 所有路由都需要学生登录
router.use(protect, isStudent);

router.post("/select/:topicId", selectionController.selectTopic);
router.get("/my-selection", selectionController.getMySelection);
router.delete("/cancel", selectionController.cancelSelection);

module.exports = router;
