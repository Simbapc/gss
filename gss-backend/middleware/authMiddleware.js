const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 保护路由的中间件
exports.protect = async (req, res, next) => {
  let token;

  if (!token) {
    return res.status(401).json({ message: "没有提供Token，认证失败" });
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 提取token
      token = req.headers.authorization.split(" ")[1];

      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 将用户信息附加到请求对象上（不包括密码）
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });

      if (!req.user) {
        return res.status(401).json({ message: "用户不存在，认证失败" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Token无效，认证失败" });
    }
  }
};

// 限定角色的中间件
exports.isTeacher = (req, res, next) => {
  if (req.user && req.user.role === "teacher") {
    next();
  } else {
    res.status(403).json({ message: "权限不足，需要教师角色" });
  }
};
