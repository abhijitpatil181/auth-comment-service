const express = require("express");
const Comment = require("../models/Comment");
const { authenticateToken, requirePermission } = require("../middleware/auth");
const { validateComment } = require("../middleware/validation");

const router = express.Router();

// Get all comments (public endpoint with optional auth for permission-based filtering)
router.get("/", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const hasToken = authHeader && authHeader.split(" ")[1];

    // If no token provided, return empty array (no read permission)
    if (!hasToken) {
      return res.json({
        comments: [],
        message: "Authentication required to view comments",
      });
    }

    // Verify token and check read permission
    try {
      const jwt = require("jsonwebtoken");
      const User = require("../models/User");

      const decoded = jwt.verify(hasToken, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || !user.permissions.read) {
        return res.json({
          comments: [],
          message: "Read permission required to view comments",
        });
      }

      const comments = await Comment.find({})
        .populate("author", "name email")
        .sort({ createdAt: -1 });

      res.json({ comments });
    } catch (error) {
      return res.json({
        comments: [],
        message: "Invalid token",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new comment
router.post(
  "/",
  authenticateToken,
  requirePermission("write"),
  validateComment,
  async (req, res) => {
    try {
      const { content } = req.body;

      const comment = new Comment({
        content,
        author: req.user._id,
        authorName: req.user.name,
      });

      await comment.save();
      await comment.populate("author", "name email");

      res.status(201).json({
        message: "Comment added successfully",
        comment,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete a comment
router.delete(
  "/:commentId",
  authenticateToken,
  requirePermission("delete"),
  async (req, res) => {
    try {
      const { commentId } = req.params;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      await Comment.findByIdAndDelete(commentId);

      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get comments by user
router.get(
  "/user/:userId",
  authenticateToken,
  requirePermission("read"),
  async (req, res) => {
    try {
      const { userId } = req.params;

      const comments = await Comment.find({ author: userId })
        .populate("author", "name email")
        .sort({ createdAt: -1 });

      res.json({ comments });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;