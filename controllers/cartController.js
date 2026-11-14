
const { CartItem, ProductVariant, Product } = require("../models");

// ADD PRODUCT TO CART
const addToCart = async (req, res) => {
  try {
    const { variant_id, quantity = 1 } = req.body || {};
    const userId = req.user.id;

    if (
      !Number.isSafeInteger(Number(variant_id)) ||
      Number(variant_id) <= 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        message: "Valid variant ID and quantity are required",
      });
    }

    // Find selected product variant
    const variant = await ProductVariant.findByPk(variant_id, {
      include: [
        {
          model: Product,
          as: "product",
          where: { is_active: true },
          required: true,
        },
      ],
    });

    if (!variant) {
      return res.status(404).json({
        message: "Product variant not found",
      });
    }

    // Check existing cart item
    const existingItem = await CartItem.findOne({
      where: {
        user_id: userId,
        variant_id,
      },
    });

    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (newQuantity > variant.stock) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock",
      });
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
      await existingItem.save();

      return res.status(200).json({
        message: "Cart quantity updated successfully",
        cartItem: existingItem,
      });
    }

    const cartItem = await CartItem.create({
      user_id: userId,
      variant_id,
      quantity,
    });

    return res.status(201).json({
      message: "Product added to cart successfully",
      cartItem,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(500).json({
      message: "Failed to add product to cart",
    });
  }
};


//get all cart items
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await CartItem.findAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: ProductVariant,
          as: "variant",
          attributes: ["id", "size", "color", "stock"],
          include: [
            {
              model: Product,
              as: "product",
              attributes: [
                "id",
                "name",
                "price",
                "discount_percentage",
                "image_url",
                "is_active",
              ],
            },
          ],
        },
      ],
      order: [["id", "ASC"]],
    });

    let cartTotal = 0;

    const items = cartItems.map((item) => {
      const variant = item.variant;
      const product = variant.product;

      const originalPrice = Number(product.price);
      const discount = Number(product.discount_percentage || 0);

      const discountedPrice =
        Math.round(originalPrice * (1 - discount / 100) * 100) / 100;

      const subtotal =
        Math.round(discountedPrice * item.quantity * 100) / 100;

      cartTotal += subtotal;

      return {
        cart_item_id: item.id,
        product_id: product.id,
        variant_id: variant.id,
        name: product.name,
        image_url: product.image_url,
        size: variant.size,
        color: variant.color,
        stock: variant.stock,
        is_active: product.is_active,
        original_price: originalPrice,
        discount_percentage: discount,
        discounted_price: discountedPrice,
        quantity: item.quantity,
        subtotal,
      };
    });

    return res.status(200).json({
      success: true,
      total_items: items.reduce(
        (total, item) => total + item.quantity,
        0
      ),
      cart_total: Math.round(cartTotal * 100) / 100,
      items,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};


//update cart
const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body || {};

    // Validate cart item ID
    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        message: "Invalid cart item ID",
      });
    }

    // Validate quantity
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive integer",
      });
    }

    // Find cart item belonging to logged-in user
    const cartItem = await CartItem.findOne({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    // Check available stock
    const variant = await ProductVariant.findByPk(
      cartItem.variant_id,
      {
        include: [
          {
            model: Product,
            as: "product",
            where: { is_active: true },
            required: true,
          },
        ],
      }
    );

    if (!variant) {
      return res.status(404).json({
        message: "Product variant is unavailable",
      });
    }

    if (quantity > variant.stock) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock",
      });
    }

    // Update quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      cartItem,
    });
  } catch (error) {
    console.error("Update cart error:", error);

    return res.status(500).json({
      message: "Failed to update cart quantity",
    });
  }
};

//delete cart product
const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Validate cart item ID
    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
      });
    }

    // Find item belonging to logged-in user
    const cartItem = await CartItem.findOne({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Remove item from cart
    await cartItem.destroy();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
    });
  } catch (error) {
    console.error("Remove cart item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from cart",
    });
  }
};


module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeCartItem 
};
