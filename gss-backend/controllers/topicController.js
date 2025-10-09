const Topic = require("../models/Topic");

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
