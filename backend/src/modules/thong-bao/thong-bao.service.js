const prisma = require("../../config/prisma");
const { getNotificationQueue } = require("../../config/bullmq");
const { generateId } = require("../../utils/id");
const AppError = require("../../utils/app-error");
const {
  TRANG_THAI_THONG_BAO,
  LOAI_THONG_BAO,
  TRANG_THAI_NGUOI_DUNG,
} = require("../../utils/constants");

// ─── Send single notification ────────────────────────────────────────────────

const sendNotification = async (
  { TieuDe, NoiDung, MaNguoiDung, LoaiThongBao, KenhGui },
  createdBy
) => {
  const thongBao = await prisma.thongBao.create({
    data: {
      MaThongBao: generateId("TB"),
      TieuDe,
      NoiDung,
      LoaiThongBao: LoaiThongBao || LOAI_THONG_BAO.HE_THONG,
      TrangThai: TRANG_THAI_THONG_BAO.CHUA_DOC,
      MaNguoiDung,
      createBy: createdBy,
    },
  });

  const externalChannels = KenhGui.filter((k) => k !== "IN_APP");
  if (externalChannels.length > 0) {
    const queue = getNotificationQueue();
    await queue.add("send-notification", {
      maThongBao: thongBao.MaThongBao,
      maNguoiDung: MaNguoiDung,
      tieuDe: TieuDe,
      noiDung: NoiDung,
      kenhGui: externalChannels,
    });
  }

  return thongBao;
};

// ─── Send bulk notification ──────────────────────────────────────────────────

const sendBulkNotification = async (payload, createdBy) => {
  const {
    TieuDe,
    NoiDung,
    LoaiThongBao,
    KenhGui,
    DanhSachNguoiDung,
    MaToChuc,
    TatCa,
    ThoiGianGui,
  } = payload;

  let userIds = [];

  if (DanhSachNguoiDung && DanhSachNguoiDung.length > 0) {
    userIds = DanhSachNguoiDung;
  } else if (MaToChuc) {
    const members = await prisma.thanhVienToChuc.findMany({
      where: { MaToChuc, isDelete: false },
      select: { MaNguoiDung: true },
    });
    userIds = members.map((m) => m.MaNguoiDung);
  } else if (TatCa) {
    const users = await prisma.nguoiDung.findMany({
      where: { isDelete: false, TrangThai: TRANG_THAI_NGUOI_DUNG.HOAT_DONG },
      select: { MaNguoiDung: true },
    });
    userIds = users.map((u) => u.MaNguoiDung);
  }

  if (userIds.length === 0) {
    throw new AppError("NOTIFICATION_NO_RECIPIENTS");
  }

  const notificationData = userIds.map((uid) => ({
    MaThongBao: generateId("TB"),
    TieuDe,
    NoiDung,
    LoaiThongBao: LoaiThongBao || LOAI_THONG_BAO.HE_THONG,
    TrangThai: TRANG_THAI_THONG_BAO.CHUA_DOC,
    MaNguoiDung: uid,
    createBy: createdBy,
  }));

  await prisma.thongBao.createMany({ data: notificationData });

  const externalChannels = KenhGui.filter((k) => k !== "IN_APP");
  if (externalChannels.length > 0) {
    const queue = getNotificationQueue();
    const delay = ThoiGianGui
      ? Math.max(0, new Date(ThoiGianGui).getTime() - Date.now())
      : 0;

    const jobs = userIds.map((uid) => ({
      name: "send-notification",
      data: {
        maNguoiDung: uid,
        tieuDe: TieuDe,
        noiDung: NoiDung,
        kenhGui: externalChannels,
      },
      opts: delay > 0 ? { delay } : {},
    }));

    await queue.addBulk(jobs);
  }

  return { totalSent: userIds.length };
};

// ─── Get my notifications (paginated) ────────────────────────────────────────

const getMyNotifications = async (
  maNguoiDung,
  { page = 1, limit = 20, LoaiThongBao, TrangThai }
) => {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 20;

  const where = {
    MaNguoiDung: maNguoiDung,
    isDelete: false,
    ...(LoaiThongBao && { LoaiThongBao }),
    ...(TrangThai && { TrangThai }),
  };

  const [data, total] = await Promise.all([
    prisma.thongBao.findMany({
      where,
      orderBy: { ThoiGianThongBao: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.thongBao.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

// ─── Get single notification ─────────────────────────────────────────────────

const getNotificationById = async (maThongBao, maNguoiDung) => {
  const thongBao = await prisma.thongBao.findFirst({
    where: { MaThongBao: maThongBao, MaNguoiDung: maNguoiDung, isDelete: false },
  });

  if (!thongBao) {
    throw new AppError("NOTIFICATION_NOT_FOUND");
  }

  return thongBao;
};

// ─── Mark as read ────────────────────────────────────────────────────────────

const markAsRead = async (maThongBao, maNguoiDung) => {
  const thongBao = await prisma.thongBao.findFirst({
    where: { MaThongBao: maThongBao, MaNguoiDung: maNguoiDung, isDelete: false },
  });

  if (!thongBao) {
    throw new AppError("NOTIFICATION_NOT_FOUND");
  }

  return prisma.thongBao.update({
    where: { MaThongBao: maThongBao },
    data: { TrangThai: TRANG_THAI_THONG_BAO.DA_DOC },
  });
};

// ─── Mark all as read ────────────────────────────────────────────────────────

const markAllAsRead = async (maNguoiDung) => {
  const result = await prisma.thongBao.updateMany({
    where: {
      MaNguoiDung: maNguoiDung,
      TrangThai: TRANG_THAI_THONG_BAO.CHUA_DOC,
      isDelete: false,
    },
    data: { TrangThai: TRANG_THAI_THONG_BAO.DA_DOC },
  });

  return { updated: result.count };
};

// ─── Soft delete ─────────────────────────────────────────────────────────────

const deleteNotification = async (maThongBao, maNguoiDung) => {
  const thongBao = await prisma.thongBao.findFirst({
    where: { MaThongBao: maThongBao, MaNguoiDung: maNguoiDung, isDelete: false },
  });

  if (!thongBao) {
    throw new AppError("NOTIFICATION_NOT_FOUND");
  }

  return prisma.thongBao.update({
    where: { MaThongBao: maThongBao },
    data: { isDelete: true, deleteBy: maNguoiDung },
  });
};

// ─── Unread count ────────────────────────────────────────────────────────────

const getUnreadCount = async (maNguoiDung) => {
  const count = await prisma.thongBao.count({
    where: {
      MaNguoiDung: maNguoiDung,
      TrangThai: TRANG_THAI_THONG_BAO.CHUA_DOC,
      isDelete: false,
    },
  });

  return { unreadCount: count };
};

module.exports = {
  sendNotification,
  sendBulkNotification,
  getMyNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
