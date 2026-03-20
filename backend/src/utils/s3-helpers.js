const { getPresignedReadUrl } = require("../modules/uploads/upload.service");

/**
 * Check if a string looks like an S3 key (not a full URL).
 * S3 keys: "avatars/1742-abc123-photo.jpg"
 * Full URLs: "https://..." or "http://..."
 */
const isS3Key = (value) => {
  if (!value || typeof value !== "string") return false;
  return !value.startsWith("http://") && !value.startsWith("https://");
};

/**
 * Replace an S3 key with a presigned read URL in-place.
 * If the value is already a full URL or null, leave it unchanged.
 *
 * @param {object} obj - The object to mutate
 * @param {string} field - The field name containing the S3 key
 */
const resolveField = async (obj, field) => {
  if (!obj || !isS3Key(obj[field])) return;
  obj[field] = await getPresignedReadUrl(obj[field]);
};

/**
 * Resolve multiple fields on a single object.
 *
 * @param {object} obj
 * @param {string[]} fields - e.g. ["avatarUrl", "coverImage"]
 */
const resolveFields = async (obj, fields) => {
  if (!obj) return;
  await Promise.all(fields.map((f) => resolveField(obj, f)));
};

/**
 * Resolve image fields for an array of objects.
 *
 * @param {object[]} items
 * @param {string[]} fields
 */
const resolveArrayFields = async (items, fields) => {
  if (!items || !Array.isArray(items)) return;
  await Promise.all(items.map((item) => resolveFields(item, fields)));
};

/**
 * Resolve nested image fields.
 * Example: resolveNested(activity, "organization", ["logoUrl"])
 *
 * @param {object} obj - Parent object
 * @param {string} nestedKey - Key of the nested object
 * @param {string[]} fields - Fields within the nested object
 */
const resolveNested = async (obj, nestedKey, fields) => {
  if (!obj || !obj[nestedKey]) return;
  await resolveFields(obj[nestedKey], fields);
};

module.exports = {
  isS3Key,
  resolveField,
  resolveFields,
  resolveArrayFields,
  resolveNested,
};
