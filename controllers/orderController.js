const { sequelize } = require("../config/db");

const {
  CartItem,
  Product,
  ProductVariant,
  Order,
  OrderItem,
} = require("../models");

// PLACE ORDER
const placeOrder = async (req, res) => {
  let transaction;

  try {
    const userId = req.user.id;

    transaction = await sequelize.transaction();

    // Fetch cart items with product details
    const cartItems = await CartItem.findAll({
      where: { user_id: userId },
      include: [
        {
          model: ProductVariant,
          as: "variant",
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
      ],
      transaction,
    });

    if (cartItems.length === 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of cartItems) {
      const variant = await ProductVariant.findByPk(
        item.variant_id,
        {
          transaction,
          lock: transaction.LOCK.UPDATE,
        }
      );

      if (!variant) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "A product variant is no longer available",
        });
      }

      const product = await Product.findByPk(
        variant.product_id,
        { transaction }
      );

      if (!product || !product.is_active) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "A product in your cart is unavailable",
        });
      }

      if (item.quantity > variant.stock) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      // Calculate discounted price
      const originalPrice = Number(product.price);
      const discount = Number(
        product.discount_percentage || 0
      );

      const unitPrice = Math.round(
        originalPrice * (1 - discount / 100) * 100
      ) / 100;

      const subtotal = Math.round(
        unitPrice * item.quantity * 100
      ) / 100;

      totalAmount += subtotal;

      orderItemsData.push({
        variant_id: variant.id,
        product_name: product.name,
        size: variant.size,
        color: variant.color,
        quantity: item.quantity,
        unit_price: unitPrice,
      });

      // Reduce stock
      variant.stock -= item.quantity;

      await variant.save({ transaction });
    }

    // Create order
    const order = await Order.create(
      {
        user_id: userId,
        total_amount: Math.round(totalAmount * 100) / 100,
        status: "placed",
      },
      { transaction }
    );

    // Save order items
    await OrderItem.bulkCreate(
      orderItemsData.map((item) => ({
        ...item,
        order_id: order.id,
      })),
      { transaction }
    );

    // Clear customer's cart
    await CartItem.destroy({
      where: { user_id: userId },
      transaction,
    });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order_id: order.id,
      total_amount: Math.round(totalAmount * 100) / 100,
      status: order.status,
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }

    console.error("Place order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to place order",
    });
  }
};



const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch orders belonging to logged-in user
    const orders = await Order.findAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: OrderItem,
          as: "items",
          attributes: [
            "id",
            "product_name",
            "size",
            "color",
            "quantity",
            "unit_price",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formattedOrders = orders.map((order) => ({
      order_id: order.id,
      total_amount: Number(order.total_amount),
      status: order.status,
      order_date: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        product_name: item.product_name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        subtotal:
          Math.round(
            Number(item.unit_price) * item.quantity * 100
          ) / 100,
      })),
    }));

    return res.status(200).json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order history",
    });
  }
};


module.exports = {
  placeOrder,
  getOrders 
};
