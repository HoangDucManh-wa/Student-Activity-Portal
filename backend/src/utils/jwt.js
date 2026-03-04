const jwt = require("jsonwebtoken");
const { createHash } = require("crypto");

const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const signRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

// Decode không verify signature (dùng khi cần đọc exp để tính TTL)
const decodeToken = (token) => {
  return jwt.decode(token);
};

// Hash token thành SHA-256 để dùng làm Redis key (tránh lưu token dài)
const hashToken = (token) => {
  return createHash("sha256").update(token).digest("hex");
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  hashToken,
};
