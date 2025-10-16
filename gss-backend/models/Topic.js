const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User"); // 引入User模型

const Topic = sequelize.define(
  "Topic",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    teacherId: {
      // Sequelize 默认将 teacher_id 转换为驼峰命名
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "teacher_id", // 对应数据库字段
      references: {
        model: User,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("open", "locked", "closed"),
      defaultValue: "open",
      allowNull: false,
    },
    maxStudents: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
  },

  {
    tableName: "topics",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: "topic_teacher_id_idx", // 索引名称
        fields: ["teacher_id"], // 索引字段
      },
    ],
  }
);

// 定义模型间的关联关系
User.hasMany(Topic, { foreignKey: "teacherId", as: "topics" });
Topic.belongsTo(User, { foreignKey: "teacherId", as: "teacher" });

module.exports = Topic;
