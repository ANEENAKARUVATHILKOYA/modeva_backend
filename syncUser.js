
require("dotenv").config();

const { sequelize, connectDB } = require("./config/db");
require("./models/User");

const syncUserTable = async () => {
  try {
    await connectDB();

    await sequelize.sync();

    console.log("Users table created successfully");
  } catch (error) {
    console.error("Table creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

syncUserTable();
