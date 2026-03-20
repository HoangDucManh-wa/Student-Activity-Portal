const prisma = require("../../config/prisma");
const AppError = require("../../utils/app-error");
const cache = require("../../utils/cache");
const { ACTIVITY_STATUS, VALID_STATUS_TRANSITIONS, CONFIG_KEYS, ORG_MEMBER_ROLE } = require("../../utils/constants");
const { isAdminOrOrgLeader } = require("../../utils/permissions");
const { resolveFields, resolveNested } = require("../../utils/s3-helpers");

// ─── Create activity ────────────────────────────────────────────────────────

const createActivity = async (data, userId, roles) => {
  const { teamRule, ...activityData } = data;

  // Verify organization exists
  const org = await prisma.organization.findFirst({
    where: { organizationId: activityData.organizationId, isDeleted: false },
  });
  if (!org) throw new AppError("ORGANIZATION_NOT_FOUND");

  // Permission check
  const hasPermission = await isAdminOrOrgLeader(roles, activityData.organizationId, userId);
  if (!hasPermission) throw new AppError("FORBIDDEN");

  // Verify category exists
  const category = await prisma.activityCategory.findFirst({
    where: { categoryId: activityData.categoryId, isDeleted: false },
  });
  if (!category) throw new AppError("CATEGORY_NOT_FOUND");

  const activity = await prisma.activity.create({
    data: {
      ...activityData,
      activityStatus: ACTIVITY_STATUS.DRAFT,
      createdBy: userId,
    },
  });

  // Create team rule if provided
  if (teamRule && (activityData.teamMode === "team" || activityData.teamMode === "both")) {
    await prisma.activityTeamRule.create({
      data: {
        activityId: activity.activityId,
        minTeamMembers: teamRule.minTeamMembers,
        maxTeamMembers: teamRule.maxTeamMembers,
      },
    });
  }

  // Invalidate list cache on create
  await cache.invalidateByPrefix(cache.REDIS_PREFIX.ACTIVITIES_LIST);

  return prisma.activity.findUnique({
    where: { activityId: activity.activityId },
    include: {
      category: true,
      organization: { select: { organizationId: true, organizationName: true } },
      activityTeamRule: true,
      registrationForm: { select: { formId: true, title: true, status: true } },
    },
  });
};

// ─── Get activities (paginated with filters) ────────────────────────────────

