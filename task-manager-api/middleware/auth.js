const jwt = require("jsonwebtoken");

/**
 * Required Authentication Middleware
 * Enforces valid Bearer JWT in Authorization header.
 * Attaches decoded user payload ({ id, email, role }) to req.user.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Authorization token missing or malformed. Expected 'Bearer <token>'",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_jwt_secret_dev_key_123456"
    );
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
        message: "Your session has expired. Please log in again.",
      });
    }
    return res.status(401).json({
      error: "Invalid token",
      message: "Authorization token is invalid.",
    });
  }
};

/**
 * Optional Authentication Middleware
 * If a valid Bearer token is provided, populates req.user.
 * If no token is provided, continues as a guest.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_jwt_secret_dev_key_123456"
    );
    req.user = decoded;
  } catch {
    // If token invalid, proceed without setting req.user
  }
  next();
};

module.exports = { requireAuth, optionalAuth };
