const Topic = require("../models/Topic");
const User = require("../models/User"); // 引入User
const { Op } = require("sequelize");
const sequelize = require("../config/database");

// [教师] 创建新课题
exports.createTopic = async (req, res) => {
  try {
    const { title, description, maxStudents } = req.body;
    const teacherId = req.user.id; // 从认证中间件获取教师ID

    if (!title) {
      return res.status(400).json({ message: "课题标题不能为空" });
    }

    const newTopic = await Topic.create({
      title,
      description,
      maxStudents,
      teacherId,
    });

    res.status(201).json(newTopic);
  } catch (error) {
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};

// [教师] 获取自己发布的所有课题
exports.getTeacherTopics = async (req, res) => {
  try {
    const topics = await Topic.findAll({ where: { teacherId: req.user.id } });
    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};

// [教师] 更新课题信息
exports.updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, maxStudents, status } = req.body;
    const teacherId = req.user.id;

    const topic = await Topic.findOne({ where: { id, teacherId } });

    if (!topic) {
      return res.status(404).json({ message: "未找到该课题或无权修改" });
    }

    topic.title = title || topic.title;
    topic.description = description || topic.description;
    topic.maxStudents = maxStudents || topic.maxStudents;
    topic.status = status || topic.status;

    await topic.save();
    res.status(200).json(topic);
  } catch (error) {
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};

// [教师] 删除课题
exports.deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const topic = await Topic.findOne({ where: { id, teacherId } });

    if (!topic) {
      return res.status(404).json({ message: "未找到该课题或无权删除" });
    }

    await topic.destroy();
    res.status(200).json({ message: "课题删除成功" });
  } catch (error) {
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};

// [学生] 获取所有开放且未被选择的课题
exports.fetchAllOpenTopics = async (req, res) => {
  try {
    // 使用子查询直接在数据库层面过滤，避免内存中的过滤
    const topics = await Topic.findAll({
      where: {
        status: "open",
        id: {
          [Op.notIn]: sequelize.literal(`(
            SELECT topic_id FROM selections 
            WHERE status IN ('pending', 'approved')
          )`),
        },
      },
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(topics);
  } catch (error) {
    console.error("获取开放课题列表失败:", error);
    res.status(500).json({ message: "服务器错误，请稍后重试" });
  }
};
