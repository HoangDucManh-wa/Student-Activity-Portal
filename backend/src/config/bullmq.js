const { Queue } = require("bullmq");
const { NOTIFICATION_QUEUE_NAME } = require("../utils/constants");

const getRedisConnection = () => ({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
});

let queue = null;

const getNotificationQueue = () => {
  if (!queue) {
    queue = new Queue(NOTIFICATION_QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: parseInt(process.env.NOTIFICATION_RETRY_ATTEMPTS) || 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    });
  }
  return queue;
};

const closeQueue = async () => {
  if (queue) {
    await queue.close();
    queue = null;
  }
};

module.exports = { getNotificationQueue, getRedisConnection, closeQueue };
