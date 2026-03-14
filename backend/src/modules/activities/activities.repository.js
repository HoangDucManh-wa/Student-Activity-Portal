const prisma = require("../../config/prisma");

/**
 * ==========================================
 * Create Activity
 * ==========================================
 */
const createActivity = async (data) => {
  return prisma.activity.create({
    data,
  });
};

/**
 * ==========================================
 * Get Activity By ID
 * ==========================================
 */
const getActivityById = async (activityId) => {
  return prisma.activity.findFirst({
    where: {
      activityId,
      isDeleted: false,
    },
    include: {
      category: true,
      organization: true,
      activityTeamRule: true,
    },
  });
};

/**
 * ==========================================
 * Get All Activities (Home page)
 * ==========================================
 */
const getActivities = async ({ skip = 0, take = 10 }) => {
  return prisma.activity.findMany({
    where: {
      isDeleted: false,
      activityStatus: "published",
    },
    skip,
    take,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
      organization: true,
    },
  });
};

/**
 * ==========================================
 * Update Activity
 * ==========================================
 */
const updateActivity = async (activityId, data) => {
  return prisma.activity.update({
    where: {
      activityId,
    },
    data,
  });
};

/**
 * ==========================================
 * Soft Delete Activity
 * ==========================================
 */
const deleteActivity = async (activityId, userId) => {
  return prisma.activity.update({
    where: {
      activityId,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
    },
  });
};

/**
 * ==========================================
 * Search Activities
 * ==========================================
 */
const searchActivities = async (keyword) => {
  return prisma.activity.findMany({
    where: {
      isDeleted: false,
      activityStatus: "published",
      activityName: {
        contains: keyword,
        mode: "insensitive",
      },
    },
    include: {
      category: true,
      organization: true,
    },
  });
};

module.exports = {
  createActivity,
  getActivityById,
  getActivities,
  updateActivity,
  deleteActivity,
  searchActivities,
};
