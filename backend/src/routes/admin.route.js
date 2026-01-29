const express = require("express");
const router = express.Router();
const {
  getEventRegistrations,
  getDashboardStats,
} = require("../controllers/admin.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { USER_ROLES } = require("../utils/constants");

// All routes require admin authentication
router.use(protect);
router.use(authorize(USER_ROLES.ADMIN, USER_ROLES.CLUB_ADMIN));

// @route   GET /api/admin/events/:eventId/registrations
router.get("/events/:eventId/registrations", getEventRegistrations);

// @route   GET /api/admin/stats
router.get("/stats", authorize(USER_ROLES.ADMIN), getDashboardStats);

module.exports = router;
