const registrationService = require("../services/registration.service");
const Event = require("../models/Event");
const User = require("../models/User");

// @desc    Get registrations for an event
// @route   GET /api/admin/events/:eventId/registrations
// @access  Private (Admin/Club Admin)
const getEventRegistrations = async (req, res, next) => {
  try {
    const registrations = await registrationService.getEventRegistrations(
      req.params.eventId,
    );

    res.status(200).json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalEvents = await Event.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ isActive: true });
    const upcomingEvents = await Event.countDocuments({
      status: "upcoming",
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        totalUsers,
        upcomingEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEventRegistrations,
  getDashboardStats,
};
