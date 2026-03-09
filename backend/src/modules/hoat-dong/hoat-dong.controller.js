const hoatDongService = require("./hoat-dong.service");
const { success } = require("../../utils/response");
const AppError = require("../../utils/app-error");

const getHoatDongs = async (req, res, next) => {
  try {
    const result = await hoatDongService.getListHoatDong(req.query);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const getHoatDongById = async (req, res, next) => {
  try {
    const result = await hoatDongService.getHoatDongById(req.params.id);
    if (!result) throw new AppError("Không tìm thấy hoạt động", 404);
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

const updateHoatDong = async (req, res, next) => {
  try {
    const result = await hoatDongService.updateHoatDong(req.params.id, req.body);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const pheDuyetHoatDong = async (req, res, next) => {
  try {
    const { TrangThaiPheDuyet } = req.body;
    if (!TrangThaiPheDuyet) throw new AppError("Thiếu trạng thái phê duyệt", 400);

    const result = await hoatDongService.pheDuyetHoatDong(req.params.id, TrangThaiPheDuyet);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHoatDongs,
  getHoatDongById,
  createHoatDong,
  updateHoatDong,
  pheDuyetHoatDong
};