const { Product, ProductVariant } = require("../models");

// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        is_active: true,
      },
      attributes: [
        "id",
        "name",
        "description",
        "category",
        "price",
        "discount_percentage",
        "image_url",
      ],
      include: [
        {
          model: ProductVariant,
          as: "variants",
          attributes: ["id", "size", "color", "stock"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// GET PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOne({
      where: {
        id,
        is_active: true,
      },
      include: [
        {
          model: ProductVariant,
          as: "variants",
          attributes: ["id", "size", "color", "stock"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product details",
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
};
