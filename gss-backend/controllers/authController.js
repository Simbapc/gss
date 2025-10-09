// controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, password, name, role } = req.body;

    // 简单验证
    if (!username || !password || !name || !role) {
      return res.status(400).json({ message: "所有字段均为必填项" });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: "用户名已存在" });
    }

    // 创建用户（密码将在模型的 beforeCreate 钩子中被哈希）
    const newUser = await User.create({ username, password, name, role });

    res.status(201).json({
      message: "用户注册成功",
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "用户名和密码不能为空" });
    }

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "认证失败：用户名或密码错误" });
    }

    // 验证密码
    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "认证失败：用户名或密码错误" });
    }

    // 创建JWT
    const payload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      message: "登录成功",
      token: `Bearer ${token}`, // 按惯例在token前加上 Bearer
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};
