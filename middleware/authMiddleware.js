
const { verifyToken } = require("../utils/jwtHelper");
const { User } = require("../models");

const authMiddleware = async (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization token is required",
      });
    }

    // Expected format: Bearer <token>
    const parts = authHeader.split(" ");

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer" ||
      !parts[1]
    ) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    const token = parts[1];

    // Verify JWT signature and expiration
    const decoded = verifyToken(token);

    // Check whether user still exists and is active
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.is_active) {
      return res.status(401).json({
        message: "Invalid or inactive user",
      });
    }

    // Attach authenticated user details to request
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = authMiddleware;
