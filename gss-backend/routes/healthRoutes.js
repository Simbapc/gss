// gss-backend/routes/healthRoutes.js

const express = require("express");
const router = express.Router();
const healthController = require("../controllers/healthController");

// 系统健康检查
router.get("/health", healthController.healthCheck);

// 系统状态统计
router.get("/stats", healthController.systemStats);

module.exports = router;
