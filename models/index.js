
const User = require("./User");
const Product = require("./Product");
const ProductVariant = require("./ProductVariant");
const CartItem = require("./CartItem");
const Order = require("./Order");
const OrderItem = require("./OrderItem");

// Product relationships
Product.hasMany(ProductVariant, {
  foreignKey: "product_id",
  as: "variants",
  onDelete: "CASCADE",
});

ProductVariant.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// User and cart relationships
User.hasMany(CartItem, {
  foreignKey: "user_id",
  as: "cartItems",
});

CartItem.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

ProductVariant.hasMany(CartItem, {
  foreignKey: "variant_id",
  as: "cartItems",
});

CartItem.belongsTo(ProductVariant, {
  foreignKey: "variant_id",
  as: "variant",
});

// User and order relationships
User.hasMany(Order, {
  foreignKey: "user_id",
  as: "orders",
});

Order.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// Order and order item relationships
Order.hasMany(OrderItem, {
  foreignKey: "order_id",
  as: "items",
});

OrderItem.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order",
});

// Product variant and order item relationships
ProductVariant.hasMany(OrderItem, {
  foreignKey: "variant_id",
  as: "orderItems",
});

OrderItem.belongsTo(ProductVariant, {
  foreignKey: "variant_id",
  as: "variant",
});

module.exports = {
  User,
  Product,
  ProductVariant,
  CartItem,
  Order,
  OrderItem,
};


