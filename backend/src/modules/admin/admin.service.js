const prisma = require("../../config/prisma");
const { TRANG_THAI_NGUOI_DUNG } = require("../../utils/constants");

const getOverviewStats = async () => {
  const [totalUsers, activeUsers, totalActivities, totalClubs, totalRegistrations] =
    await Promise.all([
      prisma.nguoiDung.count({ where: { isDelete: false } }),
      prisma.nguoiDung.count({
        where: { isDelete: false, TrangThai: TRANG_THAI_NGUOI_DUNG.HOAT_DONG },
      }),
      prisma.hoatDong.count({ where: { isDelete: false } }),
      prisma.toChuc.count({ where: { isDelete: false } }),
      prisma.phieuDangKy.count({ where: { isDelete: false } }),
    ]);

  return {
    totalUsers,
    activeUsers,
    totalActivities,
    totalClubs,
    totalRegistrations,
  };
};

const getActivityStats = async () => {
  const [byStatus, byCategory] = await Promise.all([
    prisma.hoatDong.groupBy({
      by: ["TrangThaiPheDuyet"],
      where: { isDelete: false },
      _count: { MaHoatDong: true },
    }),
    prisma.hoatDong.groupBy({
      by: ["MaDanhMuc"],
      where: { isDelete: false },
      _count: { MaHoatDong: true },
    }),
  ]);

  const categoryIds = byCategory.map((c) => c.MaDanhMuc);
  const categories = await prisma.danhMucHoatDong.findMany({
    where: { MaDanhMuc: { in: categoryIds } },
    select: { MaDanhMuc: true, TenDanhMuc: true },
  });

  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.MaDanhMuc, c.TenDanhMuc])
  );

  return {
    byStatus: byStatus.map((s) => ({
      trangThai: s.TrangThaiPheDuyet,
      soLuong: s._count.MaHoatDong,
    })),
    byCategory: byCategory.map((c) => ({
      maDanhMuc: c.MaDanhMuc,
      tenDanhMuc: categoryMap[c.MaDanhMuc] || "Unknown",
      soLuong: c._count.MaHoatDong,
    })),
  };
};

module.exports = { getOverviewStats, getActivityStats };
