const express = require("express");
const router = express.Router();
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
} = require("../controllers/registration.controller");
const { protect } = require("../middlewares/auth.middleware");

// All routes are protected (require authentication)
router.use(protect);

// @route   POST /api/registrations
router.post("/", registerForEvent);

// @route   GET /api/registrations/my
router.get("/my", getMyRegistrations);

// @route   DELETE /api/registrations/:eventId
router.delete("/:eventId", cancelRegistration);

module.exports = router;
