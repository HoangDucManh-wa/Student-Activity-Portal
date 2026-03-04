const AppError = require("../utils/app-error");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.LoaiTaiKhoan)) {
      throw new AppError("FORBIDDEN");
    }
    next();
  };
};

module.exports = { authorize };
