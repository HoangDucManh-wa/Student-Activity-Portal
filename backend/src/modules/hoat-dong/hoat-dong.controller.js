const hoatDongService = require("./hoat-dong.service");
const { success } = require("../../utils/response");

const getHoatDongs = async (req, res, next) => {
  try {
    const result = await hoatDongService.getListHoatDong();
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const createHoatDong = async (req, res, next) => {
  try {
    const result = await hoatDongService.createHoatDong(req.body, req.user.MaNguoiDung);
    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHoatDongs,
  createHoatDong
};