const { z } = require("zod");

const registerSchema = z.object({
  TenNguoiDung: z.string().min(2, "Tên phải có ít nhất 2 ký tự").max(255),
  Email: z.string().email("Email không hợp lệ"),
  MatKhau: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  MaSV: z.string().max(50).optional(),
  SDT: z.string().max(20).optional(),
});

const loginSchema = z.object({
  Email: z.string().email("Email không hợp lệ"),
  MatKhau: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

const forgotPasswordSchema = z.object({
  Email: z.string().email("Email không hợp lệ"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token không hợp lệ"),
  MatKhauMoi: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
});

const changePasswordSchema = z.object({
  MatKhauCu: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
  MatKhauMoi: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};
