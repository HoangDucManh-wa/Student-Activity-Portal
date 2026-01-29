const { USER_ROLES } = require("../utils/constants");

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập",
      });
    }
    next();
  };
};

// Check if user is admin of a specific club
const isClubAdmin = async (req, res, next) => {
  try {
    const Club = require("../models/Club");
    const clubId = req.params.clubId || req.body.club;

    const club = await Club.findById(clubId);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "CLB không tồn tại",
      });
    }

    // Check if user is admin or club admin
    const isAdmin = req.user.role === USER_ROLES.ADMIN;
    const isClubAdminUser = club.admins.some(
      (admin) => admin.toString() === req.user.id,
    );

    if (!isAdmin && !isClubAdminUser) {
      return res.status(403).json({
        success: false,
        message: "Bạn không phải admin của CLB này",
      });
    }

    req.club = club;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authorize,
  isClubAdmin,
};
