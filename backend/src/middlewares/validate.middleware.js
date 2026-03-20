const AppError = require("../utils/app-error");
// Import class lỗi custom để ném lỗi khi validation thất bại

// Middleware validate dữ liệu body
// schema ở đây thường là schema của Zod
const validate = (schema) => (req, res, next) => {
  // Kiểm tra dữ liệu req.body có đúng schema không
  const result = schema.safeParse(req.body);

  // Nếu dữ liệu không hợp lệ
  if (!result.success) {
    // Ném lỗi validation
    // result.error.errors chứa danh sách lỗi
    // lấy message của lỗi đầu tiên
    throw new AppError("VALIDATION_ERROR", result.error.errors[0]?.message);
  }

  // Nếu dữ liệu hợp lệ
  // Zod sẽ trả về dữ liệu đã được parse / sanitize
  req.body = result.data;

  // cho request đi tiếp tới middleware hoặc controller
  next();
};

// Middleware validate dữ liệu query (tham số trên URL)
const validateQuery = (schema) => (req, res, next) => {
  // Kiểm tra dữ liệu req.query có đúng schema không
  const result = schema.safeParse(req.query);

  // Nếu query không hợp lệ
  if (!result.success) {
    // Ném lỗi validation
    throw new AppError("VALIDATION_ERROR", result.error.errors[0]?.message);
  }

  // Nếu hợp lệ thì thay req.query bằng dữ liệu đã parse
  req.query = result.data;

  // tiếp tục sang middleware / controller tiếp theo
  next();
};

// Middleware validate dữ liệu params (route params)
const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);

  if (!result.success) {
    throw new AppError("VALIDATION_ERROR", result.error.errors[0]?.message);
  }

  req.params = result.data;
  next();
};

// export middleware validate
module.exports = validate;

// export thêm middleware validateQuery, validateParams
module.exports.validateQuery = validateQuery;
module.exports.validateParams = validateParams;
