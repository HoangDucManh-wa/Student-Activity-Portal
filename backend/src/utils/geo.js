/**
 * Geo utilities — Haversine distance calculation
 * All coordinates are in decimal degrees (WGS84).
 * Returns distance in meters.
 */

const EARTH_RADIUS_M = 6_371_071;

/**
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in meters
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_M * c;
}

/**
 * @param {number} userLat
 * @param {number} userLon
 * @param {number} venueLat
 * @param {number} venueLon
 * @param {number} radiusMeters
 * @returns {boolean}
 */
function isWithinRadius(userLat, userLon, venueLat, venueLon, radiusMeters) {
  return haversineDistance(userLat, userLon, venueLat, venueLon) <= radiusMeters;
}

module.exports = { haversineDistance, isWithinRadius };
