const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: "access" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { userId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES }
  );

  return { accessToken, refreshToken };
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateTokens,
  generateResetToken,
  verifyRefreshToken,
};
