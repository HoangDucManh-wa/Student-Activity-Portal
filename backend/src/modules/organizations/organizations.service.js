const bcrypt = require("bcryptjs");
const prisma = require("../../config/prisma");
const AppError = require("../../utils/app-error");
const cache = require("../../utils/cache");
const { ORG_MEMBER_ROLE, ACTIVITY_STATUS } = require("../../utils/constants");
const { isAdminOrOrgLeader } = require("../../utils/permissions");
const { resolveFields, resolveArrayFields } = require("../../utils/s3-helpers");

// ─── Create organization ────────────────────────────────────────────────────

const createOrganization = async (data, createdBy) => {
  const { email, password, ...orgData } = data;

  const orgPayload = { ...orgData, createdBy };
  if (email) orgPayload.email = email;
  if (password) orgPayload.password = await bcrypt.hash(password, 12);

  const org = await prisma.organization.create({
    data: orgPayload,
  });

  // Invalidate list cache
  await cache.invalidateByPrefix(cache.REDIS_PREFIX.ORGS_LIST);

  // Auto-add creator as president
  await prisma.organizationMember.create({
    data: {
      userId: createdBy,
      organizationId: org.organizationId,
      role: ORG_MEMBER_ROLE.PRESIDENT,
      joinDate: new Date(),
      createdBy,
    },
  });

  return prisma.organization.findUnique({
    where: { organizationId: org.organizationId },
    include: {
      organizationMembers: {
        where: { isDeleted: false },
        include: { user: { select: { userId: true, userName: true, email: true } } },
      },
    },
  });
};

// ─── Get organizations (paginated) ──────────────────────────────────────────

