const express = require("express");
const User = require("../models/User");
const {
  generateTokens,
  generateResetToken,
  verifyRefreshToken,
} = require("../utils/tokenUtils");
const { authenticateToken } = require("../middleware/auth");
const { validateSignup, validateLogin } = require("../middleware/validation");

const router = express.Router();

// Signup
router.post("/signup", validateSignup, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    const user = new User({ name, email, password });
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.status(201).json({
      message: "User created successfully",
      user,
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.json({
      message: "Login successful",
      user,
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh Token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(
      (t) => t.token === refreshToken
    );
    if (!tokenExists) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id
    );

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.token !== refreshToken
    );
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    res.json({
      tokens: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Refresh token expired" });
    }
    res.status(403).json({ error: "Invalid refresh token" });
  }
});

// Logout
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove the specific refresh token
      req.user.refreshTokens = req.user.refreshTokens.filter(
        (t) => t.token !== refreshToken
      );
    } else {
      // Remove all refresh tokens (logout from all devices)
      req.user.refreshTokens = [];
    }

    await req.user.save();

    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        message: "If email exists, password reset instructions have been sent",
      });
    }

    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // In a real app, you would send an email here
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      message: "If email exists, password reset instructions have been sent",
      // For testing purposes only - remove in production
      resetToken:
        process.env.NODE_ENV === "development" ? resetToken : undefined,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // Invalidate all refresh tokens on password reset
    user.refreshTokens = [];

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/profile", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
