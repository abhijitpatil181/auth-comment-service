const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};

const validateSignup = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidationErrors,
];

const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

const validateComment = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment must be between 1 and 1000 characters"),
  handleValidationErrors,
];

const validatePermissions = [
  body("permissions.read")
    .optional()
    .isBoolean()
    .withMessage("Read permission must be boolean"),
  body("permissions.write")
    .optional()
    .isBoolean()
    .withMessage("Write permission must be boolean"),
  body("permissions.delete")
    .optional()
    .isBoolean()
    .withMessage("Delete permission must be boolean"),
  handleValidationErrors,
];

module.exports = {
  validateSignup,
  validateLogin,
  validateComment,
  validatePermissions,
  handleValidationErrors,
};
