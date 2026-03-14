const {
  createOrganizationService,
  getOrganizationsService,
  getOrganizationByIdService,
  updateOrganizationService,
  deleteOrganizationService,
} = require("./organizations.service");

/**
 * ======================================
 * Create Organization
 * ======================================
 */
const createOrganizationController = async (req, res, next) => {
  try {
    const organization = await createOrganizationService(req.body);

    res.status(201).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ======================================
 * Get Organizations
 * ======================================
 */
const getOrganizationsController = async (req, res, next) => {
  try {
    const organizations = await getOrganizationsService();

    res.json({
      success: true,
      data: organizations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ======================================
 * Get Organization By ID
 * ======================================
 */
const getOrganizationByIdController = async (req, res, next) => {
  try {
    const { organizationId } = req.params;

    const organization = await getOrganizationByIdService(
      Number(organizationId),
    );

    res.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ======================================
 * Update Organization
 * ======================================
 */
const updateOrganizationController = async (req, res, next) => {
  try {
    const { organizationId } = req.params;

    const organization = await updateOrganizationService(
      Number(organizationId),
      req.body,
    );

    res.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ======================================
 * Delete Organization (Soft Delete)
 * ======================================
 */
const deleteOrganizationController = async (req, res, next) => {
  try {
    const { organizationId } = req.params;

    await deleteOrganizationService(Number(organizationId));

    res.json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrganizationController,
  getOrganizationsController,
  getOrganizationByIdController,
  updateOrganizationController,
  deleteOrganizationController,
};
