// gss-backend/seeders/initialData.js

// 导入 User 模型。我们只需要创建用户。
const User = require("../models/User");

const createInitialData = async () => {
  try {
    // 使用 findOrCreate 方法来创建用户。
    // 这个方法会先查找用户，如果不存在，则创建；如果已存在，则不进行任何操作。
    // 这可以防止在多次运行 seeder 时产生重复数据或错误。

    // 1. 创建管理员用户
    const [admin, adminCreated] = await User.findOrCreate({
      where: { username: "admin" },
      defaults: {
        name: "系统管理员",
        password: "admin123", // 密码在 User模型的 beforeCreate 钩子中会自动哈希加密
        role: "admin",
      },
    });

    if (adminCreated) {
      console.log('管理员用户 "admin" 已创建。');
    }

    // 2. 创建一个示例教师用户
    const [teacher, teacherCreated] = await User.findOrCreate({
      where: { username: "teacher1" },
      defaults: {
        name: "张老师",
        password: "teacher123",
        role: "teacher",
      },
    });

    if (teacherCreated) {
      console.log('教师用户 "teacher1" 已创建。');
    }

    // 3. 创建一个示例学生用户
    const [student, studentCreated] = await User.findOrCreate({
      where: { username: "student1" },
      defaults: {
        name: "李同学",
        password: "student123",
        role: "student",
        major: "信息管理与信息系统",
      },
    });

    if (studentCreated) {
      console.log('学生用户 "student1" 已创建。');
    }

    console.log("初始数据检查与创建完成。");
  } catch (error) {
    console.error("创建初始数据时出错:", error);
  }
};

// 导出这个函数，以便在 index.js 中可以调用它
module.exports = createInitialData;
