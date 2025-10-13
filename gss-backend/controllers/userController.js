// gss-backend/controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// 获取当前登录用户的信息
exports.getProfile = async (req, res) => {
  try {
    // req.user 来自于 authMiddleware 中间件
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username", "name", "role"],
    });
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "服务器错误" });
  }
};

// 更新当前登录用户的信息
exports.updateProfile = async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    // 如果提交了姓名，则更新姓名
    if (name) {
      user.name = name;
    }

    // 如果提交了新密码，则加密并更新密码
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "密码长度不能少于6位" });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    // 返回更新后的用户信息（不含密码）
    const updatedUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    };

    res.status(200).json({ message: "个人信息更新成功", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};
