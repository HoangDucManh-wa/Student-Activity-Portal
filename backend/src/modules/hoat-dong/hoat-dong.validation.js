const { z } = require("zod");

const createHoatDongSchema = z.object({
  TenHoatDong: z.string().min(5, "Tên hoạt động quá ngắn"),
  MaToChuc: z.string().min(1, "Thiếu mã tổ chức"),
  MaDanhMuc: z.string().min(1, "Thiếu mã danh mục"),
  ThoiGianBatDau: z.string().datetime().optional(),
  ThoiGianKetThuc: z.string().datetime().optional(),
  HanDangKy: z.string().datetime().optional(),
  DiaDiem: z.string().min(1, "Thiếu địa điểm").optional(),
  SoLuongNguoiToiDa: z.number().int().positive().optional(),
  DangKyNhom: z.boolean().optional().default(false),
  MoTa: z.string().optional(),
  AnhBia: z.string().optional(),
});

module.exports = { createHoatDongSchema };