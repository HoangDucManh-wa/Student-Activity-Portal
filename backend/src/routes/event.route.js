const express = require("express");
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/event.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { USER_ROLES } = require("../utils/constants");

// Public routes
router.get("/", getEvents);
router.get("/:id", getEventById);

// Protected routes
router.post(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.CLUB_ADMIN),
  createEvent,
);

router.put(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.CLUB_ADMIN),
  updateEvent,
);

router.delete("/:id", protect, authorize(USER_ROLES.ADMIN), deleteEvent);

module.exports = router;
