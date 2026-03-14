const prisma = require("../../config/prisma");

/**
 * ======================================
 * Create Organization
 * ======================================
 */
const createOrganizationService = async (data) => {
  return prisma.organization.create({
    data: {
      organizationName: data.organizationName,
      organizationType: data.organizationType,
      logoUrl: data.logoUrl,
      coverImageUrl: data.coverImageUrl,
      description: data.description,
    },
  });
};

/**
 * ======================================
 * Get Organizations
 * ======================================
 */
const getOrganizationsService = async () => {
  return prisma.organization.findMany({
    where: {
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * ======================================
 * Get Organization By ID
 * ======================================
 */
const getOrganizationByIdService = async (organizationId) => {
  return prisma.organization.findFirst({
    where: {
      organizationId,
      isDeleted: false,
    },
  });
};

/**
 * ======================================
 * Update Organization
 * ======================================
 */
const updateOrganizationService = async (organizationId, data) => {
  return prisma.organization.update({
    where: {
      organizationId,
    },
    data: {
      organizationName: data.organizationName,
      organizationType: data.organizationType,
      logoUrl: data.logoUrl,
      coverImageUrl: data.coverImageUrl,
      description: data.description,
      updatedAt: new Date(),
    },
  });
};

/**
 * ======================================
 * Soft Delete Organization
 * ======================================
 */
const deleteOrganizationService = async (organizationId) => {
  return prisma.organization.update({
    where: {
      organizationId,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
};

module.exports = {
  createOrganizationService,
  getOrganizationsService,
  getOrganizationByIdService,
  updateOrganizationService,
  deleteOrganizationService,
};
