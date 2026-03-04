const bcrypt = require("bcryptjs");
const { randomBytes } = require("crypto");

const prisma = require("../../config/prisma");
const { redis } = require("../../config/redis");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  decodeToken,
  hashToken,
} = require("../../utils/jwt");
const { generateId } = require("../../utils/id");
const { sendPasswordResetEmail, sendWelcomeEmail } = require("../../utils/mailer");
const {
  LOAI_TAI_KHOAN,
  TRANG_THAI_NGUOI_DUNG,
  REDIS_PREFIX,
  RESET_PASSWORD_TTL,
} = require("../../utils/constants");
const AppError = require("../../utils/app-error");

// ─── Helpers ─────────────────────────────────────────────────────────────────

const buildTokens = (userId, role) => {
  const payload = { id: userId, role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

const storeRefreshToken = async (userId, refreshToken) => {
  const decoded = decodeToken(refreshToken);
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  await redis.setex(`${REDIS_PREFIX.REFRESH}${userId}`, ttl, refreshToken);
};

// ─── Service functions ────────────────────────────────────────────────────────

const register = async ({ TenNguoiDung, Email, MatKhau, MaSV, SDT }) => {
  const existing = await prisma.nguoiDung.findUnique({ where: { Email } });
  if (existing) {
    throw new AppError("AUTH_EMAIL_EXISTS");
  }

  const hashed = await bcrypt.hash(MatKhau, 12);

  const user = await prisma.nguoiDung.create({
    data: {
      MaNguoiDung: generateId("ND"),
      TenNguoiDung,
      Email,
      MatKhau: hashed,
      MaSV: MaSV || null,
      SDT: SDT || null,
      LoaiTaiKhoan: LOAI_TAI_KHOAN.SINH_VIEN,
      TrangThai: TRANG_THAI_NGUOI_DUNG.HOAT_DONG,
    },
    select: {
      MaNguoiDung: true,
      TenNguoiDung: true,
      Email: true,
      LoaiTaiKhoan: true,
      TrangThai: true,
    },
  });

  sendWelcomeEmail({ to: Email, name: TenNguoiDung }).catch(() => {});

  const { accessToken, refreshToken } = buildTokens(
    user.MaNguoiDung,
    user.LoaiTaiKhoan
  );
  await storeRefreshToken(user.MaNguoiDung, refreshToken);

  return { user, accessToken, refreshToken };
};

const login = async ({ Email, MatKhau }) => {
  const user = await prisma.nguoiDung.findUnique({ where: { Email } });

  if (!user || !(await bcrypt.compare(MatKhau, user.MatKhau))) {
    throw new AppError("AUTH_INVALID_CREDS");
  }

  if (user.TrangThai === TRANG_THAI_NGUOI_DUNG.KHOA) {
    throw new AppError("AUTH_ACCOUNT_LOCKED");
  }

  if (user.TrangThai === TRANG_THAI_NGUOI_DUNG.CHO_DUYET) {
    throw new AppError("AUTH_ACCOUNT_PENDING");
  }

  const { accessToken, refreshToken } = buildTokens(
    user.MaNguoiDung,
    user.LoaiTaiKhoan
  );
  await storeRefreshToken(user.MaNguoiDung, refreshToken);

  return {
    user: {
      MaNguoiDung: user.MaNguoiDung,
      TenNguoiDung: user.TenNguoiDung,
      Email: user.Email,
      LoaiTaiKhoan: user.LoaiTaiKhoan,
      TrangThai: user.TrangThai,
    },
    accessToken,
    refreshToken,
  };
};

const logout = async (token, userId) => {
  const decoded = decodeToken(token);
  const now = Math.floor(Date.now() / 1000);
  const remainingTtl = decoded.exp - now;

  if (remainingTtl > 0) {
    const tokenHash = hashToken(token);
    await redis.setex(
      `${REDIS_PREFIX.BLACKLIST}${tokenHash}`,
      remainingTtl,
      "1"
    );
  }

  await redis.del(`${REDIS_PREFIX.REFRESH}${userId}`);
};

const refreshToken = async (token) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new AppError("AUTH_REFRESH_INVALID");
  }

  const stored = await redis.get(`${REDIS_PREFIX.REFRESH}${decoded.id}`);
  if (stored !== token) {
    throw new AppError("AUTH_REFRESH_INVALID");
  }

  const newAccessToken = signAccessToken({ id: decoded.id, role: decoded.role });
  return { accessToken: newAccessToken };
};

const forgotPassword = async (email) => {
  const user = await prisma.nguoiDung.findUnique({ where: { Email: email } });

  if (!user || user.isDelete) return;

  const resetToken = randomBytes(32).toString("hex");
  await redis.setex(
    `${REDIS_PREFIX.RESET_PASSWORD}${resetToken}`,
    RESET_PASSWORD_TTL,
    user.MaNguoiDung
  );

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await sendPasswordResetEmail({
    to: user.Email,
    name: user.TenNguoiDung,
    resetUrl,
  }).catch(() => {});
};

const resetPassword = async (token, MatKhauMoi) => {
  const redisKey = `${REDIS_PREFIX.RESET_PASSWORD}${token}`;
  const userId = await redis.get(redisKey);

  if (!userId) {
    throw new AppError("AUTH_RESET_INVALID");
  }

  const hashed = await bcrypt.hash(MatKhauMoi, 12);

  await prisma.nguoiDung.update({
    where: { MaNguoiDung: userId },
    data: { MatKhau: hashed },
  });

  await redis.del(redisKey);
};

const changePassword = async (userId, MatKhauCu, MatKhauMoi) => {
  const user = await prisma.nguoiDung.findUnique({
    where: { MaNguoiDung: userId },
  });

  if (!(await bcrypt.compare(MatKhauCu, user.MatKhau))) {
    throw new AppError("AUTH_WRONG_PASSWORD");
  }

  const hashed = await bcrypt.hash(MatKhauMoi, 12);

  await prisma.nguoiDung.update({
    where: { MaNguoiDung: userId },
    data: { MatKhau: hashed },
  });
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
};
