const thongBaoService = require("./thong-bao.service");
const { success } = require("../../utils/response");

const sendNotification = async (req, res, next) => {
  try {
    const result = await thongBaoService.sendNotification(
      req.body,
      req.user.MaNguoiDung
    );
    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
};

const sendBulkNotification = async (req, res, next) => {
  try {
    const result = await thongBaoService.sendBulkNotification(
      req.body,
      req.user.MaNguoiDung
    );
    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
};

const getMyNotifications = async (req, res, next) => {
  try {
    const result = await thongBaoService.getMyNotifications(
      req.user.MaNguoiDung,
      req.query
    );
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const getNotificationById = async (req, res, next) => {
  try {
    const result = await thongBaoService.getNotificationById(
      req.params.id,
      req.user.MaNguoiDung
    );
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const result = await thongBaoService.markAsRead(
      req.params.id,
      req.user.MaNguoiDung
    );
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const result = await thongBaoService.markAllAsRead(req.user.MaNguoiDung);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    await thongBaoService.deleteNotification(
      req.params.id,
      req.user.MaNguoiDung
    );
    return success(res, { message: "Xóa thông báo thành công" });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const result = await thongBaoService.getUnreadCount(req.user.MaNguoiDung);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendNotification,
  sendBulkNotification,
  getMyNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getStats,
};
