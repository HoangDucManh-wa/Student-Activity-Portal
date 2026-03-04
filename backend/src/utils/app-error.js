const ERROR_CODES = require("./error-codes");

class AppError extends Error {
  constructor(code, overrideMessage) {
    const def = ERROR_CODES[code] || ERROR_CODES.INTERNAL_ERROR;
    super(overrideMessage || def.message);
    this.code = code;
    this.statusCode = def.statusCode;
  }
}

module.exports = AppError;
