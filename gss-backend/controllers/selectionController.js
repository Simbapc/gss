const Selection = require('../models/Selection');
const Topic = require('../models/Topic');
const { Op } = require('sequelize');

// [学生] 选择一个课题
exports.selectTopic = async (req, res) => {
    const studentId = req.user.id;
    const { topicId } = req.params;

    try {
        const topic = await Topic.findByPk(topicId);
        if (!topic || topic.status !== 'open') {
            return res.status(404).json({ message: '课题不存在或当前不可选' });
        }

        // Selection模型已设置studentId为unique，数据库层面会阻止重复创建
        // Sequelize的create操作如果违反unique约束会抛出SequelizeUniqueConstraintError
        await Selection.create({
            studentId,
            topicId,
            status: 'pending'
        });

        res.status(201).json({ message: '选题成功，等待教师审核' });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: '操作失败，您已经选择了课题' });
        }
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// [学生] 查看自己的选题
exports.getMySelection = async (req, res) => {
    try {
        const selection = await Selection.findOne({
            where: { studentId: req.user.id },
            include: [{
                model: Topic,
                as: 'topic',
                include: [{ model: require('../models/User'), as: 'teacher', attributes: ['name'] }]
            }]
        });

        if (!selection) {
            return res.status(200).json(null); // 返回null表示学生还未选择任何课题
        }
        res.status(200).json(selection);
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// [学生] 撤销自己的选题
exports.cancelSelection = async (req, res) => {
    try {
        const result = await Selection.destroy({
            where: {
                studentId: req.user.id,
                status: 'pending' // 只能撤销待审核的选题
            }
        });

        if (result === 0) {
            return res.status(404).json({ message: '未找到可撤销的选题，或选题已被处理' });
        }

        res.status(200).json({ message: '选题已成功撤销' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};