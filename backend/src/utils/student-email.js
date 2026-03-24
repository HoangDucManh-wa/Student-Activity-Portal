const { getConfig } = require("../modules/system-config/system-config.service");
const { CONFIG_KEYS } = require("./constants");

/**
 * Check if an email belongs to an allowed student email domain.
 *
 * Matching rule: the email domain must end with one of the configured domains.
 * Example: "hust.edu.vn" matches suffix "edu.vn" and also exact "hust.edu.vn".
 *
 * @param {string} email
 * @returns {Promise<boolean>}
 */
const isStudentEmail = async (email) => {
  const config = await getConfig(CONFIG_KEYS.STUDENT_ALLOWED_DOMAINS);
  const domains = config?.domains;

  if (!Array.isArray(domains) || domains.length === 0) return true;

  const emailDomain = email.split("@")[1]?.toLowerCase();
  if (!emailDomain) return false;

  return domains.some((allowed) => {
    const d = allowed.toLowerCase();
    return emailDomain === d || emailDomain.endsWith(`.${d}`);
  });
};

/**
 * Synchronous check against a pre-fetched domain list.
 * Use when you already have the domain array (avoids extra DB/cache round-trip).
 *
 * @param {string} email
 * @param {string[]} domains
 * @returns {boolean}
 */
const isStudentEmailSync = (email, domains) => {
  if (!Array.isArray(domains) || domains.length === 0) return true;

  const emailDomain = email.split("@")[1]?.toLowerCase();
  if (!emailDomain) return false;

  return domains.some((allowed) => {
    const d = allowed.toLowerCase();
    return emailDomain === d || emailDomain.endsWith(`.${d}`);
  });
};

module.exports = { isStudentEmail, isStudentEmailSync };
