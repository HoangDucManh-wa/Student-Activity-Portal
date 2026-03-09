const prisma = require("../../config/prisma");
const { generateId } = require("../../utils/id");
const AppError = require("../../utils/app-error");

const getListHoatDong = async (filters = {}) => {
  return await prisma.hoatDong.findMany({
    where: { 
      isDelete: false,
      ...filters 
    },
    include: {
      toChuc: { select: { TenToChuc: true } },
      danhMuc: { select: { TenDanhMuc: true } }
    },
    orderBy: { createAt: 'desc' }
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

module.exports = {
  getListHoatDong,
  createHoatDong
};