require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MODEVA API is running successfully",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`MODEVA server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start MODEVA server");
    process.exit(1);
  }
};

startServer();
