const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.message || "Lỗi hệ thống";

  if (process.env.NODE_ENV === "development") {
    console.error(`[${code}] ${req.method} ${req.originalUrl} - ${message}`);
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    code,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
