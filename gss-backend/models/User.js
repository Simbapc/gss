// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("student", "teacher", "admin"),
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: true, // Sequelize会自动处理 created_at 和 updated_at
    underscored: true, // 将驼峰命名的字段转换为下划线命名

    // 【阶段六 优化】: 在模型级别定义索引
    indexes: [
      {
        name: "users_username_idx", // 索引名称
        unique: true, // 保证是唯一索引
        fields: ["username"], // 索引作用的字段
      },
    ],
    hooks: {
      // 在创建用户之前，自动哈希密码
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // 在更新用户信息之前，如果密码被修改，则对新密码进行哈希加密
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// 添加一个实例方法来验证密码
User.prototype.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
