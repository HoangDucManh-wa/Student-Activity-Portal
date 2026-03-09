const prisma = require("../../config/prisma");
const { generateId } = require("../../utils/id");
const AppError = require("../../utils/app-error");

const getListHoatDong = async (filters = {}) => {
  const search = filters.search || "";
  const maDanhMuc = filters.maDanhMuc || undefined;
  const maToChuc = filters.maToChuc || undefined;
  const trangThai = filters.trangThai || undefined;
  return await prisma.hoatDong.findMany({
    where: { 
      isDelete: false,
      ...(trangThai && { TrangThaiPheDuyet: trangThai }),
      ...(maDanhMuc && { MaDanhMuc: maDanhMuc }),
      ...(maToChuc && { MaToChuc: maToChuc }),
      ...(search && {
        TenHoatDong: {
          contains: search,
          mode: 'insensitive'
        }
      })
    },
    include: {
      toChuc: { select: { TenToChuc: true } },
      danhMuc: { select: { TenDanhMuc: true } }
    },
    orderBy: { createAt: 'desc' }
  });
};

const getHoatDongById = async (id) => {
  return await prisma.hoatDong.findFirst({
    where: { MaHoatDong: id, isDelete: false },
    include: {
      toChuc: { select: { TenToChuc: true, MoTa: true } },
      danhMuc: { select: { TenDanhMuc: true } }
    }
  });
};

const createHoatDong = async (data, userId) => {
  return await prisma.hoatDong.create({
    data: {
      MaHoatDong: generateId("HD"),
      ...data,
      TrangThaiPheDuyet: "CHO_DUYET",
      createBy: userId
    }
  });
};

const updateHoatDong = async (id, data) => {
  const { TrangThaiPheDuyet, trangThai, MaHoatDong, ...safeData } = data;
  return await prisma.hoatDong.update({
    where: { MaHoatDong: id },
    data: safeData
  });
};

const pheDuyetHoatDong = async (id, trangThaiHanhDong) => {
  return await prisma.hoatDong.update({
    where: { MaHoatDong: id },
    data: { 
      TrangThaiPheDuyet: trangThaiHanhDong 
    },
    include: {
      toChuc: { select: { TenToChuc: true } },
      danhMuc: { select: { TenDanhMuc: true } }
    }
  });
};

module.exports = {
  getListHoatDong,
  getHoatDongById,
  createHoatDong,
  updateHoatDong,
  pheDuyetHoatDong
};