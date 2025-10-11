const Selection = require("../models/Selection");
const Topic = require("../models/Topic");
const { Op } = require("sequelize");
const User = require("../models/User"); // 确保引入User



// -------[学生]----------
// [学生] 选择一个课题
exports.selectTopic = async (req, res) => {
  const studentId = req.user.id;
  const { topicId } = req.params;

  try {
    const topic = await Topic.findByPk(topicId);
    if (!topic || topic.status !== "open") {
      return res.status(404).json({ message: "课题不存在或当前不可选" });
    }

    // Selection模型已设置studentId为unique，数据库层面会阻止重复创建
    // Sequelize的create操作如果违反unique约束会抛出SequelizeUniqueConstraintError
    await Selection.create({
      studentId,
      topicId,
      status: "pending",
    });

    res.status(201).json({ message: "选题成功，等待教师审核" });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "操作失败，您已经选择了课题" });
    }
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};

// [学生] 查看自己的选题
exports.getMySelection = async (req, res) => {
  try {
    const selection = await Selection.findOne({
      where: { studentId: req.user.id },
      include: [
        {
          model: Topic,
          as: "topic",
          include: [
            {
              model: require("../models/User"),
              as: "teacher",
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    if (!selection) {
      return res.status(200).json(null); // 返回null表示学生还未选择任何课题
    }
    res.status(200).json(selection);
  } catch (error) {
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};

// [学生] 撤销自己的选题
exports.cancelSelection = async (req, res) => {
  try {
    const result = await Selection.destroy({
      where: {
        studentId: req.user.id,
        status: "pending", // 只能撤销待审核的选题
      },
    });

    if (result === 0) {
      return res
        .status(404)
        .json({ message: "未找到可撤销的选题，或选题已被处理" });
    }

    res.status(200).json({ message: "选题已成功撤销" });
  } catch (error) {
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};

// -------[教师]----------
// [教师] 获取选择了自己课题的学生列表
exports.getSelectionsForMyTopics = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const selections = await Selection.findAll({
      include: [
        {
          model: Topic,
          as: "topic",
          where: { teacherId: teacherId },
          attributes: ["id", "title"],
        },
        {
          model: User,
          as: "student",
          attributes: ["id", "username", "name"],
        },
      ],
      where: { status: "pending" }, // 只获取待审核的
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json(selections);
  } catch (error) {
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};

// [教师] 审核学生选题 (通过或拒绝)
exports.reviewSelection = async (req, res) => {
  const { selectionId } = req.params;
  const { decision } = req.body; // 'approve' or 'reject'
  const teacherId = req.user.id;

  const t = await require("../config/database").transaction(); // 开启事务

  try {
    const selection = await Selection.findByPk(selectionId, {
      include: [{ model: Topic, as: "topic" }],
      transaction: t,
    });

    // 权限验证
    if (!selection || selection.topic.teacherId !== teacherId) {
      await t.rollback();
      return res.status(404).json({ message: "未找到该选题记录或无权操作" });
    }
    if (selection.status !== "pending") {
      await t.rollback();
      return res.status(400).json({ message: "该申请已被处理，请勿重复操作" });
    }

    if (decision === "approve") {
      // 1. 更新当前选题记录为 'approved'
      selection.status = "approved";
      await selection.save({ transaction: t });

      // 2. 将该课题状态更新为 'closed'
      await Topic.update(
        { status: "closed" },
        { where: { id: selection.topicId }, transaction: t }
      );

      // 3. 自动拒绝其他所有选择了此课题的学生
      await Selection.update(
        { status: "rejected" },
        {
          where: {
            topicId: selection.topicId,
            id: { [Op.ne]: selectionId }, // Op.ne = Not Equal
          },
          transaction: t,
        }
      );
    } else if (decision === "reject") {
      // 如果是拒绝，则直接删除该条选题记录，让学生可以重新选择
      await selection.destroy({ transaction: t });
    } else {
      await t.rollback();
      return res.status(400).json({ message: "无效的审核决定" });
    }

    await t.commit(); // 提交事务
    res.status(200).json({ message: "审核操作成功" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};
