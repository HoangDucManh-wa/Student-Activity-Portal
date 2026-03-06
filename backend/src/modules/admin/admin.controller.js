const adminService = require("./admin.service");
const { success } = require("../../utils/response");

const getOverviewStats = async (req, res, next) => {
  try {
    const result = await adminService.getOverviewStats();
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const getActivityStats = async (req, res, next) => {
  try {
    const result = await adminService.getActivityStats();
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getOverviewStats, getActivityStats };
