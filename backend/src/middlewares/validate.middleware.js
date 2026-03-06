const AppError = require("../utils/app-error");

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      result.error.errors[0]?.message
    );
  }

  req.body = result.data;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      result.error.errors[0]?.message
    );
  }

  req.query = result.data;
  next();
};

module.exports = validate;
module.exports.validateQuery = validateQuery;
