const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    status: {
      type: DataTypes.ENUM(
        "placed",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "placed",
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Order;
