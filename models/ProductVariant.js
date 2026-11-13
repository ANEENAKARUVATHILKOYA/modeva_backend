
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ProductVariant = sequelize.define(
  "ProductVariant",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    product_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },

    size: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    color: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
  },
  {
    tableName: "product_variants",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["product_id", "size", "color"],
      },
    ],
  }
);

module.exports = ProductVariant;

