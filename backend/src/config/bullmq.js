const { Queue, QueueEvents } = require("bullmq");
const {
  NOTIFICATION_QUEUE_NAME,
  REGISTRATION_QUEUE_NAME,
} = require("../utils/constants");

const getRedisConnection = () => ({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
});

let notificationQueue = null;
let registrationQueue = null;
let registrationQueueEvents = null;

const getNotificationQueue = () => {
  if (!notificationQueue) {
    notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: parseInt(process.env.NOTIFICATION_RETRY_ATTEMPTS) || 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    });
  }
  return notificationQueue;
};

const getRegistrationQueue = () => {
  if (!registrationQueue) {
    registrationQueue = new Queue(REGISTRATION_QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 1000 },
      },
    });
  }
  return registrationQueue;
};

const getRegistrationQueueEvents = () => {
  if (!registrationQueueEvents) {
    registrationQueueEvents = new QueueEvents(REGISTRATION_QUEUE_NAME, {
      connection: getRedisConnection(),
    });
  }
  return registrationQueueEvents;
};

const closeQueues = async () => {
  if (notificationQueue) {
    await notificationQueue.close();
    notificationQueue = null;
  }
  if (registrationQueueEvents) {
    await registrationQueueEvents.close();
    registrationQueueEvents = null;
  }
  if (registrationQueue) {
    await registrationQueue.close();
    registrationQueue = null;
  }
};

module.exports = {
  getNotificationQueue,
  getRegistrationQueue,
  getRegistrationQueueEvents,
  getRedisConnection,
  closeQueues,
};
