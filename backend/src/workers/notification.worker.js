const { Worker } = require("bullmq");
const { getRedisConnection } = require("../config/bullmq");
const { NOTIFICATION_QUEUE_NAME } = require("../utils/constants");
const prisma = require("../config/prisma");
const { sendNotificationEmail } = require("../utils/mailer");

const processNotificationJob = async (job) => {
  const { userId, title, content, channels } = job.data;

  const user = await prisma.user.findFirst({
    where: { userId: Number(userId), isDeleted: false },
    select: { email: true, phoneNumber: true, userName: true },
  });

  if (!user) {
    return { status: "skipped", reason: "user_not_found" };
  }

  const results = [];

  for (const channel of channels ?? []) {
    if (channel === "EMAIL" && user.email) {
      try {
        await sendNotificationEmail({
          to: user.email,
          subject: title,
          body: content ?? "",
        });
        results.push({ channel: "EMAIL", status: "sent" });
      } catch (err) {
        results.push({ channel: "EMAIL", status: "failed", reason: err.message });
      }
    } else {
      results.push({ channel, status: "skipped", reason: "no_contact_info" });
    }
  }

  return { status: "completed", results };
};

let worker = null;

const startNotificationWorker = () => {
  const batchSize = parseInt(process.env.NOTIFICATION_BATCH_SIZE) || 50;

  worker = new Worker(NOTIFICATION_QUEUE_NAME, processNotificationJob, {
    connection: getRedisConnection(),
    concurrency: batchSize,
    limiter: {
      max: 100,
      duration: 60000,
    },
  });

  worker.on("completed", (job, result) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Worker] Job ${job.id} completed:`, result);
    }
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[Worker] Job ${job.id} failed (attempt ${job.attemptsMade}):`,
      err.message
    );
  });

  worker.on("error", (err) => {
    console.error("[Worker] Error:", err.message);
  });

  console.log("[Worker] Notification worker started");
  return worker;
};

const stopNotificationWorker = async () => {
  if (worker) {
    await worker.close();
    worker = null;
    console.log("[Worker] Notification worker stopped");
  }
};

module.exports = { startNotificationWorker, stopNotificationWorker };
