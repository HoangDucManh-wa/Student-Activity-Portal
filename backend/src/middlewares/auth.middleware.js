const { verifyAccessToken, hashToken } = require("../utils/jwt");
const { redis } = require("../config/redis");
const prisma = require("../config/prisma");
const { REDIS_PREFIX } = require("../utils/constants");
const AppError = require("../utils/app-error");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("AUTH_TOKEN_MISSING");
    }

    const token = authHeader.split(" ")[1];

    // Check Redis blacklist
    const tokenHash = hashToken(token);
    const isBlacklisted = await redis.get(
      `${REDIS_PREFIX.BLACKLIST}${tokenHash}`
    );

    if (isBlacklisted) {
      throw new AppError("AUTH_TOKEN_BLACKLISTED");
    }

    // Verify signature + expiry
    const decoded = verifyAccessToken(token);

    // Check user
    const user = await prisma.nguoiDung.findFirst({
      where: { MaNguoiDung: decoded.id, isDelete: false },
      select: {
        MaNguoiDung: true,
        TenNguoiDung: true,
        Email: true,
        LoaiTaiKhoan: true,
        TrangThai: true,
      },
    });

    if (!user) {
      throw new AppError("USER_NOT_FOUND");
    }

    if (user.TrangThai === "KHOA") {
      throw new AppError("AUTH_ACCOUNT_LOCKED");
    }

    if (user.TrangThai === "CHO_DUYET") {
      throw new AppError("AUTH_ACCOUNT_PENDING");
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    }
    if (err.name === "TokenExpiredError") {
      return next(new AppError("AUTH_TOKEN_EXPIRED"));
    }
    if (err.name === "JsonWebTokenError") {
      return next(new AppError("AUTH_TOKEN_INVALID"));
    }
    next(err);
  }
};

module.exports = { protect };
