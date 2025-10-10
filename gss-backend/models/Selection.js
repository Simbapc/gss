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
    },
    topicId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
  }
);

// 定义关联关系
User.hasOne(Selection, { foreignKey: "studentId", as: "selection" });
Selection.belongsTo(User, { foreignKey: "studentId", as: "student" });

Topic.hasMany(Selection, { foreignKey: "topicId", as: "selections" });
Selection.belongsTo(Topic, { foreignKey: "topicId", as: "topic" });

module.exports = Selection;
