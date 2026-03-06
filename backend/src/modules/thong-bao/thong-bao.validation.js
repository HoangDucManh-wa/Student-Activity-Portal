const { z } = require("zod");

const sendNotificationSchema = z.object({
  TieuDe: z.string().min(1, "Tiêu đề không được để trống").max(255),
  NoiDung: z.string().min(1, "Nội dung không được để trống"),
  MaNguoiDung: z.string().min(1, "Mã người dùng không hợp lệ"),
  LoaiThongBao: z
    .enum(["HE_THONG", "HOAT_DONG", "CLB", "TUYEN_DUNG"])
    .optional()
    .default("HE_THONG"),
  KenhGui: z
    .array(z.enum(["IN_APP", "EMAIL", "SMS"]))
    .optional()
    .default(["IN_APP"]),
});

const sendBulkNotificationSchema = z.object({
  TieuDe: z.string().min(1, "Tiêu đề không được để trống").max(255),
  NoiDung: z.string().min(1, "Nội dung không được để trống"),
  LoaiThongBao: z
    .enum(["HE_THONG", "HOAT_DONG", "CLB", "TUYEN_DUNG"])
    .optional()
    .default("HE_THONG"),
  KenhGui: z
    .array(z.enum(["IN_APP", "EMAIL", "SMS"]))
    .optional()
    .default(["IN_APP"]),
  DanhSachNguoiDung: z.array(z.string()).optional(),
  MaToChuc: z.string().optional(),
  TatCa: z.boolean().optional(),
  ThoiGianGui: z.string().datetime().optional(),
});

const getNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  LoaiThongBao: z.enum(["HE_THONG", "HOAT_DONG", "CLB", "TUYEN_DUNG"]).optional(),
  TrangThai: z.enum(["CHUA_DOC", "DA_DOC"]).optional(),
});

module.exports = {
  sendNotificationSchema,
  sendBulkNotificationSchema,
  getNotificationsSchema,
};
