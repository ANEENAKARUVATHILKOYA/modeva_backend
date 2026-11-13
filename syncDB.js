require("dotenv").config();

const { sequelize, connectDB } = require("./config/db");

// Load all models and relationships
require("./models");

const syncDatabase = async () => {
  try {
    await connectDB();

    await sequelize.sync();

    console.log("Database tables synchronized successfully");
  } catch (error) {
    console.error("Database synchronization failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

syncDatabase();
