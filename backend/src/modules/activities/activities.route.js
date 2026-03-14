const express = require("express");

const {
  createActivityController,
  getActivityByIdController,
  getActivitiesController,
  updateActivityController,
  deleteActivityController,
  searchActivitiesController,
} = require("./activities.controller");

const router = express.Router();

/**
 * ==========================================
 * Activities Routes
 * ==========================================
 */

// Get activities (homepage)
router.get("/", getActivitiesController);

// Search activities
router.get("/search", searchActivitiesController);

// Get activity by ID
router.get("/:activityId", getActivityByIdController);

// Create activity
router.post("/", createActivityController);

// Update activity
router.put("/:activityId", updateActivityController);

// Delete activity
router.delete("/:activityId", deleteActivityController);

module.exports = router;
