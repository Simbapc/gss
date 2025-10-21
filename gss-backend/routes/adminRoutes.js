const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// 所有路由都需要管理员登录
router.use(protect, isAdmin);

// 用户管理
router.get("/users", adminController.getAllUsers);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

// 课题管理
router.get("/topics", adminController.getAllTopics);
router.post("/topics/batch-create", adminController.adminBatchCreateTopics);
router.put("/topics/batch-update", adminController.adminBatchUpdateTopics);
router.delete("/topics/:id", adminController.adminDeleteTopic);

// 选题管理
router.get("/selections", adminController.getAllSelections);
router.get("/selections/export", adminController.exportSelectionsToExcel);

module.exports = router;
