const { z } = require("zod");

const createActivitySchema = z.object({
  activityName: z.string().min(1, "Tên hoạt động là bắt buộc").max(255),
  description: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  locationLat: z.number().min(-90).max(90).optional().nullable(),
  locationLng: z.number().min(-180).max(180).optional().nullable(),
  locationName: z.string().max(500).optional().nullable(),
  activityType: z.enum(["program", "competition"]),
  teamMode: z.enum(["individual", "team", "both"]).default("individual"),
  startTime: z.coerce.date().optional().nullable(),
  endTime: z.coerce.date().optional().nullable(),
  registrationDeadline: z.coerce.date().optional().nullable(),
  minParticipants: z.coerce.number().int().min(1).optional().nullable(),
  maxParticipants: z.coerce.number().int().min(1).optional().nullable(),
  prize: z.string().optional().nullable(),
  organizationId: z.coerce.number().int().positive(),
  categoryId: z.coerce.number().int().positive(),
  registrationFormId: z.coerce.number().int().positive().optional().nullable(),
  teamRule: z.object({
    minTeamMembers: z.coerce.number().int().min(1).optional().nullable(),
    maxTeamMembers: z.coerce.number().int().min(1).optional().nullable(),
  }).optional().nullable(),
});

const updateActivitySchema = z.object({
  activityName: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  locationLat: z.number().min(-90).max(90).optional().nullable(),
  locationLng: z.number().min(-180).max(180).optional().nullable(),
  locationName: z.string().max(500).optional().nullable(),
  activityType: z.enum(["program", "competition"]).optional(),
  teamMode: z.enum(["individual", "team", "both"]).optional(),
  startTime: z.coerce.date().optional().nullable(),
  endTime: z.coerce.date().optional().nullable(),
  registrationDeadline: z.coerce.date().optional().nullable(),
  minParticipants: z.coerce.number().int().min(1).optional().nullable(),
  maxParticipants: z.coerce.number().int().min(1).optional().nullable(),
  prize: z.string().optional().nullable(),
  categoryId: z.coerce.number().int().positive().optional(),
  registrationFormId: z.coerce.number().int().positive().optional().nullable(),
  teamRule: z.object({
    minTeamMembers: z.coerce.number().int().min(1).optional().nullable(),
    maxTeamMembers: z.coerce.number().int().min(1).optional().nullable(),
  }).optional().nullable(),
});

const updateActivityStatusSchema = z.object({
  activityStatus: z.enum(["draft", "pending_review", "published", "running", "finished", "cancelled"]),
});

const getActivitiesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  organizationId: z.coerce.number().int().positive().optional(),
  activityStatus: z.enum(["draft", "pending_review", "published", "running", "finished", "cancelled"]).optional(),
  activityType: z.enum(["program", "competition"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortBy: z.enum(["startTime", "createdAt", "activityName"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const createCategorySchema = z.object({
  categoryName: z.string().min(1, "Tên danh mục là bắt buộc").max(255),
});

const createCheckinSessionSchema = z.object({
  checkInTime: z.coerce.date(),
  checkOutTime: z.coerce.date().optional().nullable(),
});

// Body for POST /activities/:id/checkin-sessions/open (all fields optional)
const openCheckinBodySchema = z.object({
  checkInTime: z.coerce.date().optional().nullable(),
  checkOutTime: z.coerce.date().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  radius: z.number().int().min(10).max(5000).optional().nullable(),
  placeName: z.string().optional().nullable(),
});

module.exports = {
  createActivitySchema,
  updateActivitySchema,
  updateActivityStatusSchema,
  getActivitiesQuerySchema,
  createCategorySchema,
  createCheckinSessionSchema,
  openCheckinBodySchema,
};
