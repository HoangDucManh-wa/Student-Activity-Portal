const registrationService = require("../services/registration.service");

// @desc    Register for event
// @route   POST /api/registrations
// @access  Private
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    const registration = await registrationService.registerForEvent(
      req.user.id,
      eventId,
    );

    res.status(201).json({
      success: true,
      message: "Đăng ký sự kiện thành công",
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/:eventId
// @access  Private
const cancelRegistration = async (req, res, next) => {
  try {
    const result = await registrationService.cancelRegistration(
      req.user.id,
      req.params.eventId,
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my registrations
// @route   GET /api/registrations/my
// @access  Private
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await registrationService.getUserRegistrations(
      req.user.id,
      req.query,
    );

    res.status(200).json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
};
