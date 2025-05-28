const express = require("express");
const User = require("../models/User");
const { authenticateToken, requirePermission } = require("../middleware/auth");
const { validatePermissions } = require("../middleware/validation");

const router = express.Router();

// Get all users (admin-like functionality)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const users = await User.find(
      {},
      "-password -refreshTokens -resetPasswordToken -resetPasswordExpires"
    );
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get("/:userId", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(
      req.params.userId,
      "-password -refreshTokens -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user permissions
router.put(
  "/:userId/permissions",
  authenticateToken,
  validatePermissions,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { permissions } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update permissions
      if (permissions.read !== undefined)
        user.permissions.read = permissions.read;
      if (permissions.write !== undefined)
        user.permissions.write = permissions.write;
      if (permissions.delete !== undefined)
        user.permissions.delete = permissions.delete;

      await user.save();

      res.json({
        message: "Permissions updated successfully",
        user,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
