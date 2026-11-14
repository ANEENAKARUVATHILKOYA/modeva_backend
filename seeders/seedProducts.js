
require("dotenv").config();

const { sequelize, connectDB } = require("../config/db");
const { Product, ProductVariant } = require("../models");

const sampleProducts = [
  {
    name: "Gradient Graphic T-shirt",
    description: "Comfortable cotton T-shirt with a modern gradient print.",
    category: "T-shirts",
    price: 145,
    discount_percentage: 10,
    image_url: null,
    variants: [
      { size: "S", color: "Black", stock: 10 },
      { size: "M", color: "Black", stock: 15 },
      { size: "L", color: "Black", stock: 12 },
      { size: "XL", color: "Black", stock: 8 },
    ],
  },
  {
    name: "Classic Black Polo",
    description: "Classic polo shirt with a comfortable regular fit.",
    category: "Polo Shirts",
    price: 120,
    discount_percentage: 0,
    image_url: null,
    variants: [
      { size: "S", color: "Black", stock: 12 },
      { size: "M", color: "Black", stock: 20 },
      { size: "L", color: "Black", stock: 10 },
    ],
  },
  {
    name: "Blue Denim Jeans",
    description: "Everyday denim jeans with a modern straight fit.",
    category: "Jeans",
    price: 180,
    discount_percentage: 15,
    image_url: null,
    variants: [
      { size: "30", color: "Blue", stock: 10 },
      { size: "32", color: "Blue", stock: 15 },
      { size: "34", color: "Blue", stock: 8 },
    ],
  },
  {
    name: "Checkered Casual Shirt",
    description: "Stylish checkered shirt for everyday casual wear.",
    category: "Shirts",
    price: 160,
    discount_percentage: 5,
    image_url: null,
    variants: [
      { size: "M", color: "Red", stock: 10 },
      { size: "L", color: "Red", stock: 12 },
      { size: "XL", color: "Red", stock: 8 },
    ],
  },
];

const seedProducts = async () => {
  try {
    await connectDB();

    const existingCount = await Product.count();

    if (existingCount > 0) {
      console.log("Products already exist. Skipping seed.");
      return;
    }

    await sequelize.transaction(async (transaction) => {
      for (const item of sampleProducts) {
        const { variants, ...productData } = item;

        const product = await Product.create(productData, {
          transaction,
        });

        await ProductVariant.bulkCreate(
          variants.map((variant) => ({
            ...variant,
            product_id: product.id,
          })),
          { transaction }
        );
      }
    });

    console.log("Sample products inserted successfully");
  } catch (error) {
    console.error("Product seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

seedProducts();
