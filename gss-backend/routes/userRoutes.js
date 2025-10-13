// gss-backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// 所有路由都需要登录保护
router.use(protect);

// 定义路由
router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);

module.exports = router;
