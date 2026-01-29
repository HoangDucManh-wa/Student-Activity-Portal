const clubService = require("../services/club.service");

// @desc    Create new club
// @route   POST /api/clubs
// @access  Private (Admin)
const createClub = async (req, res, next) => {
  try {
    const club = await clubService.createClub(req.body);

    res.status(201).json({
      success: true,
      message: "Tạo CLB thành công",
      data: club,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
const getClubs = async (req, res, next) => {
  try {
    const clubs = await clubService.getClubs(req.query);

    res.status(200).json({
      success: true,
      data: clubs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single club
// @route   GET /api/clubs/:id
// @access  Public
const getClubById = async (req, res, next) => {
  try {
    const club = await clubService.getClubById(req.params.id);

    res.status(200).json({
      success: true,
      data: club,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update club
// @route   PUT /api/clubs/:id
// @access  Private (Admin/Club Admin)
const updateClub = async (req, res, next) => {
  try {
    const club = await clubService.updateClub(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Cập nhật CLB thành công",
      data: club,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClub,
  getClubs,
  getClubById,
  updateClub,
};
