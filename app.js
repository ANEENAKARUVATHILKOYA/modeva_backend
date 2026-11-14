const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MODEVA API is running successfully",
  });
});

// Authentication routes
app.use("/auth", authRoutes);
// User routes
app.use("/users", userRoutes);
//product routes
app.use("/products", productRoutes );
//cart routes
app.use("/cart", cartRoutes);
//order routes
app.use("/orders",orderRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`MODEVA server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start MODEVA server:", error.message);
    process.exit(1);
  }
};

startServer();
