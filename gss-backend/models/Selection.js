const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Topic = require("./Topic");

const Selection = sequelize.define(
  "Selection",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // 对应数据库的 UNIQUE KEY
      field: "student_id", // 对应数据库字段
      references: {
        model: "Users",
        key: "id",
      },
    },
    topicId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "topic_id", // 对应数据库字段
      references: {
        model: "Topics",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
      allowNull: false,
    },
  },
  {
    tableName: "selections",
    timestamps: true,
    underscored: true,
    
    // 【阶段六 优化】: 在模型级别定义索引
    indexes: [
      // 尽管 studentId 的 unique 约束已创建索引，但明确定义可增强可读性
      {
        name: "selections_student_id_idx",
        unique: true,
        fields: ["student_id"],
      },
      // 这是非常重要的一个索引。当一个课题被选中后，我们需要基于 topicId
      // 去找到所有相关的 selection 记录，以便将其他的设置为 'rejected'。
      // 如果没有这个索引，在大量学生同时选择一个热门课题时，会导致数据库慢查询。
      {
        name: "selections_topic_id_idx",
        fields: ["topic_id"],
      },
    ],
  }
);

// 定义关联关系
User.hasOne(Selection, { foreignKey: "studentId", as: "selection" });
Selection.belongsTo(User, { foreignKey: "studentId", as: "student" });

Topic.hasMany(Selection, { foreignKey: "topicId", as: "selections" });
Selection.belongsTo(Topic, { foreignKey: "topicId", as: "topic" });

module.exports = Selection;
