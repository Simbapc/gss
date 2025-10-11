const User = require("../models/User");
const Topic = require("../models/Topic");
const Selection = require("../models/Selection");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

// --- 用户管理 ---
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "服务器错误" });
  }
};

exports.createUser = async (req, res) => {
  const { username, password, name, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      name,
      role,
    });
    const userResponse = { ...newUser.get({ plain: true }) };
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: "创建用户失败", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, role, password } = req.body;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "用户不存在" });

    user.name = name ?? user.name;
    user.role = role ?? user.role;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    const userResponse = { ...user.get({ plain: true }) };
    delete userResponse.password;
    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "更新用户失败" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await User.destroy({ where: { id } });
    if (result === 0) return res.status(404).json({ message: "用户不存在" });
    res.status(200).json({ message: "用户已删除" });
  } catch (error) {
    res.status(500).json({ message: "删除用户失败" });
  }
};

// --- 课题管理 ---
exports.getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.findAll({
      include: { model: User, as: "teacher", attributes: ["name"] },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({ message: "服务器错误" });
  }
};

// --- 选题管理 ---
exports.getAllSelections = async (req, res) => {
  try {
    const selections = await Selection.findAll({
      include: [
        { model: Topic, as: "topic", attributes: ["title"] },
        { model: User, as: "student", attributes: ["name", "username"] },
      ],
      order: [["updatedAt", "DESC"]],
    });
    res.status(200).json(selections);
  } catch (error) {
    res.status(500).json({ message: "服务器错误" });
  }
};
