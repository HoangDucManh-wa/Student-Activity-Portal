const express = require("express");
const router = express.Router();
const {
  createClub,
  getClubs,
  getClubById,
  updateClub,
} = require("../controllers/club.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { USER_ROLES } = require("../utils/constants");

// Public routes
router.get("/", getClubs);
router.get("/:id", getClubById);

// Protected routes
router.post("/", protect, authorize(USER_ROLES.ADMIN), createClub);

router.put(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.CLUB_ADMIN),
  updateClub,
);

module.exports = router;
