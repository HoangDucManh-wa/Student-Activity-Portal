const prisma = require("../../config/prisma");
const AppError = require("../../utils/app-error");
const { ACTIVITY_STATUS, REGISTRATION_STATUS } = require("../../utils/constants");
const { isAdminOrOrgLeader } = require("../../utils/permissions");
const {
  getRegistrationQueue,
  getRegistrationQueueEvents,
} = require("../../config/bullmq");
const { resolveFields } = require("../../utils/s3-helpers");

// ─── Create registration (queue-based) ──────────────────────────────────────
//
// Pre-validates activity state, then enqueues the job into BullMQ.
// The worker (concurrency=1) handles the capacity check + insert atomically,
// preventing race conditions where two concurrent requests both pass the
// count check and over-fill the activity.

const QUEUE_TIMEOUT_MS = 30_000;

const createRegistration = async (data, userId) => {
  const { activityId, registrationType, teamName, isLookingForTeam, teamMembers } = data;

  // ── Pre-validation (read-only, safe outside queue) ──
  const activity = await prisma.activity.findFirst({
    where: { activityId, isDeleted: false },
  });
  if (!activity) throw new AppError("ACTIVITY_NOT_FOUND");

  if (![ACTIVITY_STATUS.PUBLISHED, ACTIVITY_STATUS.RUNNING].includes(activity.activityStatus)) {
    throw new AppError("ACTIVITY_CANNOT_MODIFY", "Hoạt động chưa mở đăng ký");
  }

  if (activity.registrationDeadline && new Date() > activity.registrationDeadline) {
    throw new AppError("REGISTRATION_DEADLINE_PASSED");
  }

  // ── Enqueue registration job ──
  const queue = getRegistrationQueue();
  const queueEvents = getRegistrationQueueEvents();

  const job = await queue.add("register", {
    activityId,
    userId,
    registrationType,
    teamName,
    isLookingForTeam,
    teamMembers,
    maxParticipants: activity.maxParticipants,
  });

  // Wait for the worker to finish processing this job
  const result = await job.waitUntilFinished(queueEvents, QUEUE_TIMEOUT_MS);

  // Worker returns { error, message } on validation failure, { data } on success
  if (result.error) {
    throw new AppError(result.error, result.message);
  }

  return result.data;
};

// ─── Cancel registration ────────────────────────────────────────────────────

const cancelRegistration = async (registrationId, userId) => {
  const registration = await prisma.registration.findFirst({
    where: { registrationId: Number(registrationId), userId, isDeleted: false },
  });
  if (!registration) throw new AppError("REGISTRATION_NOT_FOUND");

  if (![REGISTRATION_STATUS.PENDING, REGISTRATION_STATUS.APPROVED].includes(registration.status)) {
    throw new AppError("REGISTRATION_CANNOT_CANCEL");
  }

  return prisma.registration.update({
    where: { registrationId: Number(registrationId) },
    data: { status: REGISTRATION_STATUS.CANCELLED, updatedBy: userId, updatedAt: new Date() },
  });
};

// ─── Get my registrations ───────────────────────────────────────────────────

