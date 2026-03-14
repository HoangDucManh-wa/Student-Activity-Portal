const Joi = require("joi");

/**
 * Create Organization
 */

const createOrganizationSchema = Joi.object({
  organizationName: Joi.string().min(3).max(255).required(),

  organizationType: Joi.string().min(2).max(100).required(),

  logoUrl: Joi.string().uri().allow("", null),

  coverImageUrl: Joi.string().uri().allow("", null),

  description: Joi.string().allow("", null),
});

/**
 * Update Organization
 */

const updateOrganizationSchema = Joi.object({
  organizationName: Joi.string().min(3).max(255),

  organizationType: Joi.string().min(2).max(100),

  logoUrl: Joi.string().uri().allow("", null),

  coverImageUrl: Joi.string().uri().allow("", null),

  description: Joi.string().allow("", null),
});

module.exports = {
  createOrganizationSchema,
  updateOrganizationSchema,
};
