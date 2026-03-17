const Joi = require("joi");

const createCategorySchema = Joi.object({
  categoryName: Joi.string().trim().min(2).max(255).required(),
});

const updateCategorySchema = Joi.object({
  categoryName: Joi.string().trim().min(2).max(255),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
