// const {
//   createActivity,
//   getActivityById,
//   getActivities,
//   updateActivity,
//   deleteActivity,
//   searchActivities,
// } = require("../activities.repository");

// /**
//  * ==========================================
//  * Create Activity
//  * ==========================================
//  */
// const createActivityService = async (data) => {
//   try {
//     return await createActivity(data);
//   } catch (error) {
//     console.log(error);
//     throw new Error("Failed to create activity");
//   }
// };

// /**
//  * ==========================================
//  * Get Activity By ID
//  * ==========================================
//  */
// const getActivityByIdService = async (activityId) => {
//   const activity = await getActivityById(activityId);

//   if (!activity) {
//     throw new Error("Activity not found");
//   }

//   return activity;
// };

// /**
//  * ==========================================
//  * Get Activities (Pagination)
//  * ==========================================
//  */
// const getActivitiesService = async (page = 1, limit = 10) => {
//   const skip = (page - 1) * limit;

//   return getActivities({
//     skip,
//     take: limit,
//   });
// };

// /**
//  * ==========================================
//  * Update Activity
//  * ==========================================
//  */
// const updateActivityService = async (activityId, data) => {
//   const activity = await getActivityById(activityId);

//   if (!activity) {
//     throw new Error("Activity not found");
//   }

//   return updateActivity(activityId, data);
// };

// /**
//  * ==========================================
//  * Delete Activity
//  * ==========================================
//  */
// const deleteActivityService = async (activityId, userId) => {
//   const activity = await getActivityById(activityId);

//   if (!activity) {
//     throw new Error("Activity not found");
//   }

//   return deleteActivity(activityId, userId);
// };

// /**
//  * ==========================================
//  * Search Activities
//  * ==========================================
//  */
// const searchActivitiesService = async (keyword) => {
//   if (!keyword) {
//     return [];
//   }

//   return searchActivities(keyword);
// };

// module.exports = {
//   createActivityService,
//   getActivityByIdService,
//   getActivitiesService,
//   updateActivityService,
//   deleteActivityService,
//   searchActivitiesService,
// };