const getOrganizations = async ({ page = 1, limit = 20, search, organizationType }) => {
  const pageNum = Number(page);
  const limitNum = Number(limit);

  // ── Redis cache check ──
  const cacheKey = cache.buildListKey(cache.REDIS_PREFIX.ORGS_LIST, {
    page: pageNum, limit: limitNum, search, organizationType,
  });
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const where = {
    isDeleted: false,
    ...(organizationType && { organizationType }),
    ...(search && {
      organizationName: { contains: search, mode: "insensitive" },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      include: {
        _count: {
          select: {
            organizationMembers: { where: { isDeleted: false } },
            activities: { where: { isDeleted: false } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.organization.count({ where }),
  ]);

  await resolveArrayFields(data, ["logoUrl", "coverImageUrl"]);

  const result = {
    data,
    meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  };

  // ── Cache result (5 min TTL) ──
  await cache.set(cacheKey, result, 300);
  return result;
};

// ─── Get organization by ID ─────────────────────────────────────────────────

const getOrganizationById = async (organizationId) => {
  // ── Redis cache check ──
  const cacheKey = `${cache.REDIS_PREFIX.ORG_DETAIL}${organizationId}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const org = await prisma.organization.findFirst({
    where: { organizationId: Number(organizationId), isDeleted: false },
    include: {
      organizationMembers: {
        where: { isDeleted: false },
        include: { user: { select: { userId: true, userName: true, email: true, avatarUrl: true } } },
      },
      _count: {
        select: {
          activities: { where: { isDeleted: false } },
        },
      },
    },
  });

  if (!org) throw new AppError("ORGANIZATION_NOT_FOUND");

  await resolveFields(org, ["logoUrl", "coverImageUrl"]);
  // Resolve member avatars
  if (org.organizationMembers) {
    for (const m of org.organizationMembers) {
      if (m.user) await resolveFields(m.user, ["avatarUrl"]);
    }
  }

  // ── Cache result (5 min TTL) ──
  await cache.set(cacheKey, org, 300);
  return org;
};

// ─── Update organization ────────────────────────────────────────────────────

const updateOrganization = async (organizationId, data, userId, roles) => {
  const org = await prisma.organization.findFirst({
    where: { organizationId: Number(organizationId), isDeleted: false },
  });
  if (!org) throw new AppError("ORGANIZATION_NOT_FOUND");

  const hasPermission = await isAdminOrOrgLeader(roles, Number(organizationId), userId);
  if (!hasPermission) throw new AppError("FORBIDDEN");

  // Invalidate caches
  await cache.del(`${cache.REDIS_PREFIX.ORG_DETAIL}${organizationId}`);
  await cache.invalidateByPrefix(cache.REDIS_PREFIX.ORGS_LIST);

  return prisma.organization.update({
    where: { organizationId: Number(organizationId) },
    data: { ...data, updatedBy: userId, updatedAt: new Date() },
  });
};

// ─── Soft delete organization ───────────────────────────────────────────────

const softDeleteOrganization = async (organizationId, deletedBy) => {
  const org = await prisma.organization.findFirst({
    where: { organizationId: Number(organizationId), isDeleted: false },
  });
  if (!org) throw new AppError("ORGANIZATION_NOT_FOUND");

  // Invalidate caches
  await cache.del(`${cache.REDIS_PREFIX.ORG_DETAIL}${organizationId}`);
  await cache.invalidateByPrefix(cache.REDIS_PREFIX.ORGS_LIST);

  return prisma.organization.update({
    where: { organizationId: Number(organizationId) },
    data: { isDeleted: true, deletedAt: new Date(), deletedBy },
  });
};

// ─── Get members ────────────────────────────────────────────────────────────

const getMembers = async (organizationId, { page = 1, limit = 20 }) => {
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const where = { organizationId: Number(organizationId), isDeleted: false };

  const [data, total] = await Promise.all([
    prisma.organizationMember.findMany({
      where,
      include: {
        user: { select: { userId: true, userName: true, email: true, avatarUrl: true, studentId: true } },
      },
      orderBy: { joinDate: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.organizationMember.count({ where }),
  ]);

  for (const m of data) {
    if (m.user) await resolveFields(m.user, ["avatarUrl"]);
  }

  return {
    data,
    meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  };
};

// ─── Add member ─────────────────────────────────────────────────────────────

const addMember = async (organizationId, userId, role, addedBy, callerRoles) => {
  const org = await prisma.organization.findFirst({
    where: { organizationId: Number(organizationId), isDeleted: false },
  });
  if (!org) throw new AppError("ORGANIZATION_NOT_FOUND");

  const hasPermission = await isAdminOrOrgLeader(callerRoles, Number(organizationId), addedBy);
  if (!hasPermission) throw new AppError("FORBIDDEN");

  // Check user exists
  const user = await prisma.user.findFirst({
    where: { userId: Number(userId), isDeleted: false },
  });
  if (!user) throw new AppError("USER_NOT_FOUND");

  // Check if already member (including soft-deleted)
  const existing = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: Number(userId),
        organizationId: Number(organizationId),
      },
    },
  });

  if (existing && !existing.isDeleted) {
    throw new AppError("ORGANIZATION_MEMBER_EXISTS");
  }

  // Upsert: re-activate if soft-deleted, or create new
  if (existing) {
    return prisma.organizationMember.update({
      where: {
        userId_organizationId: {
          userId: Number(userId),
          organizationId: Number(organizationId),
        },
      },
      data: {
        role,
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        joinDate: new Date(),
        updatedBy: addedBy,
        updatedAt: new Date(),
      },
      include: { user: { select: { userId: true, userName: true, email: true } } },
    });
  }

  return prisma.organizationMember.create({
    data: {
      userId: Number(userId),
      organizationId: Number(organizationId),
      role,
      joinDate: new Date(),
      createdBy: addedBy,
    },
    include: { user: { select: { userId: true, userName: true, email: true } } },
  });
};

// ─── Update member role ─────────────────────────────────────────────────────

const updateMemberRole = async (organizationId, userId, role, updatedBy, callerRoles) => {
  const hasPermission = await isAdminOrOrgLeader(callerRoles, Number(organizationId), updatedBy);
  if (!hasPermission) throw new AppError("FORBIDDEN");

  const member = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: Number(userId),
        organizationId: Number(organizationId),
      },
    },
  });

  if (!member || member.isDeleted) {
    throw new AppError("ORGANIZATION_NOT_MEMBER");
  }

  return prisma.organizationMember.update({
    where: {
      userId_organizationId: {
        userId: Number(userId),
        organizationId: Number(organizationId),
      },
    },
    data: { role, updatedBy, updatedAt: new Date() },
    include: { user: { select: { userId: true, userName: true, email: true } } },
  });
};

// ─── Remove member (soft delete) ────────────────────────────────────────────

const removeMember = async (organizationId, userId, removedBy, callerRoles) => {
  const hasPermission = await isAdminOrOrgLeader(callerRoles, Number(organizationId), removedBy);
  if (!hasPermission) throw new AppError("FORBIDDEN");

  const member = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: Number(userId),
        organizationId: Number(organizationId),
      },
    },
  });

  if (!member || member.isDeleted) {
    throw new AppError("ORGANIZATION_NOT_MEMBER");
  }

  return prisma.organizationMember.update({
    where: {
      userId_organizationId: {
        userId: Number(userId),
        organizationId: Number(organizationId),
      },
    },
    data: { isDeleted: true, deletedAt: new Date(), deletedBy: removedBy },
  });
};

// ─── Get my organization (for org leader) ───────────────────────────────────

const getMyOrganization = async (userId) => {
  const membership = await prisma.organizationMember.findFirst({
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
    orderBy: [{ joinDate: "desc" }, { createdAt: "desc" }],
    include: {
      organization: {
        include: {
          _count: {
            select: {
              organizationMembers: { where: { isDeleted: false } },
              activities: { where: { isDeleted: false } },
            },
          },
        },
      },
    },
  });

  if (!membership?.organization) throw new AppError("ORGANIZATION_NOT_FOUND");

  const org = membership.organization;
  await resolveFields(org, ["logoUrl", "coverImageUrl"]);
  return { ...org, memberRole: membership.role };
};

// ─── Get org stats (for dashboard) ─────────────────────────────────────────

const getOrgStats = async (organizationId) => {
  const now = new Date();

  const [activeActivities, totalRegistrations, newMembers] = await Promise.all([
    prisma.activity.count({
      where: {
        organizationId: Number(organizationId),
        isDeleted: false,
        activityStatus: ACTIVITY_STATUS.RUNNING,
        endTime: { gte: now },
      },
    }),
    prisma.registration.count({
      where: {
        isDeleted: false,
        activity: { organizationId: Number(organizationId), isDeleted: false },
      },
    }),
    prisma.organizationMember.count({
      where: {
        organizationId: Number(organizationId),
        isDeleted: false,
        joinDate: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      },
    }),
  ]);

  return { activeActivities, totalRegistrations, newMembers };
};

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  softDeleteOrganization,
  getMembers,
  addMember,
  updateMemberRole,
  removeMember,
  getMyOrganization,
  getOrgStats,
};

// ─── Group management ──────────────────────────────────────────────────────

const getAllMembersWithGroups = async (orgId) => {
  const organizationId = Number(orgId);

  const groups = await prisma.organizationGroup.findMany({
    where: { organizationId },
    include: {
      members: {
        where: { isDeleted: false },
        include: {
          user: {
            select: {
              userId: true, userName: true, email: true,
              avatarUrl: true, studentId: true, phoneNumber: true,
              university: true, faculty: true, className: true,
            },
          },
        },
      },
    },
    orderBy: { groupName: "asc" },
  });

  // Resolve avatars
  for (const g of groups) {
    for (const m of g.members) {
      if (m.user) await resolveFields(m.user, ["avatarUrl"]);
    }
  }

  const ungrouped = await prisma.organizationMember.findMany({
    where: { organizationId, isDeleted: false, groupId: null },
    include: {
      user: {
        select: {
          userId: true, userName: true, email: true,
          avatarUrl: true, studentId: true, phoneNumber: true,
          university: true, faculty: true, className: true,
        },
      },
    },
    orderBy: { joinDate: "desc" },
  });

  for (const m of ungrouped) {
    if (m.user) await resolveFields(m.user, ["avatarUrl"]);
  }

  return { grouped: groups, ungrouped };
};

const getGroups = async (orgId) => {
  return prisma.organizationGroup.findMany({
    where: { organizationId: Number(orgId) },
    include: {
      _count: { select: { members: { where: { isDeleted: false } } } },
    },
    orderBy: { groupName: "asc" },
  });
};

const createGroup = async (orgId, data, userId, roles) => {
  const organizationId = Number(orgId);

  const hasPermission = await isAdminOrOrgLeader(roles, organizationId, userId);
  if (!hasPermission) throw new AppError("FORBIDDEN");

  return prisma.organizationGroup.create({
    data: {
      organizationId,
      groupName: data.groupName.trim(),
      description: data.description || null,
    },
  });
};

const pushToGroup = async (orgId, data, userId, roles) => {
  const organizationId = Number(orgId);

  const hasPermission = await isAdminOrOrgLeader(roles, organizationId, userId);
  if (!hasPermission) throw new AppError("FORBIDDEN");

  const { memberIds, groupId, newGroupName } = data;

  return prisma.$transaction(async (tx) => {
    let targetGroupId = groupId;

    // Create new group if newGroupName provided
    if (newGroupName && !groupId) {
      const newGroup = await tx.organizationGroup.create({
        data: {
          organizationId,
          groupName: newGroupName.trim(),
        },
      });
      targetGroupId = newGroup.groupId;
    }

    if (!targetGroupId) throw new AppError("VALIDATION_ERROR", "Phải chọn nhóm");

    // Verify group belongs to org
    const group = await tx.organizationGroup.findFirst({
      where: { groupId: targetGroupId, organizationId },
    });
    if (!group) throw new AppError("GROUP_NOT_FOUND", "Nhóm không tồn tại");

    // Update all members
    for (const memberId of memberIds) {
      await tx.organizationMember.updateMany({
        where: {
          userId: Number(memberId),
          organizationId,
          isDeleted: false,
        },
        data: { groupId: targetGroupId, updatedBy: userId, updatedAt: new Date() },
      });
    }

    return { groupId: targetGroupId, groupName: group.groupName, assignedCount: memberIds.length };
  });
};

const deleteGroup = async (orgId, groupId, userId, roles) => {
  const organizationId = Number(orgId);

  const hasPermission = await isAdminOrOrgLeader(roles, organizationId, userId);
  if (!hasPermission) throw new AppError("FORBIDDEN");

  const group = await prisma.organizationGroup.findFirst({
    where: { groupId: Number(groupId), organizationId },
  });
  if (!group) throw new AppError("GROUP_NOT_FOUND", "Nhóm không tồn tại");

  // Set members' groupId to null first
  await prisma.organizationMember.updateMany({
    where: { groupId: Number(groupId), organizationId, isDeleted: false },
    data: { groupId: null },
  });

  await prisma.organizationGroup.delete({
    where: { groupId: Number(groupId) },
  });

  return { success: true };
};

module.exports.getAllMembersWithGroups = getAllMembersWithGroups;
module.exports.getGroups = getGroups;
module.exports.createGroup = createGroup;
module.exports.pushToGroup = pushToGroup;
module.exports.deleteGroup = deleteGroup;
