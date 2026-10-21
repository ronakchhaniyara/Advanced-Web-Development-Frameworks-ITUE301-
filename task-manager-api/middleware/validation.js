/**
 * Input validation middlewares for request body sanitization and verification.
 */

const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("Name is required");
  }

  if (!email || typeof email !== "string" || !email.trim()) {
    errors.push("Email is required");
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("Valid email address is required");
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation Error",
      details: errors,
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== "string" || !email.trim()) {
    errors.push("Email is required");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation Error",
      details: errors,
    });
  }

  next();
};

const validateTask = (req, res, next) => {
  const { title, priority } = req.body;
  const errors = [];

  if (!title || typeof title !== "string" || !title.trim()) {
    errors.push("Task title is required");
  }

  if (priority && !["low", "medium", "high"].includes(priority.toLowerCase())) {
    errors.push("Priority must be either low, medium, or high");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation Error",
      details: errors,
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateTask,
};
