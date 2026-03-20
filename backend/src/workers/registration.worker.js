const { Worker } = require("bullmq");
const { getRedisConnection } = require("../config/bullmq");
const { REGISTRATION_QUEUE_NAME, REGISTRATION_STATUS } = require("../utils/constants");
const prisma = require("../config/prisma");

const processRegistrationJob = async (job) => {
  const {
    activityId,
    userId,
    registrationType,
    teamName,
    isLookingForTeam,
    teamMembers,
    maxParticipants,
  } = job.data;

  // Duplicate check (inside worker — serialized, so no race)
  const existing = await prisma.registration.findUnique({
    where: { userId_activityId: { userId, activityId } },
  });
  if (existing && !existing.isDeleted) {
    return { error: "REGISTRATION_DUPLICATE", message: "Bạn đã đăng ký hoạt động này rồi" };
  }

  // Atomic capacity check (safe because concurrency = 1)
  let isWaitlisted = false;
  if (maxParticipants) {
    const currentCount = await prisma.registration.count({
      where: {
        activityId,
        isDeleted: false,
        status: { in: [REGISTRATION_STATUS.PENDING, REGISTRATION_STATUS.APPROVED] },
      },
    });
    if (currentCount >= maxParticipants) {
      isWaitlisted = true;
    }
  }

  // Re-activate soft-deleted or create new
  let registration;
  if (existing && existing.isDeleted) {
    registration = await prisma.registration.update({
      where: { registrationId: existing.registrationId },
      data: {
        status: isWaitlisted ? REGISTRATION_STATUS.CANCELLED : REGISTRATION_STATUS.PENDING,
        registrationType,
        teamName: teamName || null,
        isLookingForTeam: isLookingForTeam || null,
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        registrationTime: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
  } else {
    registration = await prisma.registration.create({
      data: {
        userId,
        activityId,
        status: isWaitlisted ? REGISTRATION_STATUS.CANCELLED : REGISTRATION_STATUS.PENDING,
        registrationType,
        teamName: teamName || null,
        isLookingForTeam: isLookingForTeam || null,
        createdBy: userId,
      },
    });
  }

  // Create team members if group registration
  if (registrationType === "group" && teamMembers && teamMembers.length > 0) {
    const memberData = teamMembers.map((m) => ({
      registrationId: registration.registrationId,
      userId: m.userId,
      role: m.role || "member",
      createdBy: userId,
    }));

    memberData.unshift({
      registrationId: registration.registrationId,
      userId,
      role: "leader",
      createdBy: userId,
    });

    await prisma.teamMember.createMany({
      data: memberData,
      skipDuplicates: true,
    });
  }

  const result = await prisma.registration.findUnique({
    where: { registrationId: registration.registrationId },
    include: {
      activity: { select: { activityId: true, activityName: true } },
      teamMembers: {
        where: { isDeleted: false },
        include: { user: { select: { userId: true, userName: true } } },
      },
    },
  });

  // Notify the user who registered
  if (!isWaitlisted) {
    const { sendNotification } = require("../modules/notifications/notifications.service");
    try {
      await sendNotification(
        {
          title: "Đăng ký thành công",
          content: `Bạn đã đăng ký thành công hoạt động "${result.activity?.activityName}". Chờ ban tổ chức xét duyệt.`,
          userId,
          notificationType: "registration",
          channels: ["IN_APP"],
        },
        userId
      );
    } catch (_) {
      // Non-critical — registration already saved
    }
  }

  return { data: { ...result, isWaitlisted } };
};

let worker = null;

const startRegistrationWorker = () => {
  worker = new Worker(REGISTRATION_QUEUE_NAME, processRegistrationJob, {
    connection: getRedisConnection(),
    concurrency: 1,
  });

  worker.on("completed", (job, result) => {
    if (process.env.NODE_ENV === "development") {
      const status = result.error ? "rejected" : "processed";
      console.log(`[RegistrationWorker] Job ${job.id} ${status}`);
    }
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[RegistrationWorker] Job ${job.id} failed (attempt ${job.attemptsMade}):`,
      err.message
    );
  });

  worker.on("error", (err) => {
    console.error("[RegistrationWorker] Error:", err.message);
  });

  console.log("[RegistrationWorker] Registration worker started (concurrency=1)");
  return worker;
};

const stopRegistrationWorker = async () => {
  if (worker) {
    await worker.close();
    worker = null;
    console.log("[RegistrationWorker] Registration worker stopped");
  }
};

module.exports = { startRegistrationWorker, stopRegistrationWorker };
