const { randomBytes } = require("crypto");

/**
 * Generate custom VARCHAR(50) ID with optional prefix.
 * e.g. generateId("ND") => "ND_A3F9C2B1E4D7820F6A5B"
 */
const generateId = (prefix = "") => {
  const hex = randomBytes(10).toString("hex").toUpperCase();
  return prefix ? `${prefix}_${hex}` : hex;
};

module.exports = { generateId };
