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
    // 直接使用明文密码，User模型的beforeCreate钩子会自动哈希
    const newUser = await User.create({
      username,
      password: password,  // 使用明文密码，让模型钩子处理哈希
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

// --- 管理员课题管理 ---
const sequelize = require("../config/database");

// 管理员批量创建课题（为指定教师）
exports.adminBatchCreateTopics = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { topics, teacherId } = req.body;

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "请提供有效的课题数据" });
    }

    if (!teacherId) {
      await transaction.rollback();
      return res.status(400).json({ message: "请指定教师ID" });
    }

    // 验证教师是否存在
    const teacher = await User.findOne({ 
      where: { id: teacherId, role: 'teacher' },
      transaction
    });

    if (!teacher) {
      await transaction.rollback();
      return res.status(404).json({ message: "指定的教师不存在" });
    }

    // 验证每个课题数据
    for (const topicData of topics) {
      if (!topicData.title || !topicData.title.trim()) {
        await transaction.rollback();
        return res.status(400).json({ message: "课题标题不能为空" });
      }
    }

    // 批量创建课题
    const createdTopics = await Topic.bulkCreate(
      topics.map(topicData => ({
        ...topicData,
        teacherId,
        status: topicData.status || 'open'
      })),
      { transaction }
    );

    await transaction.commit();
    res.status(201).json({ 
      message: `成功为教师 ${teacher.name} 批量创建 ${createdTopics.length} 个课题`,
      topics: createdTopics 
    });
  } catch (error) {
    await transaction.rollback();
    console.error("管理员批量创建课题失败:", error);
    res.status(500).json({ message: "批量创建课题失败", error: error.message });
  }
};

// 管理员批量更新课题
exports.adminBatchUpdateTopics = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { topics } = req.body;

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "请提供有效的课题数据" });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // 逐个更新课题
    for (const topicData of topics) {
      try {
        const topic = await Topic.findByPk(topicData.id, { transaction });

        if (!topic) {
          results.failed++;
          results.errors.push(`课题ID ${topicData.id}: 未找到`);
          continue;
        }

        // 更新课题信息
        await topic.update({
          title: topicData.title || topic.title,
          description: topicData.description || topic.description,
          maxStudents: topicData.maxStudents || topic.maxStudents,
          status: topicData.status || topic.status
        }, { transaction });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`课题ID ${topicData.id}: ${error.message}`);
      }
    }

    await transaction.commit();
    res.status(200).json({
      message: `批量更新完成，成功: ${results.success}，失败: ${results.failed}`,
      results
    });
  } catch (error) {
    await transaction.rollback();
    console.error("管理员批量更新课题失败:", error);
    res.status(500).json({ message: "批量更新课题失败", error: error.message });
  }
};

// 管理员删除课题
exports.adminDeleteTopic = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const topic = await Topic.findByPk(id, { transaction });

    if (!topic) {
      await transaction.rollback();
      return res.status(404).json({ message: "课题不存在" });
    }

    // 检查是否有学生选择了该课题
    const selectionCount = await Selection.count({
      where: { topicId: id, status: { [Op.in]: ['pending', 'approved'] } },
      transaction
    });

    if (selectionCount > 0) {
      await transaction.rollback();
      return res.status(409).json({ message: "该课题已有学生选择，无法删除" });
    }

    await topic.destroy({ transaction });
    await transaction.commit();

    res.status(200).json({ message: "课题删除成功" });
  } catch (error) {
    await transaction.rollback();
    console.error("管理员删除课题失败:", error);
    res.status(500).json({ message: "删除课题失败", error: error.message });
  }
};
