const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:3001";
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET;

const getHeaders = () => ({
  "Content-Type": "application/json",
  ...(AI_SERVICE_SECRET ? { "X-Service-Key": AI_SERVICE_SECRET } : {}),
});

// ─── Index activities ────────────────────────────────────────────────────────

const indexActivities = async (activities) => {
  const clean = activities.map((a) => ({
    activityId: a.activityId,
    activityName: a.activityName,
    description: a.description,
    location: a.location,
    startTime: a.startTime ? new Date(a.startTime).toISOString() : null,
    endTime: a.endTime ? new Date(a.endTime).toISOString() : null,
    registrationDeadline: a.registrationDeadline
      ? new Date(a.registrationDeadline).toISOString()
      : null,
    organizationName: a.organization?.organizationName || null,
    categoryName: a.category?.categoryName || null,
  }));

  await axios.post(`${AI_SERVICE_URL}/api/rag/index-activities`, { activities: clean }, { headers: getHeaders() });
};

// ─── Index organizations ─────────────────────────────────────────────────────

const indexOrganizations = async (organizations) => {
  const clean = organizations.map((o) => ({
    organizationId: o.organizationId,
    organizationName: o.organizationName,
    description: o.description,
    organizationType: o.organizationType,
  }));

  await axios.post(
    `${AI_SERVICE_URL}/api/rag/index-organizations`,
    { organizations: clean },
    { headers: getHeaders() }
  );
};

// ─── Re-index all ────────────────────────────────────────────────────────────

const reindexAll = async () => {
  const { default: prisma } = require("../../config/prisma");

  const [activities, organizations] = await Promise.all([
    prisma.activity.findMany({
      where: { isDeleted: false },
      include: {
        organization: { select: { organizationName: true } },
        category: { select: { categoryName: true } },
      },
    }),
    prisma.organization.findMany({
      where: { isDeleted: false },
      select: {
        organizationId: true,
        organizationName: true,
        description: true,
        organizationType: true,
      },
    }),
  ]);

  const cleanActivities = activities.map((a) => ({
    activityId: a.activityId,
    activityName: a.activityName,
    description: a.description,
    location: a.location,
    startTime: a.startTime ? new Date(a.startTime).toISOString() : null,
    endTime: a.endTime ? new Date(a.endTime).toISOString() : null,
    registrationDeadline: a.registrationDeadline
      ? new Date(a.registrationDeadline).toISOString()
      : null,
    organizationName: a.organization?.organizationName || null,
    categoryName: a.category?.categoryName || null,
  }));

  const { data } = await axios.post(
    `${AI_SERVICE_URL}/api/rag/reindex-all`,
    { activities: cleanActivities, organizations },
    { headers: getHeaders() }
  );
  return data.data;
};

module.exports = { indexActivities, indexOrganizations, reindexAll };
