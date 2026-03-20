/**
 * Redis cache utility.
 *
 * Usage:
 *   const cached = await cache.get("activities:list:page1")
 *   if (cached) return cached
 *   const data = await db.query(...)
 *   await cache.set("activities:list:page1", data, 300)  // 5 min TTL
 *   return data
 */

const { redis } = require("../config/redis");

const REDIS_PREFIX = {
  ACTIVITIES_LIST: "cache:activities:list:",
  ACTIVITY_DETAIL: "cache:activities:detail:",
  ORGS_LIST: "cache:orgs:list:",
  ORG_DETAIL: "cache:orgs:detail:",
  CATEGORIES: "cache:categories",
  IMAGE: "cache:img:",
  SYSTEM_CONFIG: "cache:config:",
};

const DEFAULT_TTL = 300; // 5 minutes

/**
 * Get cached value (returns parsed JSON or null).
 */
async function get(key) {
  try {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Set cache with optional TTL (seconds).
 */
async function set(key, value, ttl = DEFAULT_TTL) {
  try {
    const serialized = JSON.stringify(value);
    if (ttl > 0) {
      await redis.setex(key, ttl, serialized);
    } else {
      await redis.set(key, serialized);
    }
  } catch {
    // Cache write failure is non-critical
  }
}

/**
 * Delete a specific cache key.
 */
async function del(key) {
  try {
    await redis.del(key);
  } catch {
    // Ignore
  }
}

/**
 * Invalidate all keys matching a prefix pattern.
 * Uses SCAN for safety (no KEYS in production).
 */
async function invalidateByPrefix(prefix) {
  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", `${prefix}*`, "COUNT", 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  } catch {
    // Ignore
  }
}

/**
 * Build a deterministic cache key from query params.
 */
function buildListKey(prefix, params) {
  const sorted = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return `${prefix}${sorted || "default"}`;
}

module.exports = {
  REDIS_PREFIX,
  DEFAULT_TTL,
  get,
  set,
  del,
  invalidateByPrefix,
  buildListKey,
};
