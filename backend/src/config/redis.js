const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: true,
});

const connectRedis = async () => {
  try {
    await redis.connect();
    console.log("Redis connected");
  } catch (error) {
    console.error("Redis connection error:", error.message);
    process.exit(1);
  }
};

const disconnectRedis = async () => {
  await redis.quit();
  console.log("Redis disconnected");
};

process.on("SIGINT", disconnectRedis);
process.on("SIGTERM", disconnectRedis);

module.exports = { redis, connectRedis, disconnectRedis };