const getActivities = async ({
  page = 1, limit = 20, search, categoryId, organizationId,
  activityStatus, activityType, startDate, endDate,
  sortBy = "createdAt", sortOrder = "desc",
}) => {
  const pageNum = Number(page);
  const limitNum = Number(limit);

  // ── Redis cache check ──
  const cacheKey = cache.buildListKey(cache.REDIS_PREFIX.ACTIVITIES_LIST, {
    page: pageNum, limit: limitNum, search, categoryId, organizationId,
    activityStatus, activityType, startDate, endDate, sortBy, sortOrder,
  });
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const where = {
    isDeleted: false,
    ...(search && { activityName: { contains: search, mode: "insensitive" } }),
    ...(categoryId && { categoryId }),
    ...(organizationId && { organizationId }),
    ...(activityStatus && { activityStatus }),
    ...(activityType && { activityType }),
    ...(startDate && { startTime: { gte: startDate } }),
    ...(endDate && { startTime: { ...(startDate ? { gte: startDate } : {}), lte: endDate } }),
  };

  // Handle combined date filter
  if (startDate && endDate) {
    where.startTime = { gte: startDate, lte: endDate };
  }

  const [data, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: {
        category: { select: { categoryId: true, categoryName: true } },
        organization: { select: { organizationId: true, organizationName: true, logoUrl: true } },
        _count: {
          select: { registrations: { where: { isDeleted: false } } },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.activity.count({ where }),
  ]);

  // Resolve S3 presigned URLs for images
  for (const item of data) {
    await resolveFields(item, ["coverImage"]);
    await resolveNested(item, "organization", ["logoUrl"]);
  }

  const result = {
    data,
    meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  };

  // ── Cache result (5 min TTL) ──
  await cache.set(cacheKey, result, 300);
  return result;
};

// ─── Get activity by ID ─────────────────────────────────────────────────────

const getActivityById = async (activityId) => {
  // ── Redis cache check ──
  const cacheKey = `${cache.REDIS_PREFIX.ACTIVITY_DETAIL}${activityId}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const activity = await prisma.activity.findFirst({
    where: { activityId: Number(activityId), isDeleted: false },
    include: {
      category: true,
      organization: { select: { organizationId: true, organizationName: true, logoUrl: true } },
      activityTeamRule: true,
      registrationForm: {
        select: { formId: true, title: true, status: true, description: true },
      },
      _count: {
        select: {
          registrations: { where: { isDeleted: false } },
        },
      },
    },
  });

  if (!activity) throw new AppError("ACTIVITY_NOT_FOUND");

  await resolveFields(activity, ["coverImage"]);
  await resolveNested(activity, "organization", ["logoUrl"]);

  // ── Cache result (5 min TTL) ──
  await cache.set(cacheKey, activity, 300);
  return activity;
};

// ─── Update activity ────────────────────────────────────────────────────────

const updateActivity = async (activityId, data, userId, roles) => {
  const activity = await prisma.activity.findFirst({
    where: { activityId: Number(activityId), isDeleted: false },
  });
  if (!activity) throw new AppError("ACTIVITY_NOT_FOUND");

  // Can only edit draft or published
  if (![ACTIVITY_STATUS.DRAFT, ACTIVITY_STATUS.PUBLISHED].includes(activity.activityStatus)) {
    throw new AppError("ACTIVITY_CANNOT_MODIFY");
  }

  const hasPermission = await isAdminOrOrgLeader(roles, activity.organizationId, userId);
  if (!hasPermission) throw new AppError("FORBIDDEN");

  const { teamRule, ...updateData } = data;

  // Verify category if changing
  if (updateData.categoryId) {
    const category = await prisma.activityCategory.findFirst({
      where: { categoryId: updateData.categoryId, isDeleted: false },
    });
    if (!category) throw new AppError("CATEGORY_NOT_FOUND");
  }

  const updated = await prisma.activity.update({
    where: { activityId: Number(activityId) },
    data: { ...updateData, updatedBy: userId, updatedAt: new Date() },
  });

  // Invalidate caches
  await cache.del(`${cache.REDIS_PREFIX.ACTIVITY_DETAIL}${activityId}`);
  await cache.invalidateByPrefix(cache.REDIS_PREFIX.ACTIVITIES_LIST);

  // Upsert team rule
  if (teamRule) {
    await prisma.activityTeamRule.upsert({
      where: { activityId: Number(activityId) },
      create: {
        activityId: Number(activityId),
        minTeamMembers: teamRule.minTeamMembers,
        maxTeamMembers: teamRule.maxTeamMembers,
      },
      update: {
        minTeamMembers: teamRule.minTeamMembers,
        maxTeamMembers: teamRule.maxTeamMembers,
      },
    });
  }

  return prisma.activity.findUnique({
    where: { activityId: Number(activityId) },
    include: {
      category: true,
      organization: { select: { organizationId: true, organizationName: true } },
      activityTeamRule: true,
    },
  });
};

// ─── Update activity status ─────────────────────────────────────────────────

const updateActivityStatus = async (activityId, newStatus, userId, roles) => {
  const activity = await prisma.activity.findFirst({
    where: { activityId: Number(activityId), isDeleted: false },
  });
  if (!activity) throw new AppError("ACTIVITY_NOT_FOUND");

  const hasPermission = await isAdminOrOrgLeader(roles, activity.organizationId, userId);
  if (!hasPermission) throw new AppError("FORBIDDEN");

  // Validate transition
  const validTransitions = VALID_STATUS_TRANSITIONS[activity.activityStatus] || [];
  if (!validTransitions.includes(newStatus)) {
    throw new AppError("ACTIVITY_INVALID_TRANSITION");
  }

  // DRAFT → PENDING_REVIEW: only organization_leader (not pure admin)
  if (
    activity.activityStatus === ACTIVITY_STATUS.DRAFT &&
    newStatus === ACTIVITY_STATUS.PENDING_REVIEW &&
    !roles.includes("organization_leader")
  ) {
    throw new AppError("FORBIDDEN");
  }

  // PENDING_REVIEW actions (approve/reject): only admin
  if (activity.activityStatus === ACTIVITY_STATUS.PENDING_REVIEW && !roles.includes("admin")) {
    throw new AppError("FORBIDDEN");
  }

  // ── Check system config: skip approval if disabled ──
  // Inline require to avoid circular dependency (system-config does not import activities)
  let finalStatus = newStatus;

  if (newStatus === ACTIVITY_STATUS.PENDING_REVIEW) {
    const { getConfig } = require("../system-config/system-config.service");
    const requireApproval = await getConfig(
      CONFIG_KEYS.ACTIVITY_REQUIRE_APPROVAL,
      activity.organizationId,
    );

    const approvalEnabled =
      requireApproval !== null &&
      typeof requireApproval === "object" &&
      requireApproval.enabled === true;

    if (!approvalEnabled) {
      // Approval not required — publish directly
      finalStatus = ACTIVITY_STATUS.PUBLISHED;
    }
  }

  // Invalidate caches
  await cache.del(`${cache.REDIS_PREFIX.ACTIVITY_DETAIL}${activityId}`);
  await cache.invalidateByPrefix(cache.REDIS_PREFIX.ACTIVITIES_LIST);

  const updated = await prisma.activity.update({
    where: { activityId: Number(activityId) },
    data: { activityStatus: finalStatus, updatedBy: userId, updatedAt: new Date() },
  });

  // Notify admins when org submits for review (only if actually pending)
  if (finalStatus === ACTIVITY_STATUS.PENDING_REVIEW) {
    const { sendBulkNotification } = require("../notifications/notifications.service");
    try {
      const adminRoleRow = await prisma.role.findUnique({ where: { code: "admin" } });
      if (adminRoleRow) {
        const adminUserIds = await prisma.userRole.findMany({
          where: { roleId: adminRoleRow.roleId, isDeleted: false },
          select: { userId: true },
        });
        if (adminUserIds.length > 0) {
          await sendBulkNotification(
            {
              title: `Yêu cầu duyệt hoạt động`,
              content: `"${activity.activityName}" đang chờ bạn xét duyệt.`,
              notificationType: "activity",
              channels: ["IN_APP"],
              userIds: adminUserIds.map((r) => r.userId),
            },
            userId
          );
        }
      }
    } catch (_) {}
  }

  // Notify org members when published (admin approves OR auto-published)
  if (finalStatus === ACTIVITY_STATUS.PUBLISHED) {
    const { sendBulkNotification } = require("../notifications/notifications.service");
    const org = await prisma.organization.findUnique({
      where: { organizationId: activity.organizationId },
      select: { organizationName: true },
    });
    try {
      await sendBulkNotification(
        {
          title: `Hoạt động mới: ${activity.activityName}`,
          content: `${org?.organizationName ?? "Tổ chức"} vừa đăng hoạt động mới. Đăng ký ngay!`,
          notificationType: "activity",
          channels: ["IN_APP"],
          organizationId: activity.organizationId,
        },
        userId
      );
    } catch (_) {}
  }

  // Notify org members when admin rejects (pending_review -> draft)
  if (finalStatus === ACTIVITY_STATUS.DRAFT && activity.activityStatus === ACTIVITY_STATUS.PENDING_REVIEW) {
    const { sendBulkNotification } = require("../notifications/notifications.service");
    try {
      await sendBulkNotification(
        {
          title: `Hoạt động bị từ chối`,
          content: `"${activity.activityName}" chưa được duyệt. Vui lòng chỉnh sửa và gửi lại.`,
          notificationType: "activity",
          channels: ["IN_APP"],
          organizationId: activity.organizationId,
        },
        userId
      );
    } catch (_) {}
  }

  return updated;
};

// ─── Get activities managed by current user (org leader + admin) ─────────────
//
// Returns activities that belong to ANY org where the user holds a leader role,
// PLUS activities the user personally created (covers admins creating for orgs
// they're not a formal member of).

const getMyOrgActivities = async (userId, { page = 1, limit = 20, activityStatus } = {}) => {
  const pageNum = Number(page);
  const limitNum = Number(limit);

  // Collect all org IDs where this user is a leader
  const memberships = await prisma.organizationMember.findMany({
    where: {
      userId,
      isDeleted: false,
      role: {
        in: [
          ORG_MEMBER_ROLE.PRESIDENT,
          ORG_MEMBER_ROLE.VICE_PRESIDENT,
          ORG_MEMBER_ROLE.HEAD_OF_DEPARTMENT,
          ORG_MEMBER_ROLE.VICE_HEAD,
        ],
      },
    },
    select: { organizationId: true },
  });

  const orgIds = memberships.map((m) => m.organizationId);

  // Match: in one of their orgs OR personally created (admin fallback)
  const orgConditions = orgIds.length > 0 ? [{ organizationId: { in: orgIds } }] : [];
  const where = {
    isDeleted: false,
    OR: [...orgConditions, { createdBy: userId }],
    ...(activityStatus && { activityStatus }),
  };

  const [data, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: {
        category: { select: { categoryId: true, categoryName: true } },
        organization: { select: { organizationId: true, organizationName: true, logoUrl: true } },
        _count: { select: { registrations: { where: { isDeleted: false } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.activity.count({ where }),
  ]);

  for (const item of data) {
    await resolveFields(item, ["coverImage"]);
    await resolveNested(item, "organization", ["logoUrl"]);
  }

  return {
    data,
    meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  };
};

// ─── Soft delete activity ───────────────────────────────────────────────────

const softDeleteActivity = async (activityId, userId, roles) => {
  const activity = await prisma.activity.findFirst({
    where: { activityId: Number(activityId), isDeleted: false },
  });
  if (!activity) throw new AppError("ACTIVITY_NOT_FOUND");

  const hasPermission = await isAdminOrOrgLeader(roles, activity.organizationId, userId);
  if (!hasPermission) throw new AppError("FORBIDDEN");

  // Invalidate caches
  await cache.del(`${cache.REDIS_PREFIX.ACTIVITY_DETAIL}${activityId}`);
  await cache.invalidateByPrefix(cache.REDIS_PREFIX.ACTIVITIES_LIST);

  return prisma.activity.update({
    where: { activityId: Number(activityId) },
    data: { isDeleted: true, deletedAt: new Date(), deletedBy: userId },
  });
};

// ─── Categories ─────────────────────────────────────────────────────────────

const getCategories = async () => {
  const cached = await cache.get(cache.REDIS_PREFIX.CATEGORIES);
  if (cached) return cached;

  const result = await prisma.activityCategory.findMany({
    where: { isDeleted: false },
    orderBy: { categoryName: "asc" },
  });

  await cache.set(cache.REDIS_PREFIX.CATEGORIES, result, 600); // 10 min
  return result;
};

const createCategory = async (data, createdBy) => {
  return prisma.activityCategory.create({
    data: { ...data, createdBy },
  });
};

// ─── Checkin sessions ───────────────────────────────────────────────────────

const createCheckinSession = async (activityId, data, userId, roles) => {
  const activity = await prisma.activity.findFirst({
    where: { activityId: Number(activityId), isDeleted: false },
  });
  if (!activity) throw new AppError("ACTIVITY_NOT_FOUND");

  const hasPermission = await isAdminOrOrgLeader(roles, activity.organizationId, userId);
  if (!hasPermission) throw new AppError("FORBIDDEN");

  return prisma.activityCheckin.create({
    data: {
      activityId: Number(activityId),
      checkInTime: data.checkInTime,
      checkOutTime: data.checkOutTime || null,
    },
  });
};

const getCheckinSessions = async (activityId) => {
  const activity = await prisma.activity.findFirst({
    where: { activityId: Number(activityId), isDeleted: false },
  });
  if (!activity) throw new AppError("ACTIVITY_NOT_FOUND");

  return prisma.activityCheckin.findMany({
    where: { activityId: Number(activityId) },
    include: {
      _count: { select: { registrationCheckins: true } },
    },
    orderBy: { checkInTime: "desc" },
  });
};

module.exports = {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  updateActivityStatus,
  softDeleteActivity,
  getCategories,
  createCategory,
  createCheckinSession,
  getCheckinSessions,
  getMyOrgActivities,
};
