const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Access token expired" });
    }
    return res.status(403).json({ error: "Invalid access token" });
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions[permission]) {
      return res.status(403).json({
        error: `Insufficient permissions. Required: ${permission}`,
      });
    }
    next();
  };
};

module.exports = { authenticateToken, requirePermission };