const getMyRegistrations = async (userId, { page = 1, limit = 20, status } = {}) => {
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const where = {
    userId,
    isDeleted: false,
    ...(status && { status }),
  };

  const [data, total] = await Promise.all([
    prisma.registration.findMany({
      where,
      include: {
        activity: {
          select: {
            activityId: true,
            activityName: true,
            activityStatus: true,
            startTime: true,
            endTime: true,
            location: true,
            coverImage: true,
            organization: { select: { organizationId: true, organizationName: true } },
          },
        },
      },
      orderBy: { registrationTime: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.registration.count({ where }),
  ]);

  for (const item of data) {
    if (item.activity) await resolveFields(item.activity, ["coverImage"]);
  }

  return {
    data,
    meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  };
};

// ─── Get registrations by activity (admin/leader) ───────────────────────────

const getRegistrationsByActivity = async (activityId, { page = 1, limit = 20, status } = {}) => {
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const where = {
    activityId: Number(activityId),
    isDeleted: false,
    ...(status && { status }),
  };

  const [data, total] = await Promise.all([
    prisma.registration.findMany({
      where,
      include: {
        user: { select: { userId: true, userName: true, email: true, studentId: true, avatarUrl: true } },
        teamMembers: {
          where: { isDeleted: false },
          include: { user: { select: { userId: true, userName: true } } },
        },
      },
      orderBy: { registrationTime: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.registration.count({ where }),
  ]);

  for (const item of data) {
    if (item.user) await resolveFields(item.user, ["avatarUrl"]);
  }

  return {
    data,
    meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  };
};

// ─── Get registration by ID ────────────────────────────────────────────────

const getRegistrationById = async (registrationId) => {
  const registration = await prisma.registration.findFirst({
    where: { registrationId: Number(registrationId), isDeleted: false },
    include: {
      activity: {
        select: {
          activityId: true,
          activityName: true,
          activityStatus: true,
          startTime: true,
          organization: { select: { organizationId: true, organizationName: true } },
        },
      },
      user: { select: { userId: true, userName: true, email: true, studentId: true } },
      teamMembers: {
        where: { isDeleted: false },
        include: { user: { select: { userId: true, userName: true } } },
      },
      registrationCheckins: {
        include: { activityCheckin: true },
        orderBy: { checkInTime: "desc" },
      },
    },
  });

  if (!registration) throw new AppError("REGISTRATION_NOT_FOUND");
  return registration;
};

// ─── Update registration status (approve/reject) ───────────────────────────

const updateRegistrationStatus = async (registrationId, status, userId, roles) => {
  const registration = await prisma.registration.findFirst({
    where: { registrationId: Number(registrationId), isDeleted: false },
    include: { activity: true },
  });
  if (!registration) throw new AppError("REGISTRATION_NOT_FOUND");

  const hasPermission = await isAdminOrOrgLeader(
    roles, registration.activity.organizationId, userId
  );
  if (!hasPermission) throw new AppError("FORBIDDEN");

  const updated = await prisma.registration.update({
    where: { registrationId: Number(registrationId) },
    data: { status, updatedBy: userId, updatedAt: new Date() },
    include: {
      user: { select: { userId: true, userName: true, email: true } },
    },
  });

  // Notify registrant on approval or rejection
  if ([REGISTRATION_STATUS.APPROVED, REGISTRATION_STATUS.REJECTED].includes(status)) {
    const { sendNotification } = require("../notifications/notifications.service");
    const statusText = status === REGISTRATION_STATUS.APPROVED ? "được duyệt" : "bị từ chối";
    try {
      await sendNotification(
        {
          title: `Đăng ký ${statusText}`,
          content: `Đăng ký của bạn cho hoạt động "${registration.activity.activityName}" đã ${statusText}.`,
          userId: registration.userId,
          notificationType: "registration",
          channels: ["IN_APP"],
        },
        userId
      );
    } catch (_) {
      // Notification failure must not fail the status update
    }
  }

  return updated;
};

// ─── Bulk update status ─────────────────────────────────────────────────────

const bulkUpdateStatus = async (registrationIds, status, userId) => {
  const result = await prisma.registration.updateMany({
    where: {
      registrationId: { in: registrationIds.map(Number) },
      isDeleted: false,
    },
    data: { status, updatedBy: userId, updatedAt: new Date() },
  });

  return { updated: result.count };
};

// ─── Check in ───────────────────────────────────────────────────────────────

const checkin = async (registrationId, activityCheckinId, userId) => {
  const registration = await prisma.registration.findFirst({
    where: { registrationId: Number(registrationId), isDeleted: false },
  });
  if (!registration) throw new AppError("REGISTRATION_NOT_FOUND");

  if (registration.status !== REGISTRATION_STATUS.APPROVED) {
    throw new AppError("REGISTRATION_NOT_APPROVED");
  }

  // Verify checkin session exists
  const session = await prisma.activityCheckin.findUnique({
    where: { checkinId: Number(activityCheckinId) },
  });
  if (!session) throw new AppError("CHECKIN_SESSION_NOT_FOUND");

  // Check duplicate
  const existing = await prisma.registrationCheckin.findUnique({
    where: {
      registrationId_activityCheckinId: {
        registrationId: Number(registrationId),
        activityCheckinId: Number(activityCheckinId),
      },
    },
  });
  if (existing) throw new AppError("CHECKIN_ALREADY_EXISTS");

  return prisma.registrationCheckin.create({
    data: {
      registrationId: Number(registrationId),
      activityCheckinId: Number(activityCheckinId),
      checkInTime: new Date(),
    },
  });
};

// ─── Check out ──────────────────────────────────────────────────────────────

const checkout = async (registrationId, activityCheckinId) => {
  const existing = await prisma.registrationCheckin.findUnique({
    where: {
      registrationId_activityCheckinId: {
        registrationId: Number(registrationId),
        activityCheckinId: Number(activityCheckinId),
      },
    },
  });
  if (!existing) throw new AppError("CHECKIN_SESSION_NOT_FOUND");

  return prisma.registrationCheckin.update({
    where: { checkinId: existing.checkinId },
    data: { checkOutTime: new Date() },
  });
};

// ─── Activity participant stats ─────────────────────────────────────────────

const getActivityParticipantStats = async (activityId) => {
  const activity = await prisma.activity.findFirst({
    where: { activityId: Number(activityId), isDeleted: false },
  });
  if (!activity) throw new AppError("ACTIVITY_NOT_FOUND");

  const [pending, approved, rejected, cancelled, checkedIn] = await Promise.all([
    prisma.registration.count({ where: { activityId: Number(activityId), isDeleted: false, status: REGISTRATION_STATUS.PENDING } }),
    prisma.registration.count({ where: { activityId: Number(activityId), isDeleted: false, status: REGISTRATION_STATUS.APPROVED } }),
    prisma.registration.count({ where: { activityId: Number(activityId), isDeleted: false, status: REGISTRATION_STATUS.REJECTED } }),
    prisma.registration.count({ where: { activityId: Number(activityId), isDeleted: false, status: REGISTRATION_STATUS.CANCELLED } }),
    prisma.registrationCheckin.count({
      where: {
        registration: { activityId: Number(activityId), isDeleted: false },
        checkInTime: { not: null },
      },
    }),
  ]);

  return {
    total: pending + approved + rejected + cancelled,
    pending,
    approved,
    rejected,
    cancelled,
    checkedIn,
    maxParticipants: activity.maxParticipants,
  };
};

module.exports = {
  createRegistration,
  cancelRegistration,
  getMyRegistrations,
  getRegistrationsByActivity,
  getRegistrationById,
  updateRegistrationStatus,
  bulkUpdateStatus,
  checkin,
  checkout,
  getActivityParticipantStats,
};
