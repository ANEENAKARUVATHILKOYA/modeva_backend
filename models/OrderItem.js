const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    order_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "orders",
        key: "id",
      },
    },

    variant_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "product_variants",
        key: "id",
      },
    },

    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    size: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    color: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },

    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    tableName: "order_items",
    timestamps: true,
    underscored: true,
  }
);

module.exports = OrderItem;
