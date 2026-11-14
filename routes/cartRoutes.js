const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeCartItem 
} = require("../controllers/cartController");

const router = express.Router();

router.post("/", authMiddleware, addToCart);

router.get("/", authMiddleware, getCart);

router.patch("/:id", authMiddleware, updateCartQuantity);

router.delete("/:id", authMiddleware, removeCartItem);

module.exports = router;
