const Selection = require("../models/Selection");
const Topic = require("../models/Topic");
const { Op } = require("sequelize");
const User = require("../models/User"); // 确保引入User
const sequelize = require("../config/database"); // 确保引入 sequelize 实例
const { Transaction } = require("sequelize");

// -------[学生]----------
// [学生] 选择一个课题
exports.selectTopic = async (req, res) => {
  const studentId = req.user.id;
  const { topicId } = req.params;
  const transaction = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  }); // <--- 启动事务

  try {
    // 1. 在创建前，检查学生是否已有“待审核”或“已通过”的选题
    const existingSelection = await Selection.findOne({
      where: {
        studentId,
        status: { [Op.in]: ["pending", "approved"] }, // Op.in = in ('pending', 'approved')
      },
      transaction, // 在事务中查询
    });

    if (existingSelection) {
      return res
        .status(409)
        .json({ message: "操作失败，您已经有待审核或已通过的选题" });
    }

    // 2. 【关键】锁定要选择的课题行，防止并发问题
    const topic = await Topic.findByPk(topicId, {
      lock: transaction.LOCK.UPDATE, // <--- 行级锁
      transaction,
    });

    // 3. 检查课题状态是否为'open'
    if (!topic) {
      await transaction.rollback();
      return res.status(404).json({ message: "课题不存在" });
    }

    if (topic.status !== "open") {
      await transaction.rollback();
      return res.status(409).json({ message: "该课题已被其他学生选择" });
    }

    // 4.如果学生之前的选题被拒绝了，需要先删除旧的'rejected'记录
    await Selection.destroy(
      { where: { studentId, status: "rejected" } },
      transaction
    );

    // 5. 创建新的选题记录，状态为'pending'
    const selection = await Selection.create(
      {
        studentId,
        topicId,
        status: "pending",
      },
      { transaction }
    );

    // 6. 【关键】立即将课题状态更新为'closed'，完成“抢占”
    await topic.update({ status: "closed" }, { transaction });

    // 7. 提交事务
    await transaction.commit();

    res.status(201).json({ message: "选题成功，等待教师审核", selection });
  } catch (error) {
    // 检查是否是事务已回滚的错误
    if (
      error.message &&
      error.message.includes("rollback has been called on this transaction")
    ) {
      // 事务已经被回滚，直接返回错误信息
      return res.status(409).json({ message: "该课题已被其他学生选择" });
    }

    // 检查事务是否已经结束
    if (transaction && !transaction.finished) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        // 忽略回滚错误，因为事务可能已经结束
        console.warn("事务回滚失败:", rollbackError.message);
      }
    }

    // 处理各种可能的错误类型
    if (error.name === "SequelizeUniqueConstraintError") {
      // 检查是否是真正的重复选择，还是并发冲突
      const currentSelection = await Selection.findOne({
        where: { studentId }
      });
      
      if (currentSelection) {
        // 学生确实已经选择了课题
        return res.status(409).json({ message: "操作失败，您已经选择了课题" });
      } else {
        // 这是并发冲突，课题已被其他学生选择
        return res.status(409).json({ message: "该课题已被其他学生选择" });
      }
    }
    if (error.name === "SequelizeConnectionAcquireTimeoutError") {
      return res.status(503).json({ message: "系统繁忙，请稍后重试" });
    }
    if (error.name === "SequelizeTimeoutError") {
      return res.status(503).json({ message: "系统繁忙，请稍后重试" });
    }
    if (error.name === "SequelizeDatabaseError") {
      // 检查是否是死锁错误
      if (error.message && error.message.includes("deadlock")) {
        return res.status(409).json({ message: "系统繁忙，请稍后重试" });
      }
      return res.status(503).json({ message: "数据库操作失败，请稍后重试" });
    }
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ message: "数据验证失败，请检查输入" });
    }
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({ message: "关联数据不存在" });
    }

    // 检查是否是锁等待超时
    if (error.message && error.message.includes("lock wait timeout")) {
      return res.status(409).json({ message: "该课题已被其他学生选择" });
    }

    // 对于其他未知错误，记录详细日志但返回友好提示
    console.error("选题操作未知错误详情:");
    console.error("错误名称:", error.name);
    console.error("错误消息:", error.message);
    console.error("错误堆栈:", error.stack);
    return res.status(500).json({ message: "系统内部错误，请联系管理员" });
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
  const studentId = req.user.id;
  const transaction = await sequelize.transaction();

  try {
    // 找到学生正在'pending'的选题
    const selection = await Selection.findOne({
      where: { studentId, status: "pending" },
      transaction,
    });
    if (!selection) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: "未找到可撤销的选题，或选题已被处理" });
    }
    // 【重要】如果学生撤销，课题需要被重新开放
    await Topic.update(
      { status: "open" },
      { where: { id: selection.topicId }, transaction }
    );

    // 删除该条选题记录
    await selection.destroy({ transaction });

    await transaction.commit();

    // const result = await Selection.destroy({
    //   where: {
    //     studentId: req.user.id,
    //     // 【修改】允许撤销 'pending' 的，或清除 'rejected' 的
    //     status: { [Op.in]: ["pending", "rejected"] },
    //   },
    // });

    // if (result === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: "未找到可撤销的选题，或选题已被处理" });
    // }

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
          attributes: ["id", "username", "name", "major"],
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
  const transaction = await sequelize.transaction();

  try {
    const selection = await Selection.findByPk(selectionId, {
      include: [{ model: Topic, as: "topic" }],
      transaction: transaction,
    });

    // 权限验证
    if (!selection || selection.topic.teacherId !== teacherId) {
      await transaction.rollback();
      return res.status(404).json({ message: "未找到该选题记录或无权操作" });
    }
    if (selection.status !== "pending") {
      await transaction.rollback();
      return res.status(400).json({ message: "该申请已被处理，请勿重复操作" });
    }

    if (decision === "approve") {
      // 决策：批准
      // 只需更新选题状态，课题状态已经是'closed'了
      await selection.update({ status: "approved" }, { transaction });
    } else if (decision === "reject") {
      // 决策：拒绝
      // 1. 更新选题状态为 'rejected'
      await selection.destroy({ status: "rejected" }, { transaction });
      // 2. 【重要】将课题重新开放给其他学生
      await Topic.update(
        { status: "open" },
        { where: { id: selection.topicId }, transaction }
      );
    } else {
      await transaction.rollback();
      return res.status(400).json({ message: "无效的审核决定" });
    }

    await transaction.commit(); // 提交事务
    res.status(200).json({ message: "审核操作成功" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};
