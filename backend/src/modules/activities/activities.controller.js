const {
  createActivityService,
  getActivityByIdService,
  getActivitiesService,
  updateActivityService,
  deleteActivityService,
  searchActivitiesService,
} = require("./activities.service");

/**
 * ==========================================
 * Create Activity
 * ==========================================
 */
const createActivityController = async (req, res, next) => {
  try {
    const activity = await createActivityService(req.body);

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ==========================================
 * Get Activity By ID
 * ==========================================
 */
const getActivityByIdController = async (req, res, next) => {
  try {
    const { activityId } = req.params;

    const activity = await getActivityByIdService(Number(activityId));

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ==========================================
 * Get Activities (Pagination)
 * ==========================================
 */
const getActivitiesController = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const activities = await getActivitiesService(page, limit);

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ==========================================
 * Update Activity
 * ==========================================
 */
const updateActivityController = async (req, res, next) => {
  try {
    const { activityId } = req.params;

    const activity = await updateActivityService(Number(activityId), req.body);

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ==========================================
 * Delete Activity
 * ==========================================
 */
const deleteActivityController = async (req, res, next) => {
  try {
    const { activityId } = req.params;

    const activity = await deleteActivityService(
      Number(activityId),
      req.user?.userId,
    );

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ==========================================
 * Search Activities
 * ==========================================
 */
const searchActivitiesController = async (req, res, next) => {
  try {
    const { keyword } = req.query;

    const activities = await searchActivitiesService(keyword);

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createActivityController,
  getActivityByIdController,
  getActivitiesController,
  updateActivityController,
  deleteActivityController,
  searchActivitiesController,
};
